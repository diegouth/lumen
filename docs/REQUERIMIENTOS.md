# Documento técnico — Requerimientos de hardware y software

> Proyecto: **LUMEN — La última luciérnaga** · Desarrollo de videojuegos y animación 2D
> Autor: Diego Alejandro Franco Partida · v1.0.0 · Noviembre de 2026

---

## 1. Objetivo

Definir los requerimientos mínimos y recomendados —de hardware, software, formatos y red— para **desarrollar, probar y publicar** un videojuego web 2D y su contenido de animación, usando como caso práctico LUMEN. El documento distingue entre el equipo necesario para **jugar** y el necesario para **producir**.

---

## 2. Resumen ejecutivo

| Perfil | Hardware mínimo | Hardware recomendado | Software esencial |
| --- | --- | --- | --- |
| **Jugador** | Navegador moderno, 2 GB RAM, cualquier CPU de los últimos 10 años | 4 GB RAM, pantalla 1080p | Navegador actualizado |
| **Desarrollador web/JS** | 4 núcleos, 8 GB RAM, SSD 128 GB | 6–8 núcleos, 16 GB RAM, SSD 256 GB, GPU integrada | VS Code, Git, Node.js (opcional), DevTools |
| **Artista 2D / animador** | 4 núcleos, 8 GB RAM, tableta gráfica básica | 8 núcleos, 16–32 GB RAM, GPU dedicada 4 GB, tableta con presión | Inkscape, Krita, Figma, OpenToonz |
| **Audio** | 8 GB RAM, audio integrado, audífonos | 16 GB RAM, interfaz de audio, monitoreo | Audacity, LMMS, Reaper (opcional) |
| **Publicación** | Conexión de 5 Mbps | 20 Mbps simétricos | GitHub, GitHub Pages |

**Conclusión:** LUMEN se desarrolla y ejecuta en equipos modestos. El cuello de botella no es el hardware, sino la organización del proyecto y la disciplina de pruebas.

---

## 3. Requerimientos para jugar

### 3.1 Hardware

| Componente | Mínimo | Recomendado |
| --- | --- | --- |
| CPU | Cualquier x86-64 o ARM de 2015 en adelante | 2 núcleos a 2.0 GHz |
| RAM | 2 GB | 4 GB |
| Pantalla | 360 × 640 (móvil) / 1024 × 600 (escritorio) | 1920 × 1080 |
| GPU | Integrada | Cualquiera con aceleración 2D |
| Entrada | Teclado y ratón, o pantalla táctil | Teclado + ratón |
| Almacenamiento | 0 MB adicionales (todo se carga desde la web) | — |
| Red | 1 Mbps para la primera carga (~150 KB) | Cualquiera |

### 3.2 Software

| Requisito | Detalle |
| --- | --- |
| Navegador | Chrome/Edge 90+, Firefox 90+, Safari 15+ |
| APIs | Canvas 2D, Web Audio API, `requestAnimationFrame`, `localStorage` |
| Sistema operativo | Windows 10+, macOS 11+, Linux, Android 8+, iOS 15+ |
| Plugins | Ninguno (no usa Flash, WebGL obligatorio ni extensiones) |
| Cookies | No usa cookies; solo `localStorage` para récord y sonido |

### 3.3 Rendimiento esperado

| Métrica | Objetivo |
| --- | --- |
| Cuadros por segundo | 60 fps estables en equipos de 2018+; mínimo aceptable 30 fps |
| Uso de CPU | < 25 % de un núcleo en escritorio |
| Memoria de la pestaña | < 120 MB |
| Tiempo de carga | < 2 s en 10 Mbps |
| Peso total | ~150 KB (HTML + CSS + JS + SVG) |
| Latencia de entrada | < 50 ms percibidos |

---

## 4. Requerimientos para desarrollar videojuegos

### 4.1 Hardware del equipo de desarrollo

| Componente | Mínimo | Recomendado | Justificación |
| --- | --- | --- | --- |
| CPU | 4 núcleos / 2.5 GHz | 6–8 núcleos / 3.0 GHz+ | Servidor local, navegador, editor y compilación opcional |
| RAM | 8 GB | 16 GB (32 GB si se usa suite de Adobe) | Navegador + editor + herramientas de arte |
| Disco | SSD 128 GB libres | SSD NVMe 256 GB+ | Repositorio, capturas, videos y caché |
| GPU | Integrada | Dedicada 4 GB (opcional) | Solo necesaria para edición de video/animación |
| Pantalla | 1920 × 1080 | 2 monitores o ultrawide | Código + vista previa simultáneos |
| Red | 10 Mbps | 50 Mbps | Dependencias, GitHub, referencias |
| Respaldo | Disco externo / nube | NAS + nube + Git remoto | Evitar pérdida del proyecto |

