---
title: evil-winrm
resumen: Cliente para conectar e interactuar por WinRM (5985/5986) con una sesión de PowerShell remota.
tags: remote-access
---

**WinRM** (*Windows Remote Management*) es el servicio de administración remota de Microsoft basado en SOAP que permite ejecutar comandos y sesiones de PowerShell de forma remota. Viene habilitado por defecto desde **Windows Server 2012**; en clientes (Windows 10/11) o versiones anteriores requiere configuración manual y excepción de firewall. Usa los puertos **5985** (HTTP) y **5986** (HTTPS).

**evil-winrm** es el cliente de referencia para conectarse: da una sesión de PowerShell interactiva completa contra el objetivo.

```bash
# Login con usuario y contraseña
evil-winrm -u usuario -p contraseña -i IP

# Login por Pass the Hash (NTLM/NT hash)
evil-winrm -u '' -p 'HASH NTLM' -i IP
```

| Flag | Descripción |
|---|---|
| `-u` | Nombre de usuario con el que autenticar |
| `-p` | Contraseña (o hash, en el caso de PtH) |
| `-i` | IP del equipo Windows objetivo |

### Técnicas donde aparece

[[pass-the-hash]] · [[conectarse-por-winrm]]
