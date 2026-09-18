---
title: Bases de un Active Directory
resumen: Estructura, autenticación y superficie de ataque de AD antes de entrar en técnicas concretas.
tags: kerberos, ldap, ntlm
---

## Qué es Active Directory

Active Directory (AD) es el servicio de directorio de Microsoft: una base de datos jerárquica que centraliza usuarios, equipos, grupos y políticas de una organización, y que además actúa como servidor de autenticación de toda la red. Casi cualquier entorno corporativo Windows gira alrededor de un AD, lo que lo convierte en el objetivo número uno en una auditoría interna: comprometerlo suele significar comprometer toda la infraestructura.

## Estructura lógica

- **Dominio**: unidad administrativa básica (`cyberwarfare.corp`). Contiene todos los objetos (usuarios, equipos, grupos, OUs).
- **Árbol (Tree)**: conjunto de dominios que comparten un namespace DNS contiguo.
- **Bosque (Forest)**: conjunto de uno o varios árboles. Es el límite de seguridad real de AD, no el dominio.
- **Unidad Organizativa (OU)**: "carpeta" dentro del dominio para agrupar objetos y aplicarles GPOs o delegar permisos.
- **Trust (relación de confianza)**: permite que usuarios de un dominio/bosque autentiquen recursos de otro. Puede ser transitiva o no, y unidireccional o bidireccional — es una de las rutas clásicas para saltar entre dominios de un mismo bosque.
- **Controlador de Dominio (DC)**: servidor que aloja la base de datos del AD (`NTDS.dit`), resuelve autenticación (Kerberos/NTLM) y replica cambios con el resto de DCs.

## Objetos más relevantes para un pentest

| Objeto | Para qué sirve | Por qué interesa ofensivamente |
|---|---|---|
| Usuario | Identidad de una persona o servicio | Punto de entrada, objetivo de Kerberoasting/spraying |
| Grupo | Agrupa usuarios/equipos para asignar permisos | Los grupos anidados son la base de casi toda escalada por ACLs |
| Equipo (computer) | Cada máquina unida al dominio es un objeto más | Tiene su propia cuenta y hash, útil para movimiento lateral |
| GPO | Política aplicada a OUs (contraseñas, scripts, software) | Configuraciones mal aplicadas filtran credenciales (ver GPP) |
| SYSVOL | Recurso compartido replicado entre DCs con GPOs y scripts | Legible por cualquier usuario autenticado por defecto |

## Autenticación: Kerberos

Kerberos (puerto **88**) es el protocolo de autenticación por defecto en AD desde Windows 2000, y es la pieza central de la mayoría de ataques de esta web. El flujo simplificado es:

1. **AS-REQ**: el cliente pide un **TGT** (*Ticket Granting Ticket*) al KDC (el propio DC) cifrando una marca de tiempo con el hash derivado de su contraseña.
2. **AS-REP**: el KDC responde con el TGT, cifrado con la clave de la cuenta especial **`krbtgt`**. El TGT es, en la práctica, el "pase" que demuestra que ya te autenticaste.
3. **TGS-REQ**: cuando el usuario quiere acceder a un servicio (un share, una base de datos SQL...), presenta su TGT al KDC y pide un **TGS** (*Ticket Granting Service*) para ese servicio concreto, identificado por su **SPN** (*Service Principal Name*).
4. **TGS-REP**: el KDC responde con el TGS, cifrado con el hash de la cuenta de servicio dueña del SPN.
5. El cliente presenta el TGS directamente al servicio, que lo descifra con su propio hash para validar el acceso — sin volver a preguntar al DC.

Esta cadena es la que explota **Kerberoasting** (pedir TGS de cualquier SPN y crackear su cifrado offline), **AS-REP Roasting** (cuando no se exige la validación previa en el paso 1) y toda la familia de **Golden/Silver Ticket** (falsificar directamente el TGT o el TGS si se tiene la clave que los cifra).

## Autenticación: NTLM

