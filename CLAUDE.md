# PRGAMR — Guía del proyecto

Sitio web estático, construido con HTML, CSS y JavaScript "vanilla" (sin frameworks ni build tools), pensado para cargar rápido y funcionar igual de bien en móvil que en escritorio.

## Estructura de carpetas

```
/
├── index.html        # Página principal
├── css/
│   └── style.css      # Hoja de estilos única del proyecto
├── js/
│   └── main.js         # Lógica de interfaz (vanilla JS)
└── CLAUDE.md          # Este archivo
```

Si el proyecto crece, las páginas nuevas van en la raíz (`sobre.html`, `contacto.html`, etc.) y comparten `css/style.css` y `js/main.js`. Si un script crece demasiado, se divide en `js/<nombre-funcionalidad>.js` y se importa como módulo (`type="module"`) en vez de crear un framework de carga propio.

## HTML

- HTML5 semántico: `header`, `nav`, `main`, `section`, `article`, `footer`, etc. en vez de `div` genéricos cuando exista una etiqueta adecuada.
- Un único `<h1>` por página. Jerarquía de encabezados sin saltos (no pasar de `h2` a `h4`).
- Siempre incluir `<meta name="viewport" content="width=device-width, initial-scale=1.0">` — el sitio es mobile-first.
- Atributos `alt` descriptivos en toda imagen; iconos puramente decorativos con `aria-hidden="true"`.
- Indentación de 2 espacios, atributos con comillas dobles.
- El `<title>` y las metaetiquetas (`description`, Open Graph si aplica) van completos en cada página, no placeholders.

## CSS (`css/style.css`)

- Mobile-first: los estilos base son para pantallas pequeñas; los `@media (min-width: ...)` añaden estilos para pantallas más grandes, nunca al revés.
- Variables CSS en `:root` para colores, espaciados y tipografías (`--color-primario`, `--espaciado-md`, etc.). No repetir valores mágicos sueltos en el CSS.
- Layout con Flexbox/Grid; evitar floats y posicionamiento absoluto salvo casos puntuales (overlays, badges).
- Nombrado de clases estilo BEM (`bloque__elemento--modificador`) para mantener el CSS predecible al crecer.
- Un solo archivo `style.css` mientras el proyecto sea pequeño; no fragmentar en múltiples hojas sin necesidad real.
- Breakpoints estándar del proyecto: `480px` (móvil grande), `768px` (tablet), `1024px` (escritorio).

## JavaScript (`js/main.js`)

- Vanilla JS, sin dependencias externas salvo que el usuario las pida explícitamente.
- Todo el código dentro de un listener `DOMContentLoaded` (o `defer` en el `<script>`, que es el patrón usado aquí) para no acceder al DOM antes de tiempo.
- `const`/`let`, nunca `var`. Funciones con nombres descriptivos en español o inglés (mantener consistencia con el resto del archivo).
- Sin comentarios que expliquen lo obvio; solo donde haya una decisión no evidente (por qué, no qué).
- Manejo de eventos delegado cuando tenga sentido (por ejemplo, un solo listener en `nav` en vez de uno por enlace).

## Documentación técnica

- Este archivo (`CLAUDE.md`) se actualiza cuando cambian las convenciones o la estructura del proyecto — no cuando cambia el contenido de la web.
- No se generan archivos README ni de documentación adicionales salvo que se pidan explícitamente.
- Los commits describen el porqué del cambio, no solo el qué (evitar mensajes tipo "cambios varios").

## Estado actual

Estructura base recién creada: `index.html`, `css/style.css` y `js/main.js` con contenido de ejemplo/placeholder, lista para reemplazar por el contenido real del proyecto PRGAMR.
