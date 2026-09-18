---
title: Abuso de GPP (Group Policy Preferences)
resumen: Recuperar contraseñas en claro cifradas con una clave AES que Microsoft publicó públicamente.
tags: impacket, gpp-decrypt
---

## Definición

Antiguamente, las GPP (*Group Policy Preferences*) permitían a los administradores definir contraseñas (por ejemplo, para crear usuarios locales o mapear unidades de red) directamente en archivos XML de configuración, almacenados en el share **SYSVOL**. Microsoft cifraba ese campo (`cpassword`) con AES-256, pero usando una **clave de cifrado estática que publicó públicamente** en su propia documentación — lo que convierte ese cifrado en un simple *encoding* reversible por cualquiera.

## Cuándo se usa

Contra cualquier dominio que conserve GPPs antiguas sin depurar (la vulnerabilidad, MS14-025, está parcheada desde 2014 a nivel de creación de nuevas GPPs, pero no borra retroactivamente las que ya existían). Merece la pena revisarlo siempre, es gratis: solo hace falta lectura sobre SYSVOL, que cualquier usuario autenticado tiene por defecto.

## Requisitos previos

- Usuario autenticado en el dominio con permisos de lectura sobre el recurso compartido **SYSVOL** del controlador de dominio (permiso por defecto para "Authenticated Users").

## Desarrollo del ataque

1. Buscar en SYSVOL archivos XML susceptibles de contener contraseñas: `Groups.xml`, `Services.xml`, `ScheduledTasks.xml`, entre otros.
2. Localizar el atributo `cpassword` dentro de esos ficheros.
3. Descifrar el valor con la clave AES pública de Microsoft.
4. Reutilizar la contraseña en claro obtenida (posible reutilización en otras cuentas locales del parque).

```bash
# Buscar la cadena "cpassword" en SYSVOL desde un cliente Windows del dominio
findstr /S /I cpassword \\<DOMAIN>\sysvol\<DOMAIN>\policies\*.xml
```

```bash
# Buscar y extraer las contraseñas de las GPP directamente con la herramienta de Impacket
Get-GPPPassword.py 'DOMAIN'/'USER':'PASSWORD'@'DOMAIN_CONTROLLER'

# Si ya se tiene el valor cpassword extraído a mano, descifrarlo
gpp-decrypt <cpassword_hash>
```

## Herramientas relacionadas

- Ver [[impacket]] (Get-GPPPassword)
- Ver [[gpp-decrypt]]

## Detección y mitigación

Auditar y eliminar cualquier GPP que siga usando el campo `cpassword` (Microsoft dejó de permitir crearlas desde MS14-025, pero no elimina las existentes), y sustituir por credenciales gestionadas (LAPS para contraseñas locales de administrador, cuentas de servicio gestionadas para el resto).
