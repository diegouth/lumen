# Guión — LUMEN

> Textos narrativos, diálogos y microcopy del juego. El tono es breve, nocturno y esperanzador; la historia se cuenta en ráfagas de una o dos líneas.

---

## 1. Prólogo (texto de apertura, opcional)

> *Antes, el jardín brillaba cada noche.*  
> *Cientos de luciérnagas dibujaban caminos en el aire.*  
> *Después llegó el Olvido y apagó los faroles.*  
> *Solo quedó una chispa despierta.*
>
> **Esa chispa eres tú.**

*Duración sugerida: 6 segundos, con fundido lento. En la versión 1.0.0 el prólogo se sustituye por el panel de menú; este texto queda como guía para una futura pantalla de apertura.*

---

## 2. Textos de introducción por nivel

Se muestran en el panel de inicio, con el nombre del nivel y una cuenta regresiva de 3.2 segundos.

### Nivel 1 — Jardín de musgo

> **El farolero:** «Despierta, pequeña. El jardín se enfrió mientras dormías.»
>
> *Las luciérnagas antiguas dormían entre el musgo. Despiértalas.*

### Nivel 2 — Invernadero roto

> **El farolero:** «No mires los cristales. Mira la luz que queda.»
>
> *El cristal roto corta la noche. Las sombras ya saben dónde estás.*

### Nivel 3 — Estanque de luna

> **El farolero:** «El agua recuerda un cielo que ya no está. Tú también puedes recordar.»
>
> *El estanque refleja un cielo que ya no existe. No te detengas.*

### Nivel 4 — Bosque de helechos

> **El farolero:** «Los helechos tienen nombres antiguos. No te detengas a escucharlos.»
>
> *Los helechos susurran nombres antiguos. Corre antes de que te alcancen.*

### Nivel 5 — Mirador del faro

> **El farolero:** «Desde aquí se ve todo. Enciende el último y deja que la noche respire.»
>
> *Desde el mirador se ve el último faro. Enciéndelo y devuelve la noche a las estrellas.*

---

## 3. Diálogos y avisos en partida

### El farolero (barks)

| Disparador | Línea |
| --- | --- |
| Primera chispa | «Eso es. La luz también se comparte.» |
| Primer farol | «Un farol no se enciende con prisa, sino con luz.» |
| Combo ×5 | «¡Sigue así! El jardín te está mirando.» |
| Luz por debajo de 25 | «No dejes que se apague. Busca una chispa.» |
| Última sombra cerca | «No corras en línea recta. Nunca en línea recta.» |
| Dos faroles encendidos | «Uno más. Ya casi recuerdo cómo era esto.» |
| Nivel 5, último farol | «Gracias, pequeña. Ahora descansa.» |

> En la v1.0.0 estos textos no se muestran en pantalla; funcionan como guía de tono para futuras versiones con voz o subtítulos. Los avisos que sí aparecen son los de la interfaz (sección 4).

### Textos del juego (implementados)

| Situación | Texto en pantalla |
| --- | --- |
| Farol sin luz suficiente | «Necesitas 30 de luz» |
| Destello sin luz | «Sin luz para el destello» |
| Farol encendido | «FAROL ENCENDIDO +400» |
| Daño | «−22 luz» |
| Nivel superado | «[Nombre del nivel] respira» |
| Derrota | «Tu luz se apagó» |
| Victoria | «El jardín vuelve a brillar» |

---

## 4. Finales

### Derrota (luz a 0)

> **Pantalla:** *Tu luz se apagó.*  
> **Farolero:** «Duerme. Mañana habrá otra chispa.»  
> **Interfaz:** puntaje, récord, nivel alcanzado, **Reintentar** / **Menú**.

### Victoria (nivel 5 completado)

> **Pantalla:** *El jardín vuelve a brillar.*
>
> *Cinco noches, quince faroles. Lumen no está sola: su luz quedó en cada rincón.*
>
> **Farolero:** «Mira. No era una luciérnaga. Eran todas.»
>
> *El jardín se llena de puntos de luz. El Olvido retrocede.*
>
> **Interfaz:** puntaje final, récord, **Jugar otra vez** / **Menú**.

### Texto de créditos (pantalla de créditos)

> **LUMEN — La última luciérnaga**  
> Diseño, programación, arte y audio: Diego Alejandro Franco Partida.  
> Motor: JavaScript + Canvas 2D + Web Audio API.  
> Música y efectos: síntesis procedural, sin samples.  
> Licencia MIT. Hecho de noche, con una luciérnaga.

---

## 5. Microcopy de interfaz

| Elemento | Texto |
| --- | --- |
| Botón principal | Jugar |
| Secundario | Cómo jugar |
| Terciario | Créditos |
| Pausa | El jardín espera · Continuar · Reiniciar partida · Salir al menú |
| Nivel superado | Nivel superado · Siguiente nivel |
| Derrota | Reintentar · Menú |
| Victoria | Jugar otra vez · Menú |
| Consejo del menú | «Llega a un farol con al menos 30 de luz para encenderlo. El destello también puede salvarte.» |
| Etiqueta de luz | LUZ 100 → LUZ 0 |
| Sonido | SONIDO SÍ / SONIDO NO |

---

## 6. Reglas de estilo

1. Frases cortas; máximo 16 palabras por línea.
2. Sin signos de exclamación en la narración; solo en los momentos de combo.
3. La oscuridad nunca se describe como maldad: es olvido.
4. Lumen no habla; su carácter se expresa con movimiento y luz.
5. El farolero nunca da órdenes; sugiere y acompaña.
