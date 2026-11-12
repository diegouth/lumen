# Plan de trabajo — LUMEN

> Proyecto individual · v1.0.0 · Noviembre de 2026  
> Autor: Diego Alejandro Franco Partida

---

## 1. Objetivo

Entregar un juego web indie básico, minimalista y jugable en línea, con código abierto, documentación de diseño y un video corto que explique su implementación, cumpliendo los entregables de la actividad **Act 1 — Introducción y propuestas**.

---

## 2. Metodología

Se usó un ciclo **iterativo e incremental** de una semana, con entregas pequeñas y verificables:

```text
Idea → Prototipo jugable → Prueba → Ajuste → Documentación → Publicación
```

- **Gestión:** tablero personal en GitHub Projects con columnas *Backlog*, *En curso*, *Hecho*.
- **Ritmo:** bloques de 2–3 horas, con una revisión al final de cada bloque.
- **Regla de oro:** si una función no se puede explicar en una frase, se recorta.

---

## 3. Alcance y prioridades (MoSCoW)

| Prioridad | Elemento | Estado |
| --- | --- | --- |
| **Must** | Movimiento, luz, chispas, faroles, sombras, puntaje, game over | ✅ |
| **Must** | 5 niveles, HUD, menú, pausa, récord local | ✅ |
| **Must** | Audio procedural y controles táctiles | ✅ |
| **Must** | README, GDD, storyboard, guion, requerimientos | ✅ |
| **Should** | Combo, destello, onda de farol, créditos, accesibilidad | ✅ |
| **Could** | Modo infinito, skins, ranking local por nivel | ⏳ roadmap |
| **Won't (v1)** | Multijugador, servidor, editor de niveles | ❌ |

---

## 4. Cronograma

| Fecha | Hito | Entregable | Estado |
| --- | --- | --- | --- |
| **4 nov** | Concepto y propuesta | Pitch, referencias, definición del *core loop* | ✅ |
| **5 nov** | Prototipo de movimiento | Lumen se mueve, colisiona y dibuja aura | ✅ |
| **6 nov** | Luz y recolección | Chispas, drenaje, barra de energía | ✅ |
| **7 nov** | Objetivos y amenazas | Faroles, sombras, niveles, puntaje | ✅ |
| **8 nov** | Audio e interfaz | Música generativa, SFX, menú, pausa, HUD | ✅ |
| **9 nov** | Pruebas y balance | Ajustes de dificultad, responsive, bugs | ✅ |
| **10 nov** | Documentación | README, GDD, storyboard, guion, requerimientos | ✅ |
| **11 nov** | Video y despliegue | Guion del video, grabación, GitHub Pages | ⏳ |
| **12 nov** | Entrega | Enlaces y evidencia | ⏳ |

### Distribución estimada del esfuerzo

| Actividad | Horas | % |
| --- | --- | --- |
| Programación | 18 | 45 % |
| Diseño y balance | 5 | 12 % |
| Arte vectorial | 4 | 10 % |
| Audio | 3 | 8 % |
| Documentación | 7 | 18 % |
| Pruebas y publicación | 3 | 7 % |
| **Total** | **40** | **100 %** |

---

## 5. Flujo de trabajo con Git

### 5.1 Ramas

| Rama | Propósito | Vida |
| --- | --- | --- |
| `main` | Versión estable y desplegable | Permanente |
| `feat/*` | Nueva mecánica o pantalla | Corta |
| `fix/*` | Corrección de errores | Corta |
| `docs/*` | Documentación | Corta |
| `style/*` | Ajustes visuales | Corta |

### 5.2 Convención de commits

Se usa **Conventional Commits** en español o inglés, en imperativo y con alcance cuando aplica:

```text
<tipo>(<alcance>): <descripción breve>
```

