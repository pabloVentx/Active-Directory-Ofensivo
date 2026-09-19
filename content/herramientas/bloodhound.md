---
title: BloodHound
resumen: Mapea y visualiza en un grafo las relaciones, permisos y objetos de un AD para encontrar rutas hacia Domain Admin.
tags: swiss-army-knife
---

Herramienta que mapea y visualiza las relaciones, permisos y objetos dentro de un entorno de Active Directory. Convierte la información compleja de AD (usuarios, grupos, equipos, ACLs, sesiones, trusts entre dominios...) en un grafo visual donde se ven claramente las conexiones.

**¿Para qué sirve?**

- Identificar caminos de ataque (*attack paths*) que llevan a Domain Admin, Enterprise Admin o cualquier otro objetivo crítico.
- Encontrar escalada de privilegios a través de permisos mal configurados, delegaciones abusables, grupos anidados, etc.
- Detectar movimiento lateral muy rápido: qué usuario puede loguearse dónde, quién tiene admin local en muchas máquinas...
- Visualizar cadenas de 5-10 saltos de permisos que manualmente serían imposibles de detectar.
- Priorizar mostrando el camino más corto hacia objetivos de alto valor.

### Recolección de datos

```bash
bloodhound-python -u 'usuario' -p 'contraseña' -ns IP_dominio -d dominio.local -c All --zip
```

### Levantar BloodHound CE en local (Docker)

```bash
docker-compose up -d
docker ps

# Recuperar la contraseña temporal inicial de los logs
docker-compose logs | grep -i "initial password set to"
```

Login en `http://localhost:8080` con `admin` + la contraseña temporal, subir el `.zip` recolectado y esperar a que el estado pase a "complete".

### Uso

- **Object Information**: al pinchar en un usuario, muestra sus atributos y flags interesantes (por ejemplo, si es AS-REP roasteable). Marcar siempre como *Owned* lo que ya se controla.
- **Filtros Cypher**: consultas personalizadas para buscar objetos que cumplan una condición concreta.
- **Outbound Object Control**: qué controla el objeto seleccionado — la base de todo abuso de ACLs.

### Salir / limpiar

```bash
docker-compose down
docker-compose down -v   # también elimina los volúmenes
```

### Técnicas donde aparece

[[mapeo-bloodhound]] · [[abuse-acl]] · [[asreproasting]] · [[smb-relay]] · [[dcsync]] · [[badsuccessor]]
