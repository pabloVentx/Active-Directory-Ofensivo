---
title: Mapeo de rutas de ataque con BloodHound
resumen: Convertir la información cruda del dominio en un grafo visual de caminos hacia Domain Admin.
tags: bloodhound
---

## Definición

BloodHound recoge toda la información posible del dominio (usuarios, grupos, ACLs, sesiones activas, trusts) y la representa como un grafo de relaciones. En vez de razonar manualmente sobre permisos anidados, se pueden lanzar consultas (o usar las precargadas) que muestran directamente el camino más corto desde el usuario actual hasta Domain Admin o cualquier otro objetivo de alto valor.

## Cuándo se usa

En cuanto se dispone de un usuario válido del dominio, como paso posterior a la enumeración inicial. Es especialmente útil en dominios grandes, donde una cadena de escalada puede depender de 5-10 saltos de permisos imposibles de detectar a mano.

## Requisitos previos

- Credenciales válidas de un usuario del dominio (aunque sea de bajo privilegio).
- Conectividad con el DC (LDAP) para la recolección de datos.
- Un entorno con Docker para levantar la interfaz de BloodHound CE en local.

## Desarrollo del ataque

1. Recolectar toda la información del dominio con el *collector* usando credenciales válidas, generando un `.zip`.
2. Levantar BloodHound CE en local (contenedor Docker) y acceder por navegador.
3. Subir el `.zip` recolectado y esperar a que el estado pase a "complete".
4. Explorar el grafo: marcar el usuario propio como *Owned*, revisar su "Object Information" para ver atributos interesantes (por ejemplo si es AS-REP roasteable), y lanzar consultas Cypher o las precargadas de "Shortest Path to Domain Admins".
5. Revisar "Outbound Object Control" de cada usuario/objeto comprometido para ver qué desbloquea a continuación (otro usuario, un equipo, un grupo).

```bash
# 1. Recolección de datos del dominio
bloodhound-python -u 'usuario' -p 'contraseña' -ns IP_dominio -d dominio.local -c All --zip

# 2. Levantar el entorno
docker-compose up -d
docker ps

# 3. Recuperar la contraseña temporal del admin (login inicial)
docker-compose logs | grep -i "initial password set to"
```

Interfaz web en `http://localhost:8080`, login `admin` + contraseña temporal.

## Herramientas relacionadas

- Ver [[bloodhound]]

## Detección y mitigación

La recolección masiva de datos vía LDAP en poco tiempo desde una cuenta de bajo privilegio es un patrón detectable en el SIEM. A nivel de diseño, la mitigación real está en simplificar la anidación de grupos y auditar periódicamente las ACLs con la propia herramienta desde el lado defensivo (BloodHound también sirve para higiene de permisos).
