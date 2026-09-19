---
title: RDP (rdesktop / xfreerdp3)
resumen: Clientes de escritorio remoto por terminal para conectarse a un Windows por RDP (puerto 3389).
tags: remote-access
---

**RDP** (*Remote Desktop Protocol*) es el protocolo de Microsoft para conectarse de forma remota a un equipo Windows interactuando de forma gráfica (GUI), por el puerto **3389**.

### Conexión remota desde terminal

```bash
xfreerdp3 /u:usuario /p:contraseña /v:ipVictima:puertoProtocolo
# según la versión de Kali puede llamarse simplemente 'xfreerdp'
xfreerdp /u:usuario /p:'contraseña' /v:ipVictima:puertoProtocolo
```

```bash
rdesktop IPvictima
```

### Vulnerabilidades conocidas a tener en el radar

| Nombre | Año | Impacto |
|---|---|---|
| `rdp-vuln-ms12-020` | 2012 | Denegación de servicio — cuelga la máquina o provoca pantallazo azul |
| `rdp-vuln-bluekeep` (CVE-2019-0708) | 2019 | **Ejecución remota de código** — sesión Meterpreter como SYSTEM sin contraseña |

Si el objetivo resulta vulnerable a BlueKeep, hay módulos de Metasploit listos para explotarlo directamente.

### Técnicas donde aparece

[[pass-the-hash]] · [[pass-the-ticket]] · [[conectarse-por-rdp]]
