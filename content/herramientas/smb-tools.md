---
title: Herramientas SMB (smbclient / smbmap / rpcclient)
resumen: El trío clásico para listar, navegar y descargar de recursos compartidos SMB, más enumeración RPC.
tags: enumeration
---

## smbclient

Herramienta de Samba para listar y conectarse a recursos compartidos en red por el puerto 445.

```bash
# Listar shares
smbclient -U "%" -L IP -N              # Sesión nula
smbclient -N -L //IP                   # Anónimo/invitado
smbclient -U "usuario%contraseña" -L IP # Usuario válido
```

```bash
# Conectarse a un recurso
smbclient //IPvictima/nombreRecurso -U "usuario%contraseña"
smbclient -U "%" \\\\IPvictima\\nombreRecurso                     # Sesión nula
smbclient //IPvictima/nombreRecurso -U 'usuario%hash' --pw-nt-hash # Pass the Hash
impacket-smbclient -k -no-pass FQDN                                # Pass the Ticket
```

```bash
# Comandos internos
ls -a          # listar directorio actual
put file.txt   # subir archivo
get file.txt   # descargar archivo
!<comando>     # ejecutar comando local del atacante
```

## smbmap

Enumera shares como invitado u otro usuario, y permite indagar/descargar archivos en un solo paso.

```bash
smbmap -H IP_VICTIMA -u "guest" -p "" -r
smbmap -H IP_VICTIMA -u "usuario" -p "contraseña" -r

# Descargar un archivo directamente
smbmap -H IP_VICTIMA -u "usuario" -p "contraseña" --download share/ruta/Archivo
```

## rpcclient

Parte del conjunto de Samba, ejecuta funciones **MS-RPC** por el puerto 135. Se usa para enumerar usuarios y grupos, y realizar cambios sobre ellos.

```bash
# Sesión nula / invitado / usuario válido
rpcclient -U "" -N IP/dom
rpcclient -U "guest" -N IP/dom
rpcclient -U guest%123123 IP/dom

# Ejecutar un comando puntual desde CLI
rpcclient -U "" -N IP/dom -c 'comando'
```

```bash
# Listar usuarios con su RID y descripción
for rid in $(rpcclient -U "dominio.local\usuario%Contraseña" IP -c 'enumdomusers' | grep -oP '\[.*?\]' | grep '0x' | tr -d '[]'); do
  echo -e "\n[+] RID $rid:\n"
  rpcclient -U "dominio.local\usuario%Contraseña" IP -c "queryuser $rid" | grep -E -i "user name|description"
done
```

| Comando | Descripción |
|---|---|
| `srvinfo` | Información del servidor |
| `querydominfo` | Información del dominio/servidor/usuario |
| `enumdomains` | Enumera dominios implementados |
| `enumdomusers` | Enumera todos los usuarios del dominio |
| `queryuser RID` | Información de un usuario concreto |
| `enumdomgroups` | Enumera todos los grupos del dominio |
| `querygroup RID` | Información de un grupo concreto |
| `netshareenumall` | Enumera todos los shares disponibles |
| `netsharegetinfo SHARE` | Información de un share concreto |

### Técnicas donde aparece

[[enumeracion-smb-rpc]] · [[malicious-scf-file]]
