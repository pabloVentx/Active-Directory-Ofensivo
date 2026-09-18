---
title: Kerbrute
resumen: Enumera usuarios de un dominio directamente contra el KDC (puerto 88), sin credenciales.
tags: enumeration
---

Herramienta para enumerar usuarios en un AD de un dominio y emplear diferentes ataques contra Kerberos (puerto 88).

> Como tarda bastante, en cuanto el puerto 88 esté confirmado abierto merece la pena lanzarlo cuanto antes en paralelo a otras enumeraciones.

```bash
chmod +x kerbrute_linux_amd64

kerbrute userenum --dc IP_dominio -d dominio diccionario.txt
```

> Wordlist recomendada: `/usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt`
> Colocar el binario en `/usr/local/bin` para poder ejecutarlo desde cualquier ruta.

### Técnicas donde aparece

[[enumeracion-usuarios-kerberos]]
