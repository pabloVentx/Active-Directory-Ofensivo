---
title: Silver Ticket
resumen: Falsificar un TGS de un servicio concreto con su propio hash, sin pasar por el KDC en absoluto.
tags: impacket, mimikatz, rubeus
---

## Definición

Ticket de servicio de Kerberos (TGS) falsificado que permite a un atacante suplantar a cualquier usuario y obtener acceso no autorizado a un servicio específico dentro de una máquina objetivo (por ejemplo, un recurso compartido vía CIFS, una base de datos MSSQL, o administración remota por WMI). A diferencia del Golden Ticket, aquí no se necesita la clave de `krbtgt`: basta con comprometer la contraseña o el hash NT de la propia cuenta de servicio, lo que hace el ataque más silencioso porque ni siquiera implica comunicación con el KDC.

## Cuándo se usa

Cuando se ha comprometido el hash de una cuenta de servicio concreta (por ejemplo, vía Kerberoasting o un dump local) y se quiere acceso persistente y dirigido justo a ese servicio, sin necesidad de tocar `krbtgt` ni generar tráfico hacia el DC.

## Requisitos previos

- Hash NTLM o AES de la cuenta de servicio objetivo.
- SID del dominio.
- SPN exacto del servicio al que se quiere acceder.

## Desarrollo del ataque

1. Obtener el hash de la cuenta de servicio (Kerberoasting, dump local, etc.).
2. Obtener el SID del dominio y el SPN exacto del servicio objetivo.
3. Fabricar el TGS falsificado especificando el usuario a suplantar y el servicio.
4. Cargar el ticket y acceder directamente al servicio, sin pasar por el KDC.

```bash
# Generar el TGS falsificado firmándolo legítimamente con getST (requiere tener ya un Golden Ticket / TGT válido)
impacket-getST -spn 'CIFS/dc01.dominio.corp' -k -no-pass dominio.corp/usuario -debug
```

```powershell
# Rubeus, especificando directamente el hash de la cuenta de servicio
Rubeus.exe silver /rc4:HASH_NTLM_SERVICIO /domain:dominio.htb /sid:S-1-5-21-XXXX /user:Administrator /service:cifs/DC01.dominio.htb /ptt
```

## Herramientas relacionadas

- Ver [[impacket]] (getST)
- Ver [[mimikatz]]
- Ver [[rubeus]]

## Detección y mitigación

Rotar periódicamente las contraseñas de cuentas de servicio y usar cuentas gestionadas (gMSA) siempre que sea posible, y activar auditoría detallada en los servicios sensibles (CIFS, MSSQL, WMI) para detectar accesos con tickets que no encajan con el patrón habitual de autenticación del entorno.
