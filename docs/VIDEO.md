# Guion del video explicativo — LUMEN

> **Duración objetivo:** 90 segundos (máximo 120)
> **Formato:** captura de pantalla 1080p + voz en off
> **Objetivo:** explicar cómo está hecho el juego y mostrar su código sin perder de vista la experiencia.

---

## 1. Preparación

| Elemento | Detalle |
| --- | --- |
| Resolución | 1920 × 1080, 30 o 60 fps |
| Herramienta | OBS Studio (ventana del navegador + micrófono) |
| Navegador | Ventana limpia, sin extensiones ni notificaciones |
| Pestañas abiertas | Pestaña 1: juego en `localhost:8765`; pestaña 2: VS Code con `js/game.js` |
| Zoom del editor | 120–140 % para que el código se lea |
| Audio | Micrófono a 20 cm, cuarto silencioso, −16 LUFS |
| Duración | 90 s de video + 5 s de cierre |

**Consejo:** graba primero la voz y luego ajusta las imágenes, o hazlo en una sola toma si dominas el guion. No leas literalmente: usa el guion como guía.

---

## 2. Guion segundo a segundo

### 0:00 – 0:08 · Gancho

**Imagen:** el juego en movimiento, nivel 2, Lumen esquivando una sombra y encendiendo un farol.

**Voz en off:**
> «Este es LUMEN: un juego web hecho con JavaScript puro, sin librerías, sin imágenes y sin archivos de audio. Todo lo que ves y escuchas se genera en el navegador.»

**Texto en pantalla:** `LUMEN · JavaScript puro · 0 dependencias`

---

### 0:08 – 0:20 · La idea

**Imagen:** menú principal; luego una partida nueva, primer plano del HUD y de la barra de luz.

**Voz en off:**
> «Eres la última luciérnaga de un jardín sin luz. Tu energía baja sola. Recoges chispas para mantenerte viva y enciendes tres faroles por nivel. Si tu luz llega a cero, se acabó.»

**Texto en pantalla:** `5 niveles · 15 faroles · 1 recurso: la luz`

---

### 0:20 – 0:35 · El bucle del juego

**Imagen:** partida real; se resalta con un círculo la barra de luz, las chispas y un farol. Corte a la pantalla de nivel superado.

**Voz en off:**
> «El bucle es simple: explorar, recoger, encender. Cada chispa suma quince de luz y puntos según el combo. Encender un farol cuesta treinta y barre las sombras cercanas. El nivel termina cuando los tres faroles están encendidos.»

**Texto en pantalla:** `chispa +15 · farol −30 · 3 faroles = nivel`

---

### 0:35 – 0:50 · El código: el bucle principal

**Imagen:** VS Code, `js/game.js`, función `frame` y `update`.

**Voz en off:**
> «El corazón del juego son unas veinte líneas. `requestAnimationFrame` llama a `frame`, que calcula un delta time limitado a cincuenta milisegundos para que nada se rompa si la pestaña se ralentiza. Después actualiza, dibuja y vuelve a pedir el siguiente cuadro.»

**Texto en pantalla:** `requestAnimationFrame · dt limitado · update + render`

**Código a mostrar:**

```js
function frame(ts) {
  let dt = (ts - lastFrame) / 1000;
  lastFrame = ts;
  dt = Math.min(dt, 0.05);
  if (!frozen && mode !== 'paused') update(dt);
  render();
  requestAnimationFrame(frame);
}
```

---

### 0:50 – 1:05 · El código: entidades y colisiones

**Imagen:** VS Code, `updateSparks`, `updateShadows` y la comprobación de distancia.

**Voz en off:**
> «No hay motor físico. Las chispas, las sombras y los faroles son objetos en arreglos. La colisión es un cálculo de distancia entre dos círculos. Si la distancia es menor que la suma de los radios, pasó algo: recogiste una chispa, te golpeó una sombra o encendiste un farol.»

**Texto en pantalla:** `colisión círculo–círculo · sin motor físico`

**Código a mostrar:**

```js
const d = Math.hypot(player.x - s.x, player.y - s.y);
if (d < player.r + s.r + 7) {
  sparks.splice(i, 1);
  collectSpark(s);
}
```

---

### 1:05 – 1:20 · El código: audio procedural

**Imagen:** VS Code, `js/audio.js`, `toneAt` y `startMusic`; de fondo, la música del nivel 5.

**Voz en off:**
> «La música también es código. Un planificador programa notas de una escala pentatónica con anticipación, y cada nivel cambia la nota raíz. Los efectos son osciladores y ruido filtrado con envolventes de unos pocos milisegundos.»

**Texto en pantalla:** `Web Audio API · osciladores + ruido · música generativa`

---

### 1:20 – 1:30 · Cierre

**Imagen:** pantalla de victoria; luego el repositorio en GitHub y la URL de Pages.

**Voz en off:**
> «Todo el código, el diseño y el arte están liberados con licencia MIT. Se juega en línea y el repositorio incluye el GDD completo. Gracias por jugar.»

**Texto en pantalla:** `github.com/diegouth/lumen · diegouth.github.io/lumen · MIT`

---

## 3. Tomas de apoyo (B-roll)

| Tomas | Uso |
| --- | --- |
| Menú con el título respirando | Introducción |
| Destello atravesando una sombra | Momento de acción |
| Farol encendiéndose en cámara lenta (0.5×) | Transición |
| Panel de nivel superado | Recompensa |
| Game over | Riesgo |
| Repositorio y README en GitHub | Cierre |

---

## 4. Consejos de grabación

1. Graba el gameplay a 60 fps y la voz por separado; sincroniza al editar.
2. No muestres más de 12 líneas de código por toma.
3. Usa un resaltado de sintaxis oscuro y tamaño de fuente grande.
4. Evita música de fondo durante la explicación; deja respirar el audio del juego.
5. Incluye subtítulos en español (YouTube los genera, pero revísalos).
6. Cierra con la URL visible al menos 4 segundos.

---

## 5. Metadatos para YouTube

**Título:**
> LUMEN — cómo hice un juego web con JavaScript puro (Canvas + Web Audio)

**Descripción:**
> LUMEN es un arcade minimalista hecho sin librerías: todo el arte se dibuja en Canvas 2D y toda la música se sintetiza con Web Audio API.
>
> 🎮 Juega: https://diegouth.github.io/lumen/
> 💻 Código: https://github.com/diegouth/lumen
> 📄 GDD: https://github.com/diegouth/lumen/blob/main/docs/GDD.md
>
> Hecho por Diego Alejandro Franco Partida. Licencia MIT.
>
> #JavaScript #GameDev #Canvas #WebAudio #IndieGame

**Etiquetas:** `javascript`, `canvas`, `web audio`, `juego web`, `indie`, `game dev`, `html5`, `tutorial`.

---

## 6. Lista de verificación antes de publicar

- [ ] El video dura entre 90 y 120 segundos.
- [ ] Se entiende el juego sin haberlo jugado.
- [ ] Se muestra al menos un fragmento real de código.
- [ ] Se explica el bucle, las colisiones y el audio.
- [ ] La URL de Pages aparece en pantalla y en la descripción.
- [ ] El audio de la voz es claro y sin clipping.
- [ ] El video no muestra datos personales, notificaciones ni rutas privadas.
- [ ] Se adjunta el enlace en el README o en la entrega.

<p align="center"><sub>Guión del video · LUMEN · v1.0.0</sub></p>