### 4.2 Software por disciplina

#### Programación

| Herramienta | Versión | Licencia | Uso en LUMEN |
| --- | --- | --- | --- |
| **Visual Studio Code** | 1.80+ | MIT (gratis) | Editor principal |
| **Git** | 2.30+ | GPLv2 | Control de versiones |
| **GitHub** | Web | Gratis para repos públicos | Repositorio y Pages |
| **Node.js + npm** | 18 LTS+ | MIT | Servidor local y herramientas opcionales |
| **Python** | 3.9+ | PSF | `http.server` para pruebas locales |
| **Navegador con DevTools** | Chrome/Firefox actual | Gratis | Depuración, perfilado, consola |
| **Prettier / ESLint** | Opcional | MIT | Formato y estilo (no obligatorio) |

> LUMEN no requiere *bundler*, transpilador ni gestor de paquetes: se ejecuta tal cual. Node.js o Python solo se usan para servir la carpeta.

#### Arte 2D y vectorial

| Herramienta | Versión | Licencia | Uso |
| --- | --- | --- | --- |
| **Inkscape** | 1.2+ | GPLv3 | Splash, mapa, storyboard, favicon (SVG) |
| **Figma** | Web | Plan gratuito | Bocetos, UI, prototipos |
| **Krita** | 5.1+ | GPLv3 | Ilustración y texturas (si se requieren) |
| **GIMP** | 2.10+ | GPLv3 | Retoque y exportación PNG |
| **Aseprite** | 1.3+ | Pago (~$20 USD) | *Pixel art* para futuras versiones |

#### Animación 2D

| Herramienta | Versión | Licencia | Uso |
| --- | --- | --- | --- |
| **OpenToonz** | 1.7+ | BSD | Animación tradicional 2D y *cut-out* |
| **Synfig Studio** | 1.4+ | GPLv3 | Animación vectorial por interpolación |
| **Blender** | 3.6+ | GPLv3 | Animación 3D/2.5D y *motion graphics* |
| **Krita** | 5.1+ | GPLv3 | Animación cuadro por cuadro |
| **DaVinci Resolve** | 18+ | Gratis | Edición y composición del video |
| **OBS Studio** | 29+ | GPLv2 | Captura de pantalla y grabación del video |

#### Audio

| Herramienta | Versión | Licencia | Uso |
| --- | --- | --- | --- |
| **Audacity** | 3.4+ | GPLv2 | Edición y referencia de sonido |
| **LMMS** | 1.2+ | GPLv2 | Composición de música (si se prefiere samples) |
| **Reaper** | 7+ | Pago (licencia económica) | Producción profesional opcional |
| **Web Audio API** | Navegador | Estándar W3C | Síntesis en tiempo real (usada en LUMEN) |

#### Documentación y gestión

| Herramienta | Uso |
| --- | --- |
| **Markdown + GitHub** | README, GDD, guion, plan |
| **GitHub Projects / Issues** | Seguimiento de tareas |
| **Draw.io / Excalidraw** | Diagramas de flujo |
| **Google Docs / LibreOffice** | Borradores y guiones |

### 4.3 Formatos recomendados

| Tipo | Formato | Motivo |
| --- | --- | --- |
| Código | `.js`, `.css`, `.html` | Estándares web, sin compilación |
| Arte vectorial | `.svg` | Escalable, editable, ligero, texto plano |
| Capturas / mapas de bits | `.png` | Transparencia y compresión sin pérdida |
| Documentación | `.md` | Versionable y legible en GitHub |
| Audio (si se usara) | `.ogg` / `.mp3` (fuente `.wav`) | Compatibilidad y peso |
| Video | `.mp4` (H.264) / `.webm` | YouTube y web |
| Configuración | `.yml` | GitHub Actions |

---

## 5. Requerimientos para animación y video

### 5.1 Hardware

