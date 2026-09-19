---
title: Enumeración LDAP
resumen: Consultar directamente el directorio (usuarios, grupos, ACLs, objetos borrados) vía LDAP/LDAPS.
tags: ldap-tools
---

## Definición

Enumeración realizada contra el propio protocolo LDAP (puertos 389/636), que es el que expone toda la base de datos del directorio: usuarios, grupos, atributos, permisos (ACLs) e incluso objetos ya eliminados. A diferencia de SMB/RPC, aquí se consulta directamente el árbol LDAP, lo que da acceso a mucho más detalle y, con las herramientas adecuadas, a poder escribir sobre el directorio.

## Cuándo se usa

En paralelo o justo después de la enumeración SMB/RPC, sobre todo cuando ya se dispone de un usuario válido del dominio (aunque una consulta anónima básica también suele funcionar). Es clave antes de plantear ataques de escalada por ACLs o de credenciales (AS-REP Roasting, Kerberoasting), ya que permite identificar los usuarios candidatos.

## Requisitos previos

- Conectividad al puerto 389 (o 636 para LDAPS).
- Credenciales válidas de dominio para consultas completas; algunas consultas anónimas básicas pueden funcionar según la configuración.

## Desarrollo del ataque

1. Lanzar una consulta anónima o autenticada básica para confirmar que el LDAP responde y sacar el `userPrincipalName` de todos los usuarios.
2. Enumerar grupos y su membresía.
3. Volcar un dump completo del dominio en HTML/JSON para revisarlo con calma fuera de la CLI.
4. Con una herramienta orientada a escalada (`bloodyAD`), consultar qué objetos son escribibles por el usuario actual — la antesala de un abuso de ACL.

```bash
# Enumeración de usuarios sin credenciales
ldapsearch -x -H 'ldap://10.10.10.10' -b "DC=domain,DC=local" "(objectClass=user)" userPrincipalName

# Enumeración de usuarios con credenciales
ldapsearch -x -H ldap://10.10.10.10 -D "USER@domain.local" -w "PASSWORD" -b "DC=DOMAIN,DC=LOCAL" "(objectClass=user)" userPrincipalName

# Dump completo del dominio a HTML/JSON
ldapdomaindump -u 'dominio\usuario' -p 'contraseña' 10.10.10.10

# Consultar permisos de escritura sobre objetos (bloodyAD)
bloodyAD -u usuario -p 'contraseña' -d dominio.local --host IP get writable --detail
```

## Herramientas relacionadas

- Ver [[ldap-tools]]
- Ver [[netexec]]

## Detección y mitigación

Limitar las consultas LDAP anónimas (`dsHeuristics`), forzar LDAP *signing* y *channel binding* para evitar relay contra LDAP/LDAPS, y auditar consultas masivas o poco habituales contra el árbol del directorio desde cuentas de usuario estándar.