| Tipo | Uso | Ejemplo |
| --- | --- | --- |
| `feat` | Nueva funcionalidad | `feat(game): añade destello con costo de luz` |
| `fix` | Corrección | `fix(audio): evita solapamiento de música entre niveles` |
| `docs` | Documentación | `docs(gdd): agrega mapa del nivel 1` |
| `style` | Estilo sin lógica | `style(ui): ajusta contraste del HUD` |
| `refactor` | Reestructuración | `refactor(game): separa actualización y render` |
| `test` | Pruebas | `test(qa): valida el flujo de cinco niveles` |
| `chore` | Configuración | `chore(pages): agrega workflow de despliegue` |

### 5.3 Secuencia planeada (historial del repositorio)

```text
chore: inicia repositorio y estructura base
feat(game): bucle principal y movimiento de Lumen
feat(game): chispas, energía y recolección
feat(level): faroles, sombras y progresión de cinco niveles
feat(score): combo, bonus y récord en localStorage
feat(audio): música generativa y efectos con Web Audio
feat(ui): menú, HUD, pausa, créditos y paneles
style(ui): tema nocturno, responsive y accesibilidad
fix(game): evita muerte al encender el tercer farol
docs: README, GDD, storyboard, guion y requerimientos
chore(pages): workflow de despliegue estático
test(qa): verificación automatizada de flujo completo
docs(video): guion del video explicativo
```

### 5.4 Comandos de referencia

```bash
# Crear rama de trabajo
git switch -c feat/mi-mecanica

# Commits atómicos
git add js/game.js
git commit -m "feat(game): añade onda de luz al encender un farol"

# Integrar a main
git switch main
git merge --no-ff feat/mi-mecanica

# Etiquetar la entrega
git tag -a v1.0.0 -m "LUMEN v1.0.0"
git push origin main --tags
```

### 5.5 Reglas

1. `main` siempre debe poder jugarse.
2. Un commit = un cambio lógico.
3. No se suben archivos binarios pesados ni credenciales.
4. Antes de fusionar: probar en Chrome y Firefox.
5. La documentación se actualiza en el mismo PR que el cambio.

---

## 6. Control de calidad

### 6.1 Checklist funcional

- [x] El menú carga y los tres botones responden.
- [x] `Jugar` inicia el nivel 1 con 100 de luz.
- [x] El movimiento funciona con WASD, flechas, ratón y táctil.
- [x] El destello consume 12 de luz, tiene enfriamiento e invulnerabilidad.
- [x] Las chispas suman 15 de luz y puntos con combo.
- [x] El combo sube hasta ×9 y se reinicia con daño o 2.2 s sin recoger.
- [x] Los faroles requieren 30 de luz, puntúan y barren sombras.
- [x] Al encender el tercer farol se muestra el panel de nivel superado.
- [x] El nivel 5 desemboca en la pantalla de victoria.
- [x] La luz a 0 desemboca en game over.
- [x] El récord se guarda y se muestra en el menú.
- [x] Pausa, reanudar y reiniciar funcionan.
- [x] El botón de sonido silencia y recuerda la preferencia.
- [x] El juego se pausa al cambiar de pestaña.

### 6.2 Checklist visual

- [x] Sin textos cortados en escritorio (1280 × 950).
- [x] Paneles legibles en móvil vertical (390 × 844); contenido desplazable.
- [x] HUD visible solo durante la partida.
- [x] Contraste suficiente en títulos, estadísticas y botones.
- [x] Partículas y destellos no saturan la pantalla.
- [x] `prefers-reduced-motion` desactiva animaciones.

### 6.3 Checklist técnico

- [x] Sin errores en consola (Chrome headless y Firefox).
- [x] `node --check` sobre los tres archivos JavaScript.
- [x] SVG válidos (parser XML).
- [x] Rutas relativas para GitHub Pages.
- [x] Sin dependencias externas ni peticiones de red.
- [x] Funciona desde `file://` y desde servidor local.
- [x] Código < 150 KB y repositorio completo ≈ 1.1 MB con capturas incluidas.

### 6.4 Pruebas automatizadas realizadas

