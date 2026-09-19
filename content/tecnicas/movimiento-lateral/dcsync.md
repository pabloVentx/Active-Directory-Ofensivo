---
title: DCSync
resumen: Simular a un DC y pedirle a otro DC una réplica de todos los hashes del dominio, sin tocar el DC físicamente.
tags: impacket, netexec, mimikatz
---

## Definición

El ataque se basa en la funcionalidad legítima de replicación de directorio entre Controladores de Dominio. El protocolo MS-DRSR (*Microsoft Directory Replication Service Remote Protocol*) permite a un DC obtener actualizaciones de datos de otro DC. Con el permiso adecuado (`DS-Replication-Get-Changes-All`, normalmente reservado a Domain Admins, Enterprise Admins y la propia cuenta de máquina de los DCs), un atacante puede simular una solicitud de replicación y recuperar **todos** los hashes de contraseñas del dominio, sin necesitar acceso físico ni administrativo al servidor DC en sí.

## Cuándo se usa

Cuando ya se controla una cuenta con privilegios de replicación (Domain Admin, Enterprise Admin, o una cuenta a la que se le haya delegado ese permiso concreto por error de configuración). Es habitualmente uno de los últimos pasos de una escalada, ya que da acceso a absolutamente todas las credenciales del dominio, incluida `krbtgt` — la llave para un Golden Ticket.

## Requisitos previos

- Cuenta con el permiso `DS-Replication-Get-Changes-All` (y `DS-Replication-Get-Changes`) sobre el objeto de dominio.
- Conectividad LDAP (389/636) con el DC.

## Desarrollo del ataque

1. Confirmar que la cuenta actual tiene privilegios de replicación (vía [[bloodhound|BloodHound]] o revisando las ACLs del objeto dominio).
2. Lanzar la simulación de replicación contra el DC.
3. Recuperar el volcado completo de hashes del dominio, incluido `krbtgt`.
4. Reutilizar cualquiera de esos hashes vía Pass the Hash, o usar el de `krbtgt` para fabricar un Golden Ticket.

```bash
# impacket-secretsdump en modo DCSync remoto
impacket-secretsdump 'dominio.local/USER:PASSWORD'@IP_DC

# netexec, atajo directo para el volcado NTDS vía DCSync
nxc smb IP_DC -u USER -p 'PASSWORD' --ntds
```

```powershell
# mimikatz, sobre todo el dominio
lsadump::dcsync /domain:<DominioFQDN> /all
```

## Herramientas relacionadas

- Ver [[impacket]] (secretsdump)
- Ver [[netexec]]
- Ver [[mimikatz]]

## Detección y mitigación

Restringir al mínimo imprescindible las cuentas con `DS-Replication-Get-Changes-All` fuera de los DCs y grupos de administración de dominio, y monitorizar el evento 4662 correspondiente a solicitudes de replicación desde orígenes que no son controladores de dominio legítimos.
