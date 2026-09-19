---
title: wmiexec (Impacket)
resumen: Ejecuta cmd.exe en remoto instanciando el proceso vía WMI (puerto 135), a nivel local o de dominio.
tags: remote-access
---

Herramienta para conectarse a nivel local o de dominio, que requiere credenciales privilegiadas de administrador (o de un usuario con permisos suficientes sobre otro equipo). Funciona interactuando directamente con el protocolo **WMI** (*Windows Management Instrumentation*) a través del puerto **135** para instanciar el proceso `cmd.exe` en la máquina de destino.

```bash
# Conectarse mediante credenciales a nivel dominio
impacket-wmiexec dominio.local/usuario:'contraseña'@10.10.10.X

# Conectarse mediante credenciales a nivel local
impacket-wmiexec ./usuario:'contraseña'@10.10.10.X
impacket-wmiexec usuario:'contraseña'@10.10.10.X

# Conectarse mediante hash (NTLM/NT hash) a nivel dominio
impacket-wmiexec -hashes :hash dominio.local/usuario@10.10.10.X

# Conectarse mediante hash NTLM a nivel local
impacket-wmiexec -hashes :hash ./usuario@10.10.10.X
```

### Técnicas donde aparece

[[pass-the-hash]] · [[conectarse-por-rpc]]
