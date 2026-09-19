---
title: gpp-decrypt
resumen: Descifra el campo cpassword de las GPP usando la clave AES-256 que Microsoft publicó públicamente.
tags: credential-access
---

Cuando se tiene una credencial (`cpassword`) extraída de un XML del share SYSVOL, esta herramienta la descifra directamente, ya que la clave AES usada por Microsoft para cifrar ese campo es pública desde hace años.

```bash
gpp-decrypt <cpassword_extraido>
```

Recuerda: las GPP (*Group Policy Preferences*) son configuraciones que permiten a los administradores definir ajustes específicos para usuarios y equipos en un dominio de AD. Más contexto en la técnica de abuso de GPP.

### Técnicas donde aparece

[[abuse-gpp]]