NTLM es el protocolo de autenticación heredado (pre-Kerberos), basado en un reto-respuesta con el hash NTLM de la contraseña. Sigue activo como *fallback* en la mayoría de entornos (por ejemplo cuando se accede por IP en vez de por nombre, o protocolos como LLMNR/NBT-NS). Es la base de los ataques de **captura y relay de autenticación** (Responder, SMB Relay, mitm6/ntlmrelayx) y de **Pass the Hash**, ya que el hash NTLM es directamente utilizable para autenticar sin conocer la contraseña en texto claro.

## LDAP y la base de datos del dominio

Toda la información del dominio (usuarios, grupos, ACLs, atributos...) se consulta vía **LDAP** (puertos **389**/**636** para LDAPS). Es el protocolo que usan herramientas de enumeración como `ldapsearch`, `ldapdomaindump`, BloodHound o `bloodyAD` para leer (y en algunos casos escribir) directamente sobre el directorio.

A nivel de almacenamiento, un DC guarda toda esta información en **`NTDS.dit`**, y las cuentas locales de cada máquina se guardan en la **SAM** (*Security Account Manager*). Ambas bases de datos contienen hashes de contraseñas y son objetivo directo de técnicas de post-explotación como `secretsdump` o `mimikatz`.

## Identificadores: SID y RID

Cada objeto de un dominio tiene un **SID** (*Security Identifier*) único, con forma `S-1-5-21-XXXX-XXXX-XXXX-RID`. El **RID** (últimos dígitos) identifica al objeto dentro de ese dominio — por ejemplo `500` es siempre el Administrator local/de dominio y `512` es el grupo Domain Admins. Herramientas como `lookupsid` o el `--rid-brute` de `netexec` abusan de la posibilidad de enumerar objetos recorriendo RIDs secuencialmente, incluso sin credenciales.

## Grupos privilegiados a tener siempre en el radar

- **Domain Admins** (RID 512): control total del dominio.
- **Enterprise Admins** (RID 519): control total del bosque completo.
- **Backup Operators**: puede hacer backup/restore de cualquier archivo, incluida la SAM o el registro — vía muy usada para escalar sin ser Domain Admin.
- **Domain Controllers** (RID 516): las cuentas de máquina de los propios DCs.
- **krbtgt**: no es un grupo, es la cuenta que cifra todos los TGT del dominio. Su hash es la clave para un **Golden Ticket**.

## Puertos y protocolos que vas a ver todo el rato

| Puerto | Protocolo | Uso típico en ataques |
|---|---|---|
| 88 | Kerberos | Kerberoasting, AS-REP Roasting, Golden/Silver Ticket |
| 389 / 636 | LDAP / LDAPS | Enumeración de usuarios, grupos, ACLs |
| 445 | SMB | Enumeración de shares, PtH, SMB Relay, dumps remotos |
| 135 | MSRPC | `rpcclient`, gestión remota |
| 3389 | RDP | Acceso remoto interactivo |
| 5985 | WinRM | Ejecución remota de comandos (PowerShell remoting) |

## Cómo está organizada esta web

El resto del contenido sigue, en líneas generales, el ciclo de vida real de un ataque a AD:

1. **Reconocimiento y Enumeración** — quién hay, qué hay, qué se puede ver sin credenciales o con las mínimas.
2. **Ataques de Credenciales en Red** — conseguir la primera credencial válida o material reutilizable.
3. **Abuso de Configuración** — errores de configuración (GPP, ACLs, ADCS) que dan escalada directa.
4. **Movimiento Lateral y Post-Explotación** — reutilizar lo obtenido para moverte y volcar más credenciales.
5. **Persistencia y Dominancia del Dominio** — asegurar el control incluso si rotan contraseñas.

Cada técnica sigue siempre la misma plantilla (definición, cuándo se usa, requisitos previos, desarrollo del ataque, herramientas relacionadas y detección/mitigación) para que sea fácil de consultar en caliente durante una auditoría.
