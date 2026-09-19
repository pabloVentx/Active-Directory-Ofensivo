---
title: Envenenamiento LLMNR/NBT-NS (Responder)
resumen: Suplantar la resolución de nombres para que equipos de la red se autentiquen contra el atacante.
tags: responder, hashcat-john
---

## Definición

Cuando la resolución DNS normal falla (por ejemplo, un recurso compartido mal escrito o que ya no existe), Windows recurre a protocolos de resolución de nombres de respaldo como LLMNR y NBT-NS, que funcionan por *broadcast* en la red local sin ningún tipo de autenticación del que responde. Un atacante en la misma red puede responder a esas peticiones haciéndose pasar por el recurso solicitado, provocando que la víctima intente autenticarse contra él y filtrando su hash NTLMv2.

## Cuándo se usa

Estando en la misma red local (o con acceso a ella vía VPN/pivote), como técnica pasiva de captura de credenciales sin necesitar ninguna credencial previa. Suele combinarse con el análisis del tráfico normal de la organización (tareas programadas, accesos directos rotos, etc.).

## Requisitos previos

- Acceso a la red local (capa 2) del segmento objetivo.
- Que exista tráfico de resolución de nombres susceptible de fallar (recursos que no existen, typos, tareas automatizadas).

## Desarrollo del ataque

1. Poner la herramienta a escuchar en la interfaz de red correspondiente.
2. Esperar a que algún equipo o usuario intente acceder a un recurso inexistente por su nombre.
3. Capturar el hash NTLMv2 resultante desde la base de datos local de la herramienta.
4. Crackear el hash offline (nunca sirve para Pass the Hash directamente, solo para obtener la contraseña en claro).

```bash
# Modo escucha/análisis en una interfaz específica
sudo responder -l tun0

# Envenenar la red sin responder a SMB/HTTP (para no interferir con otros ataques en curso)
sudo responder -I tun0 -dw
```

```bash
# Consultar los hashes capturados directamente en la base de datos de Responder
sqlite3 Responder.db
.tables
SELECT * FROM responder;
```

## Herramientas relacionadas

- Ver [[responder]]
- Ver [[hashcat-john]]

## Detección y mitigación

Deshabilitar LLMNR y NBT-NS por GPO en toda la organización quedándose solo con DNS, y exigir firma SMB obligatoria (esta técnica suele encadenarse con SMB Relay cuando el firmado no está activo).
