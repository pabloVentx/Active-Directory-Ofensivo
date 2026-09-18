---
title: Password Spraying
resumen: Probar una única contraseña (o pocas) contra muchos usuarios para evitar bloqueos por intentos fallidos.
tags: netexec
---

## Definición

Ataque en el que se prueba una contraseña única (o un conjunto muy pequeño de contraseñas típicas/estacionales) contra una lista amplia de usuarios del dominio, en lugar de probar muchas contraseñas contra un único usuario. Esto evita disparar los bloqueos de cuenta por intentos fallidos repetidos, que sí saltarían con fuerza bruta tradicional.

## Cuándo se usa

Cuando ya se dispone de una wordlist de usuarios del dominio (por ejemplo, obtenida por `--rid-brute` o `kerbrute`) y se sospecha de una política de contraseñas débil o de contraseñas estacionales/corporativas predecibles (`Empresa2026!`, etc.).

## Requisitos previos

- Wordlist de usuarios válidos o probables del dominio.
- Conocer o estimar la política de bloqueo de cuentas del dominio, para no superar el umbral de intentos y provocar bloqueos masivos.

## Desarrollo del ataque

1. Preparar la wordlist de usuarios.
2. Elegir una o pocas contraseñas candidatas coherentes con la política/contexto de la empresa.
3. Lanzar el spray dejando un margen de tiempo entre rondas si el umbral de bloqueo es bajo.
4. Confirmar los usuarios válidos y, si se puede, repetir la enumeración de shares/privilegios con la credencial encontrada.

```bash
# Contraseña única contra una lista de usuarios (fuerza bruta cruzada desactivada)
nxc smb 10.10.10.10 -u "dic_users.txt" -p "PASS" --continue-on-success
```

## Herramientas relacionadas

- Ver [[netexec]]

## Detección y mitigación

Configurar umbrales de bloqueo de cuenta razonables, activar Smart Lockout o equivalente, y correlacionar en el SIEM intentos de autenticación fallidos contra múltiples cuentas distintas desde un mismo origen en una ventana de tiempo corta (patrón típico de spraying, distinto del de fuerza bruta clásica).
