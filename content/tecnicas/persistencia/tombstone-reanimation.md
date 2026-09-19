---
title: Tombstone Reanimation Attack
resumen: Resucitar un objeto eliminado del directorio que aún conserva su antiguo SID y privilegios.
tags: ldap-tools
---

## Definición

Cuando se elimina un objeto de Active Directory (un usuario o un equipo, por ejemplo), no desaparece inmediatamente: pasa a un estado temporal llamado **Tombstone** (lápida), donde permanece un tiempo determinado antes de ser purgado definitivamente. Este ataque consiste en aprovechar un permiso mal configurado para **restaurar** ("reanimar") ese objeto mientras sigue en estado de lápida. Al restaurarlo, el atacante recupera el control de esa cuenta con sus privilegios y, en muchos casos, su SID original — incluyendo membresías de grupo previas si no se han limpiado correctamente.

## Cuándo se usa

Cuando se identifica un objeto eliminado recientemente que perteneció a una cuenta con privilegios interesantes, y se dispone de permisos de escritura sobre el contenedor `Deleted Objects` del dominio (delegación habitualmente reservada a administradores, pero susceptible de estar mal configurada).

## Requisitos previos

- Permisos de escritura/restauración sobre el contenedor `CN=Deleted Objects` del dominio.
- El objeto a reanimar debe seguir dentro de la ventana de vida del Tombstone (por defecto, 180 días).

## Desarrollo del ataque

1. Buscar objetos eliminados dentro del contenedor `Deleted Objects`.
2. Identificar un objeto de interés (por ejemplo, una cuenta que perteneció a un grupo privilegiado).
3. Restaurar el objeto.
4. Recuperar el control sobre la cuenta reanimada (reset de contraseña si es necesario) y comprobar qué privilegios conserva.

```bash
# Buscar objetos eliminados en el dominio
bloodyAD -u usuario -p 'contraseña' -d dominio.local --host IP get children --target 'CN=Deleted Objects,DC=dominio,DC=local'

# Restaurar un objeto eliminado concreto
bloodyAD -u usuario -p 'contraseña' -d dominio.local --host IP set restore "CN=Usuario Borrado\0ADEL:GUID,CN=Deleted Objects,DC=dominio,DC=local"
```

## Herramientas relacionadas

- Ver [[ldap-tools]] (bloodyAD)

## Detección y mitigación

Restringir estrictamente quién tiene permisos de escritura sobre el contenedor `Deleted Objects`, limpiar membresías de grupo antes de eliminar cuentas privilegiadas definitivamente, y monitorizar eventos de restauración de objetos (4662 sobre ese contenedor específico).
