---
title: Enumeración de usuarios y shares por SMB/RPC
resumen: Sacar usuarios, grupos, shares y validar credenciales usando SMB (445) y MSRPC (135), incluso con sesión nula.
tags: netexec, smb-tools
---

## Definición

Conjunto de técnicas para extraer información del dominio (usuarios, grupos, shares, sistema operativo, política de firmado SMB) directamente contra un host o contra el DC, apoyándose en el protocolo SMB (puerto 445) y en llamadas MS-RPC (puerto 135). Es habitualmente el primer contacto real con el dominio tras el escaneo de puertos.

## Cuándo se usa

Nada más terminar el reconocimiento de red, antes de tener ninguna credencial. Sirve tanto para enumerar en sesión nula/invitado como, más adelante, con credenciales ya válidas para sacar más detalle (SID, grupos, descripciones de cuentas).

## Requisitos previos

- Conectividad al puerto 445 (y opcionalmente 135) del objetivo.
- Ninguna credencial es estrictamente necesaria para empezar (sesión nula o `guest`); si el AD está bien bastionado, hará falta al menos un usuario válido.

## Desarrollo del ataque

1. Comprobar si el SMB firmado está deshabilitado y sacar nombre de dominio/equipo con una sesión nula.
2. Enumerar shares visibles con sesión nula, invitado o credenciales.
3. Si no hay lectura sobre ningún share, hacer fuerza bruta de RIDs (`--rid-brute`) para construir una wordlist de usuarios del dominio a partir del SID base.
4. Filtrar esa salida por `SidTypeUser` y extraer solo los nombres de cuenta.
5. Usar esa misma wordlist como usuarios y contraseñas (probar `usuario:usuario`) para localizar credenciales por reutilización o política débil.
6. Con un usuario válido, repetir la enumeración de shares y grupos para ver a qué se tiene acceso real.

```bash
# Enumeración base (versión, dominio, nombre local, firmado SMB)
nxc smb 10.10.10.10 -u "" -p ""

# Fuerza bruta de RIDs con sesión nula/guest -> wordlist de usuarios
nxc smb 10.10.10.10 -u "guest" -p "" --rid-brute > enumuser.txt
cat enumuser.txt | awk '{split($6, a, "\\\\"); print a[2]}' > wordlistUsers.txt

# Probar usuario=contraseña como ataque de fuerza bruta cruzada
nxc smb 10.10.10.10 -u "wordlistUsers.txt" -p "wordlistUsers.txt" --shares --continue-on-success --no-bruteforce -t 30

# rpcclient (puerto 135): listar usuarios por RID y descripción
rpcclient -U "" -N IP -c 'enumdomusers'
```

Ver también los comandos específicos de `smbclient` (listar/conectarse a shares, subir y bajar ficheros) y `smbmap` (listar y descargar en un solo paso) en la ficha de herramientas.

## Herramientas relacionadas

- Ver [[netexec]]
- Ver [[smb-tools]]

## Detección y mitigación

Habilitar la firma SMB obligatoria en todos los equipos (no solo en el DC), desactivar sesiones nulas y acceso anónimo a RPC, restringir la enumeración de RID (`RestrictAnonymous`), y monitorizar volúmenes altos de intentos de autenticación fallidos contra el mismo host en poco tiempo (indicio de fuerza bruta/spraying).
