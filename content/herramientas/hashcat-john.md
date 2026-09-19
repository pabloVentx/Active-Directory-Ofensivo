---
title: hashcat / John the Ripper
resumen: Crackeo offline de los hashes extraídos por cualquiera de las técnicas de esta web.
tags: cracking
---

Los dos crackers offline de referencia. Casi cualquier técnica que termine en "extraer un hash" termina aquí.

| Ataque / hash | hashcat | John the Ripper |
|---|---|---|
| Kerberoasting (TGS) | `hashcat -m 13100 -a 0 hashes.txt wordlist.txt` | `john --format=krb5tgs --wordlist=wordlist.txt hashes.txt` |
| AS-REP Roasting | `hashcat -m 18200 -a 0 hashes.txt wordlist.txt` | `john --format=krb5asrep --wordlist=wordlist.txt hashes.txt` |
| NTLMv2 (Responder / SMB Relay / SCF) | `hashcat -m 5600 -a 0 hash wordlist.txt` | `john --wordlist=wordlist.txt hash` |

```bash
# Ejemplos genéricos
hashcat -m 13100 -a 0 kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt
john --format=krb5tgs --wordlist=/usr/share/wordlists/rockyou.txt kerberoast_hashes.txt
```

También se pueden probar hashes puntuales en servicios online como [crackstation.net](https://crackstation.net/) antes de montar un ataque offline más largo.

### Técnicas donde aparece

[[kerberoasting]] · [[asreproasting]] · [[llmnr-nbtns-poisoning]] · [[smb-relay]] · [[malicious-scf-file]]
