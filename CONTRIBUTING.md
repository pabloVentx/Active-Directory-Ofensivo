# Cómo añadir contenido

Este sitio no tiene build step: es Markdown plano que `assets/js/app.js` carga y renderiza en el navegador según lo que diga `content/manifest.json`. Añadir contenido son siempre los mismos dos pasos:

1. Crear el archivo `.md` con la plantilla correspondiente (más abajo).
2. Añadir una línea al `content/manifest.json` apuntando a ese archivo.

Nada más. No hay que tocar `app.js` ni `index.html`.

## 1. Añadir una técnica nueva

Crea el archivo en `content/tecnicas/<fase>/<slug>.md` (usa un `slug` en minúsculas y con guiones, sin espacios ni tildes) con esta plantilla exacta:

```markdown
---
title: Nombre de la técnica
resumen: Una frase corta, la que se ve en las tarjetas y en el buscador.
tags: id-herramienta-1, id-herramienta-2
---

## Definición

Qué es el ataque y en qué se basa.

## Cuándo se usa

En qué situación/fase del compromiso tiene sentido usarlo.

## Requisitos previos

- Qué necesitas antes de poder ejecutarlo (credenciales, conectividad, permisos...)

## Desarrollo del ataque

1. Pasos del ataque, en orden.
2. ...

\`\`\`bash
comando de ejemplo
\`\`\`

## Herramientas relacionadas

- Ver [[id-herramienta-1]]
- Ver [[id-herramienta-2]]

## Detección y mitigación

Cómo se detecta y cómo se mitiga.
```

Luego añade la técnica al `manifest.json`, dentro del array `tecnicas` de la fase que corresponda:

```json
{ "id": "slug-de-la-tecnica", "file": "content/tecnicas/<fase>/<slug>.md" }
```

El campo `id` es el que usarás en los `[[wikilinks]]` desde otras páginas, así que mantenlo estable una vez publicado (si lo cambias, actualiza también los enlaces que apunten a él).

### Fases disponibles (y cuándo crear una nueva)

| id de fase | Carpeta | Para técnicas de... |
|---|---|---|
| `introduccion` | `content/tecnicas/introduccion/` | Fundamentos, conceptos previos |
| `reconocimiento` | `content/tecnicas/reconocimiento/` | Enumeración sin comprometer nada aún |
| `credenciales-red` | `content/tecnicas/credenciales-red/` | Conseguir la primera credencial/material |
| `abuso-configuracion` | `content/tecnicas/abuso-configuracion/` | GPP, ACLs, ADCS y similares |
| `movimiento-lateral` | `content/tecnicas/movimiento-lateral/` | Reutilizar credenciales para saltar/volcar más |
| `escalada-privilegios-local` | `content/tecnicas/escalada-privilegios-local/` | Pasar de usuario estándar/cuenta de servicio a SYSTEM en un equipo ya comprometido |
| `persistencia` | `content/tecnicas/persistencia/` | Mantener el control del dominio |
| `conexion-ejecucion-remota` | `content/tecnicas/conexion-ejecucion-remota/` | Las distintas vías (RDP, WinRM, RPC/WMI, SYSTEM) para materializar un acceso ya conseguido |

Si necesitas una fase nueva (por ejemplo, "Movimiento entre bosques" o "AD CS avanzado"), añade un objeto nuevo al array `fases` del manifest siguiendo la misma forma que los existentes (`id`, `ou`, `titulo`, `descripcion`, `tecnicas: []`), y crea la carpeta correspondiente en `content/tecnicas/`.

## 2. Añadir una herramienta nueva

Crea el archivo en `content/herramientas/<slug>.md`:

```markdown
---
title: Nombre de la herramienta
resumen: Una frase corta describiendo para qué sirve.
tags: categoria-libre
---

Descripción breve de la herramienta.

\`\`\`bash
comando de ejemplo
\`\`\`

### Técnicas donde aparece

[[slug-tecnica-1]] · [[slug-tecnica-2]]
```

Y añádela al manifest, en el array `herramientas`:

```json
{ "id": "slug-de-la-herramienta", "file": "content/herramientas/<slug>.md" }
```

## Enlaces internos (`[[wikilinks]]`)

Para enlazar a otra técnica o herramienta desde cualquier `.md`, usa `[[id]]` (usa el texto del título de esa entrada) o `[[id|Texto a mostrar]]` si quieres un texto distinto. El `id` debe coincidir exactamente con el `id` que le pusiste en el manifest. Si el `id` no existe, el enlace se pinta en rojo en la web para que sea fácil detectar referencias rotas.

## Notas de estilo

- Sigue siempre la plantilla — es lo que hace que el sitio se pueda hojear rápido en caliente durante una auditoría.
- Los bloques de código con etiqueta de lenguaje (` ```bash `, ` ```powershell `) se resaltan automáticamente.
- Las tablas Markdown estándar (`| columna | columna |`) se renderizan igual que en Obsidian/GitHub.
- Sustituye siempre IPs, dominios y usuarios reales por marcadores genéricos (`10.10.10.10`, `dominio.local`, `USER`, `PASSWORD`) antes de subir contenido.