| Componente | Mínimo | Recomendado |
| --- | --- | --- |
| CPU | 6 núcleos | 8–12 núcleos |
| RAM | 16 GB | 32 GB |
| GPU | 4 GB VRAM | 6–8 GB VRAM |
| Disco | SSD 512 GB | NVMe 1 TB |
| Tableta | Wacom Intuos / XP-Pen básica | Wacom Cintiq / XP-Pen Deco Pro |
| Monitor | 1080p, 100 % sRGB | 1440p, 99 % sRGB / DCI-P3 |

### 5.2 Flujo de animación propuesto

```text
Guion y storyboard (Markdown + SVG)
        │
        ▼
Bocetos y animática (Krita / OpenToonz)
        │
        ▼
Arte final vectorial o raster (Inkscape / Krita)
        │
        ▼
Animación y sincronía (OpenToonz / Blender)
        │
        ▼
Composición y audio (DaVinci Resolve + Audacity)
        │
        ▼
Exportación MP4 H.264 1080p 30/60 fps
```

### 5.3 Especificaciones del video explicativo

| Parámetro | Valor |
| --- | --- |
| Duración | 90–120 segundos |
| Resolución | 1920 × 1080 |
| Cuadros por segundo | 30 o 60 |
| Códec | H.264 / AAC |
| Audio | Voz clara, −16 LUFS aproximados |
| Formato de entrega | MP4 para YouTube / enlace no listado |
| Captura | OBS a 1080p, ventana del navegador sin notificaciones |

---

## 6. Requerimientos de red y publicación

| Servicio | Requisito | Costo |
| --- | --- | --- |
| GitHub (repo público) | Cuenta gratuita | Gratis |
| GitHub Pages | Repositorio público, rama `main` o Actions | Gratis |
| Dominio | Opcional; `*.github.io` incluido | Gratis / dominio propio aparte |
| HTTPS | Automático en Pages | Gratis |
| CDN | GitHub Pages sirve por CDN | Incluido |

### Checklist de publicación

- [x] `index.html` en la raíz del repositorio.
- [x] Rutas relativas (sin `/` inicial) para que funcione en subcarpeta.
- [x] `.nojekyll` para evitar el procesado de Jekyll.
- [x] Workflow de GitHub Actions para desplegar en cada push.
- [x] Probado en Chrome y Firefox, en escritorio y móvil.
- [x] Enlaces del README apuntando a la URL de Pages.
- [x] Licencia y créditos visibles.

---

## 7. Seguridad, privacidad y accesibilidad

| Tema | Medida |
| --- | --- |
| Datos personales | No se recopilan; no hay formularios ni analítica |
| Almacenamiento | Solo `lumen.best` y `lumen.muted` en `localStorage` |
| Dependencias | Cero librerías de terceros; superficie de ataque mínima |
| Contenido externo | Ninguno; todo se sirve desde el propio repositorio |
| Accesibilidad | Teclado, táctil, `prefers-reduced-motion`, contraste alto |
| Licencias | Código MIT, arte propio, audio sintetizado sin samples |
| Menores | Sin chat, sin compras, sin publicidad |

---

## 8. Estimación de costos

| Rubro | Opción gratuita (usada) | Opción profesional |
| --- | --- | --- |
| Editor de código | VS Code | — |
| Control de versiones | Git + GitHub | GitHub Team |
| Arte vectorial | Inkscape / Figma gratis | Adobe Illustrator |
| Animación | OpenToonz / Krita | Toon Boom Harmony |
| Audio | Web Audio + Audacity | Reaper + librerías |
| Hosting | GitHub Pages | Hosting + CDN |
| **Total** | **$0 USD** | **$500–$2 000 USD/año** |

LUMEN demuestra que la opción gratuita es suficiente para un proyecto académico y publicable.

---

## 9. Matriz de trazabilidad con la actividad

| Requerimiento de la actividad | Sección de este documento |
| --- | --- |
| Descripción de requerimientos de hardware | 3.1, 4.1, 5.1 |
| Herramientas de software para videojuegos | 4.2 |
| Herramientas de software para animación | 4.2, 5.2 |
| Formatos y estándares | 4.3 |
| Publicación y red | 6 |
| Restricciones legales y de accesibilidad | 7 |
| Costos | 8 |

<p align="center"><sub>Documento técnico · LUMEN · v1.0.0</sub></p>
