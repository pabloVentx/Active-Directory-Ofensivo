---
title: Conectarse por RDP
resumen: Sesión gráfica interactiva sobre el equipo remoto, por el puerto 3389.
tags: rdp-tools, netexec
---

## Definición

Conexión por **RDP** (*Remote Desktop Protocol*, puerto 3389): la única de las cuatro vías de esta sección que da una sesión **gráfica** completa, en vez de una consola de comandos. Es la más "pesada" a nivel de red y de rastro (crea una sesión de usuario visible, escritorio incluido), pero también la más cómoda cuando hace falta interactuar con aplicaciones que no tienen equivalente por línea de comandos.

## Cuándo se usa

Cuando ya se dispone de credenciales (usuario/contraseña) válidas con permiso de inicio de sesión remoto sobre el equipo objetivo — por defecto, ser miembro de **Administradores** o del grupo **Remote Desktop Users**. También cuando se necesita ver o manipular algo gráficamente (un explorador de archivos, una aplicación de escritorio, un navegador ya logueado).

## Requisitos previos

- Usuario y contraseña válidos con permiso de RDP sobre el equipo objetivo.
- Puerto 3389 accesible. Si está cerrado pero se tiene ya acceso administrativo por otra vía (SMB/WinRM), se puede activar en remoto — ver más abajo.

## Desarrollo del ataque

1. Confirmar que el puerto 3389 está abierto y que el servicio RDP responde.
2. Si RDP está deshabilitado en el objetivo pero ya tienes credenciales administrativas por otra vía, actívalo primero con el módulo `rdp` de NetExec.
3. Conectarse con un cliente RDP desde terminal.

```bash
# Si RDP está deshabilitado y ya tienes admin por SMB, actívalo primero
nxc smb 10.10.10.10 -u "USER" -p 'PASSWORD' -M rdp -o ACTION=enable
```

```bash
xfreerdp3 /u:usuario /p:contraseña /v:ipVictima:puertoProtocolo
rdesktop IPvictima
```

4. Si el objetivo resulta vulnerable a fallos conocidos del propio protocolo (BlueKeep, CVE-2019-0708), evaluar explotación directa como alternativa a la autenticación con credenciales.

## Herramientas relacionadas

- Ver [[rdp-tools]]
- Ver [[netexec]] (módulo `rdp`, para activar el servicio en remoto si está apagado)

## Detección y mitigación

Restringir el acceso RDP a una VPN o *jump host*, exigir autenticación a nivel de red (NLA), limitar la pertenencia a Remote Desktop Users al mínimo imprescindible, y monitorizar inicios de sesión RDP (evento 4624 tipo 10) desde orígenes u horarios inusuales.
