# AD Ofensivo

Apuntes de Active Directory ofensivo, organizados como web navegable: introducción a AD, y luego cada técnica siguiendo el ciclo de vida real de un ataque (reconocimiento → credenciales → abuso de configuración → movimiento lateral → persistencia).

**Demo / estructura:** sitio 100% estático, sin build step. El contenido vive en Markdown bajo `content/`, y una única página (`index.html`) lo carga y renderiza en el navegador.

## Ver el sitio en local

No hace falta instalar nada salvo un servidor estático (el navegador bloquea `fetch()` sobre `file://`):

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

o con Node:

```bash
npx serve .
```

## Publicarlo en GitHub Pages

1. Sube este repositorio a GitHub.
2. Entra en **Settings → Pages**.
3. En "Build and deployment", elige **Deploy from a branch**, rama `main` (o la que uses) y carpeta `/ (root)`.
4. Guarda. En un par de minutos el sitio estará disponible en `https://<usuario>.github.io/<repo>/`.

No hace falta ninguna GitHub Action ni build: al ser HTML/CSS/JS plano + Markdown, Pages lo sirve directamente.

## Estructura del repositorio

```
index.html                     # shell de la app (una sola página)
assets/css/style.css           # tema visual
assets/js/app.js               # router, renderer markdown, búsqueda
content/manifest.json          # define fases, técnicas y herramientas
content/tecnicas/<fase>/*.md   # una técnica = un archivo
content/herramientas/*.md      # fichas de referencia de herramientas
```

## Cómo añadir contenido nuevo

Ver [CONTRIBUTING.md](CONTRIBUTING.md) — resumen rápido:

1. Copia la plantilla de técnica o de herramienta.
2. Escribe el archivo `.md` dentro de `content/tecnicas/<fase>/` o `content/herramientas/`.
3. Añade una línea en `content/manifest.json` apuntando a ese archivo.
4. Recarga la web (o haz `git push` si ya está en GitHub Pages). No hace falta compilar nada.

## Sobre el contenido

Estos son apuntes de estudio/laboratorio (CTFs, máquinas de práctica, certificaciones). El propósito es didáctico y de auditoría autorizada — úsalo únicamente en entornos donde tengas permiso explícito para actuar.
