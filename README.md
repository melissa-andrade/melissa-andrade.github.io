# Melissa Andrade · Digital Marketing Portfolio

Sitio estático (HTML/CSS/JS, sin dependencias) listo para GitHub Pages.

## Estructura
```
index.html            página única, mismo orden de secciones que el Canva
assets/style.css      estilos, paleta y animaciones
assets/main.js        intro, revelado al hacer scroll, nav flotante, videos
assets/img/           páginas exportadas de Canva (p01…p18) + cursor.svg
assets/video/         content-creation.mp4 (export de Canva) y videos Lancet 2026
```

## Publicar en GitHub Pages
1. Crea un repositorio nuevo en GitHub (por ejemplo `portfolio` o `TU-USUARIO.github.io`).
2. Sube **el contenido de esta carpeta** (no la carpeta misma) a la rama `main`.
3. En el repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. En 1–2 minutos estará en `https://TU-USUARIO.github.io/portfolio/`
   (o en `https://TU-USUARIO.github.io/` si el repo se llama así).

## Editar
- **Cambiar una página del Canva:** exporta esa página como JPG/PNG a 1920 px de ancho y reemplaza `assets/img/pNN.jpg` con el mismo nombre.
- **Paleta:** variables en la parte superior de `assets/style.css` (`--teal`, `--terra`, `--ink`, `--linen`, `--sage`).
- **Videos Lancet 2026:** `assets/video/lancet-2026-a.mp4` y `lancet-2026-b.mp4`.
