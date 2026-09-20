document.addEventListener('DOMContentLoaded', () => {
  inicializarTrivia();
});

const PREGUNTAS_TRIVIA = [
  {
    pregunta: '¿En qué década nacieron los salones arcade tal como los conocemos?',
    opciones: ['Los años 50', 'Los años 60', 'Los años 70', 'Los años 90'],
    correcta: 2,
  },
  {
    pregunta: '¿Qué tecnología de pantalla usaban las recreativas clásicas?',
    opciones: ['LED', 'OLED', 'CRT (tubo de rayos catódicos)', 'E-ink'],
    correcta: 2,
  },
  {
    pregunta: '¿Qué significan las siglas NPC en un videojuego?',
    opciones: ['Nuevo personaje de control', 'Personaje no jugador', 'Núcleo de procesamiento central', 'Nivel de puntuación calculado'],
    correcta: 1,
  },
  {
    pregunta: '¿Cómo se llama la pantalla que aparece al perder todas las vidas?',
    opciones: ['Fin de nivel', 'Game Over', 'Modo pausa', 'Créditos'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué se necesitaba tradicionalmente para jugar una partida en una recreativa?',
    opciones: ['Una contraseña', 'Un mando extra', 'Una moneda o ficha', 'Una tarjeta de socio'],
    correcta: 2,
  },
  {
    pregunta: '¿Cómo se llaman las líneas horizontales que imitan el efecto de una pantalla CRT?',
    opciones: ['Pixel art', 'Scanlines', 'Dither', 'Glitch'],
    correcta: 1,
  },
  {
    pregunta: "¿Qué es el 'high score'?",
    opciones: ['El nivel más difícil', 'La puntuación más alta registrada', 'El personaje más fuerte', 'El modo multijugador'],
    correcta: 1,
  },
  {
    pregunta: 'En un videojuego, ¿qué describe el "patrón de patrulla" de un enemigo?',
    opciones: ['Su barra de vida', 'El sonido que emite', 'Su recorrido de movimiento predecible', 'El daño que inflige'],
    correcta: 2,
  },
];

function inicializarTrivia() {
  const elementoPregunta = document.getElementById('trivia-pregunta');
  const elementoOpciones = document.getElementById('trivia-opciones');
  const elementoNumero = document.getElementById('trivia-numero');
  const elementoAciertos = document.getElementById('trivia-aciertos');
  const elementoRecord = document.getElementById('trivia-record');
  const botonComenzar = document.getElementById('trivia-comenzar');

  if (!elementoPregunta || !elementoOpciones || !elementoNumero || !elementoAciertos || !elementoRecord || !botonComenzar) {
    return;
  }

  const CLAVE_RECORD = 'prgamr_trivia_record';
  let record = Number(leerAlmacenamiento(CLAVE_RECORD, 0));
  elementoRecord.textContent = record;

  let indice = 0;
  let aciertos = 0;
  let bloqueado = false;

  function iniciar() {
    indice = 0;
    aciertos = 0;
    elementoAciertos.textContent = '0';
    botonComenzar.textContent = 'Reiniciar';
    mostrarPregunta();
  }

  function mostrarPregunta() {
    if (indice >= PREGUNTAS_TRIVIA.length) {
      mostrarResultado();
      return;
    }

    bloqueado = false;
    const actual = PREGUNTAS_TRIVIA[indice];
    elementoNumero.textContent = indice + 1;
    elementoPregunta.textContent = actual.pregunta;
    elementoOpciones.innerHTML = '';

    actual.opciones.forEach((opcion, indiceOpcion) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'trivia__opcion';
      boton.textContent = opcion;
      boton.addEventListener('click', () => elegirRespuesta(indiceOpcion, boton, actual));
      elementoOpciones.appendChild(boton);
    });
  }

  function elegirRespuesta(indiceElegido, botonElegido, actual) {
    if (bloqueado) return;
    bloqueado = true;

    const botones = elementoOpciones.querySelectorAll('.trivia__opcion');
    botones.forEach((boton, indiceBoton) => {
      boton.disabled = true;
      if (indiceBoton === actual.correcta) boton.classList.add('trivia__opcion--correcta');
    });

    if (indiceElegido === actual.correcta) {
      aciertos++;
      elementoAciertos.textContent = aciertos;
      reproducirTono([784, 1046], 'square', 0.08, 0.05);
    } else {
      botonElegido.classList.add('trivia__opcion--incorrecta');
      reproducirTono([220, 160], 'sawtooth', 0.15, 0.09);
    }

    setTimeout(() => {
      indice++;
      mostrarPregunta();
    }, 1100);
  }

  function mostrarResultado() {
    elementoOpciones.innerHTML = '';

    if (aciertos > record) {
      record = aciertos;
      escribirAlmacenamiento(CLAVE_RECORD, record);
      elementoRecord.textContent = record;
    }

    elementoPregunta.textContent = `${obtenerTituloResultado(aciertos)} Has acertado ${aciertos} de ${PREGUNTAS_TRIVIA.length}.`;
    botonComenzar.textContent = 'Jugar de nuevo';
  }

  function obtenerTituloResultado(aciertosObtenidos) {
    const proporcion = aciertosObtenidos / PREGUNTAS_TRIVIA.length;
    if (proporcion === 1) return '¡Puntuación perfecta!';
    if (proporcion >= 0.75) return '¡Leyenda arcade!';
    if (proporcion >= 0.5) return 'Nada mal, jugador.';
    return 'A seguir practicando.';
  }

  botonComenzar.addEventListener('click', iniciar);
}
