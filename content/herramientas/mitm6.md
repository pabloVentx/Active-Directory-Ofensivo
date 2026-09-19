---
title: mitm6
resumen: Envenena el dominio a nivel IPv6 para forzar relay NTLM incluso cuando IPv4 no está disponible.
tags: poisoning
---

> Repositorio oficial: [github.com/dirkjanm/mitm6](https://github.com/dirkjanm/mitm6)

```bash
sudo git clone https://github.com/dirkjanm/mitm6.git
cd mitm6
sudo python3 setup.py install
```

Herramienta que envenena el dominio de la empresa por completo a nivel IPv6. Se combina con `ntlmrelayx` y `proxychains` para crear un túnel y ejecutar comandos a nivel sistema, permitiendo un relay sin necesitar conocer la contraseña. Útil para SMB Relay por IPv6 cuando IPv4 está capado.

```bash
sudo mitm6 -d dominio.corp -i eth0
```

Con esto, el atacante pasa a ser la IP v6 prioritaria como servidor DNS de la red (y en muchos casos también como puerta de enlace, dependiendo de la configuración), ya que los equipos Windows solicitan tráfico IPv6 por defecto aunque no lo usen activamente.

### Técnicas donde aparece

[[smb-relay]]
