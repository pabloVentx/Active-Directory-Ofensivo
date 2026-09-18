---
title: Abuso de ACLs
resumen: Explotar permisos mal configurados sobre objetos del directorio para escalar sin exploits ni contraseñas.
tags: bloodhound, ldap-tools, powersploit
---

## Definición

Cada objeto de Active Directory (usuarios, grupos, equipos, OUs) tiene una lista de control de acceso (ACL/DACL) que define quién puede leer o modificar sus atributos. En entornos grandes es habitual que, por delegaciones históricas o mala praxis, un usuario de bajo privilegio tenga permisos peligrosos sobre un objeto más valioso: por ejemplo, poder resetear la contraseña de otro usuario, añadirse a un grupo privilegiado, o modificar el propio DACL de un objeto (`WriteDACL`) para concederse cualquier permiso después. Ninguno de estos permisos es un "bug": son delegaciones legítimas mal alcanzadas.

## Cuándo se usa

Como parte natural del análisis de rutas de ataque con BloodHound: en cuanto aparece una arista de control (`GenericAll`, `GenericWrite`, `WriteDACL`, `WriteOwner`, `ForceChangePassword`, `AddMember`...) desde un objeto que ya controlas hacia otro más privilegiado, hay una vía de escalada sin necesidad de crackear nada.

## Requisitos previos

- Credenciales válidas de un usuario del dominio.
- Haber identificado el permiso abusable, normalmente vía BloodHound (`Outbound Object Control`) o consultando ACLs directamente por LDAP.

## Desarrollo del ataque

1. Enumerar las ACLs del objeto propio y de los objetos accesibles, buscando permisos interesantes hacia cuentas o grupos de mayor privilegio.
2. Identificar el tipo de permiso concreto y su abuso asociado (algunos ejemplos típicos):
   - `GenericAll` / `GenericWrite` sobre un usuario → resetear su contraseña o forzar un SPN para Kerberoastearlo.
   - `WriteDACL` sobre un objeto → concederse `GenericAll` sobre él directamente.
   - `AddMember` sobre un grupo → añadirse uno mismo a ese grupo.
   - `GenericWrite` sobre un equipo → abusar de delegación restringida basada en recursos (RBCD) para suplantar cualquier usuario ante ese equipo.
3. Ejecutar la acción concreta.
4. Repetir el análisis desde el nuevo punto obtenido: el abuso de ACLs casi siempre es una cadena de varios saltos, no uno solo.

```bash
# Enumerar ACLs de un objeto concreto (PowerView)
Get-ObjectAcl -SamAccountName <Usuario> -ResolveGUIDs

# Escaneo automático de ACLs interesantes en todo el dominio
Invoke-ACLScanner -ResolveGUIDs
```

```bash
# Ejemplo de abuso: resetear la contraseña de otro usuario con permiso ForceChangePassword (bloodyAD)
bloodyAD -u usuario -p 'contraseña' -d dominio.local --host IP set password usuario_objetivo 'NuevaContraseña123!'
```

## Herramientas relacionadas

- Ver [[bloodhound]]
- Ver [[ldap-tools]] (bloodyAD)
- Ver [[powersploit]] (PowerView)

## Detección y mitigación

Auditar periódicamente las ACLs del dominio (la propia BloodHound sirve como herramienta de higiene desde el lado defensivo), eliminar delegaciones heredadas que ya no tengan sentido de negocio, y monitorizar eventos de modificación de ACLs (4662) y de membresía de grupos privilegiados (4728/4732/4756).
