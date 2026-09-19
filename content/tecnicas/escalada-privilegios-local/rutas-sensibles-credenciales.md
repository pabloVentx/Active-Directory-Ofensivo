---
title: Rutas sensibles con credenciales
resumen: Localizaciones típicas del sistema donde quedan contraseñas, historiales o configuraciones olvidadas.
tags: 
---

## Definición

No es un ataque en sí, sino un checklist de ubicaciones del sistema de archivos donde, por costumbre o por configuraciones automatizadas mal limpiadas, suelen quedar credenciales en texto claro: historiales de consola, ficheros de configuración de despliegue, backups de bases de datos, variables de entorno... Revisarlas sistemáticamente tras conseguir acceso a un equipo (Windows o Linux) es de lo más rentable en tiempo invertido de todo un pentest.

## Cuándo se usa

Nada más obtener una shell o acceso a un sistema de archivos (por SMB, por una webshell, por una shell interactiva), antes de recurrir a herramientas de escalada más pesadas. Es el primer sitio donde mirar.

## Requisitos previos

- Lectura sobre el sistema de archivos del equipo comprometido (no hace falta ser administrador).

## Desarrollo del ataque

1. Recorrer las rutas típicas según el sistema operativo.
2. Revisar el contenido en busca de contraseñas, cadenas de conexión o tokens.
3. Reutilizar lo encontrado: prueba de reutilización de contraseña en otras cuentas, movimiento lateral, o pivote directo a un privilegio mayor.

### Windows

| Ruta | Por qué interesa |
|---|---|
| `C:\Users\<usuario>\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt` | Guarda literalmente el historial de comandos de PowerShell de ese usuario — muy habitual encontrar aquí una contraseña que se tecleó por error en la consola (`net user ... /add`, una conexión con credenciales en línea, etc.) |
| `C:\Windows\Panther\Unattend.xml` (y variantes `Unattend.xml`, `sysprep.inf`, `sysprep.xml` en `C:\Windows\System32\sysprep\`) | Ficheros de respuesta de instalación desatendida de Windows; a veces incluyen la contraseña de administrador local en Base64 sin cifrar |

```powershell
# Buscar de un vistazo estos dos clásicos
type "C:\Users\sql_svc\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"
type C:\Windows\Panther\Unattend.xml
```

### Linux

| Ruta | Por qué interesa |
|---|---|
| `/var/www/html/**/.env`, `initialize.php`, `archivo.db` | Configuración de aplicaciones web: credenciales de base de datos, claves de API |
| `/var/www/mail` | Buzones de correo local, a veces con credenciales reenviadas por error |
| `/opt/crontabs/crontabs.db` | Tareas programadas que pueden revelar rutas y credenciales usadas por scripts automatizados |
| `/opt/apache/htdocs/` | Otro punto habitual de configuración web expuesta |
| `/usr/local/lib/erlang_login/start.escript` | Scripts de arranque de servicios que a veces embeben credenciales |
| `~/.bash_history` (del usuario actual, `/etc/root/.bash_history`, `/var/backups/.bash_history`) | Historial de shell — mismo razonamiento que `ConsoleHost_history.txt` en Windows |
| Variables de entorno (`env`) | Muchas aplicaciones pasan secretos por variable de entorno en vez de fichero de configuración |

```bash
# Historiales de bash típicos
ls -a ~ && cat ~/.bash_history
cat /etc/root/.bash_history 2>/dev/null
cat /var/backups/.bash_history 2>/dev/null

# Variables de entorno del proceso actual
env
```

## Herramientas relacionadas

Estas rutas suelen aparecer también señaladas automáticamente por scripts de enumeración como winPEAS (Windows) o LinPEAS (Linux), que merece la pena lanzar en paralelo a esta revisión manual.

## Detección y mitigación

Purgar historiales de consola y ficheros de respuesta de instalación tras el despliegue, evitar pasar credenciales por línea de comandos o variables de entorno en texto claro, y usar gestores de secretos (Vault, Credential Manager, KeePass gestionado) en vez de ficheros de configuración planos.