| Prueba | Herramienta | Resultado |
| --- | --- | --- |
| Carga del menú y paneles | Playwright + Chromium | ✅ |
| Movimiento y consumo de luz | Playwright | ✅ |
| Destello (costo, enfriamiento, desplazamiento) | Playwright | ✅ |
| Pausa / reanudar / menú | Playwright | ✅ |
| Nivel 1 completo y panel de nivel superado | Playwright (autopiloto) | ✅ |
| Flujo completo de 5 niveles y victoria | Playwright + modo QA | ✅ |
| Game over y guardado de récord | Playwright | ✅ |
| Capturas de documentación | Playwright | ✅ |

### 6.5 Compatibilidad probada

| Navegador | Escritorio | Móvil | Notas |
| --- | --- | --- | --- |
| Chrome / Chromium | ✅ | ✅ | Referencia |
| Firefox | ✅ | — | Sin incidencias |
| Safari | — | — | Esperado por estándares; pendiente de dispositivo físico |
| Edge | ✅ (Chromium) | — | Equivalente a Chrome |

---

## 7. Riesgos y mitigación

| Riesgo | Prob. | Impacto | Mitigación aplicada |
| --- | --- | --- | --- |
| Bloqueo de audio por autoplay | Alta | Medio | Audio se inicia con el primer gesto; botón de silencio |
| Falta de tiempo para arte | Media | Alto | Todo el arte es procedural o SVG propio |
| Balance demasiado difícil | Media | Medio | Drenaje configurable, chispas frecuentes, onda de farol |
| Paneles cortados en móvil | Media | Bajo | `overflow-y: auto`, diseño compacto |
| Pérdida de avances | Baja | Alto | Git local + remoto + respaldo en nube |
| Enlaces rotos en Pages | Baja | Medio | Rutas relativas y verificación posterior al despliegue |
| Récord corrupto en `localStorage` | Baja | Bajo | Lectura con `try/catch` y valor por defecto |

---

## 8. Publicación

1. Crear el repositorio `lumen` en GitHub.
2. Subir `main` con el workflow de Pages.
3. Configurar **Settings → Pages → Source: GitHub Actions**.
4. Verificar la URL `https://diegouth.github.io/lumen/`.
5. Probar en una ventana de incógnito (sin caché).
6. Actualizar el README con la URL final.

### Criterios de aceptación de la entrega

- [ ] El juego carga en GitHub Pages sin errores.
- [ ] Se puede completar el nivel 1 sin instrucciones externas.
- [ ] El README incluye propuesta, controles, puntaje y documentación.
- [ ] El GDD contiene todos los elementos solicitados.
- [ ] El video explica el código en menos de 2 minutos.
- [ ] La licencia y los créditos son visibles.

---

## 9. Roles (proyecto individual)

| Rol | Responsabilidades |
| --- | --- |
| Diseño de juego | Core loop, economía de luz, niveles, balance |
| Programación | Canvas, entidades, estados, audio, persistencia |
| Arte | Splash, mapa, storyboard, paleta, UI |
| Audio | Síntesis de música y efectos |
| QA | Pruebas funcionales, visuales y de compatibilidad |
| Documentación | README, GDD, guion, requerimientos, video |

---

## 10. Lecciones aprendidas

1. **La restricción acelera.** Eliminar assets externos redujo el alcance y mejoró la cohesión visual.
2. **Una sola variable como recurso.** Unir vida, puntaje y visibilidad en la luz simplificó el diseño y lo hizo más legible.
3. **Probar con autopiloto.** Jugar de forma automatizada reveló problemas de balance y de transición que la revisión manual no detectaba.
4. **Documentar mientras se construye.** El GDD se escribió con el código abierto; cada cambio de valor se reflejó en las tablas.
5. **Publicar temprano.** Tener Pages desde el primer día permitió detectar problemas de rutas y caché a tiempo.

---

## 11. Trabajo futuro

- Modo infinito con dificultad creciente y tabla local por nivel.
- Paletas desbloqueables y logros.
- Pantalla de prólogo animada (guion ya escrito).
- Traducción al inglés.
- Soporte de gamepad y vibración en móvil.
- Animaciones cuadro por cuadro para Lumen (hoy es procedural).

<p align="center"><sub>Plan de trabajo · LUMEN · v1.0.0</sub></p>
