---
title: Enumeración de usuarios vía Kerberos
resumen: Validar nombres de usuario del dominio directamente contra el KDC (puerto 88), sin tocar SMB ni LDAP.
tags: kerbrute
---

## Definición

Técnica de enumeración que aprovecha que el KDC (puerto 88) responde de forma distinta según si un usuario existe o no en el dominio, sin necesidad de conocer contraseñas. Permite validar una wordlist de nombres de usuario de forma silenciosa respecto a otros métodos.

## Cuándo se usa

Cuando se dispone de una wordlist de posibles nombres de usuario (por ejemplo, generada por OSINT o por patrones de nomenclatura corporativa) y se quiere confirmar cuáles existen realmente en el dominio antes de lanzar un ataque de credenciales.

## Requisitos previos

- Conectividad al puerto 88 del DC.
- Una wordlist de usuarios candidatos.
- No hace falta ninguna credencial.

## Desarrollo del ataque

1. Lanzar la herramienta contra el DC con una wordlist de usuarios.
2. Esperar (el proceso es más lento que otras enumeraciones) y quedarse con los usuarios confirmados como válidos.
3. Usar esa lista depurada de usuarios reales como entrada para AS-REP Roasting, Kerberoasting o password spraying.

```bash
kerbrute userenum --dc IP_dominio -d dominio diccionario.txt
```

## Herramientas relacionadas

- Ver [[kerbrute]]

## Detección y mitigación

Monitorizar el DC en busca de picos de eventos Kerberos de tipo `AS-REQ` con `KDC_ERR_C_PRINCIPAL_UNKNOWN` (usuario no existe) provenientes de un mismo origen en poco tiempo, y aplicar limitación de peticiones o alertas a nivel de SIEM.
