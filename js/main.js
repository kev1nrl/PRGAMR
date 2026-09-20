document.addEventListener('DOMContentLoaded', () => {
  inicializarMenuMovil();
  mostrarAnioActual();
  inicializarRevelado();
  inicializarContadores();
  inicializarFormularioComunidad();
  inicializarInclinacionTarjetas();
  inicializarReacciones();
  inicializarGeneradorGamertag();
  registrarJuego('reto-neon', inicializarArcade());
  inicializarSelectorJuegos();
  inicializarCodigoSecreto();
});

/* ---------- Registro compartido de minijuegos ---------- */

function registrarJuego(id, controlador) {
  window.PRGAMR_JUEGOS = window.PRGAMR_JUEGOS || {};
  if (controlador) {
    window.PRGAMR_JUEGOS[id] = controlador;
  }
}

function inicializarSelectorJuegos() {
  const botones = document.querySelectorAll('.selector-juegos__boton');
  if (botones.length === 0) return;

  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      const juegoElegido = boton.dataset.juego;

      botones.forEach((otroBoton) => {
        const activo = otroBoton === boton;
        otroBoton.classList.toggle('selector-juegos__boton--activo', activo);
        otroBoton.setAttribute('aria-selected', String(activo));
      });

      document.querySelectorAll('.panel-juego').forEach((panel) => {
        const esElegido = panel.id === `panel-${juegoElegido}`;

        if (!esElegido) {
          const idJuegoPanel = panel.id.replace('panel-', '');
          window.PRGAMR_JUEGOS?.[idJuegoPanel]?.detener?.();
        }

        panel.classList.toggle('panel-juego--oculto', !esElegido);
      });
    });
  });
}

function inicializarMenuMovil() {
  const boton = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-principal');

  if (!boton || !nav) return;

  boton.addEventListener('click', () => {
    const abierto = nav.classList.toggle('nav--abierto');
    boton.setAttribute('aria-expanded', String(abierto));
  });

  nav.addEventListener('click', (evento) => {
    if (evento.target.matches('.nav__enlace')) {
      nav.classList.remove('nav--abierto');
      boton.setAttribute('aria-expanded', 'false');
    }
  });
}

function mostrarAnioActual() {
  const elemento = document.getElementById('anio-actual');
  if (elemento) {
    elemento.textContent = new Date().getFullYear();
  }
}

function inicializarRevelado() {
  const elementos = document.querySelectorAll('.reveal');
  if (elementos.length === 0) return;

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('reveal--visible');
          obs.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  elementos.forEach((elemento) => observador.observe(elemento));
}

function inicializarContadores() {
  const contadores = document.querySelectorAll('.contador');
  if (contadores.length === 0) return;

  const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        const elemento = entrada.target;
        const meta = Number(elemento.dataset.hasta || '0');

        if (prefiereMenosMovimiento) {
          elemento.textContent = meta.toLocaleString('es-ES');
        } else {
          animarContador(elemento, meta);
        }

        obs.unobserve(elemento);
      });
    },
    { threshold: 0.4 }
  );

  contadores.forEach((contador) => observador.observe(contador));
}

function animarContador(elemento, meta) {
  const duracionMs = 1500;
  const inicio = performance.now();

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracionMs, 1);
    const valorActual = Math.round(meta * progreso);
    elemento.textContent = valorActual.toLocaleString('es-ES');

    if (progreso < 1) {
      requestAnimationFrame(paso);
    }
  }

  requestAnimationFrame(paso);
}

function inicializarFormularioComunidad() {
  const formulario = document.getElementById('formulario-comunidad');
  const mensaje = document.getElementById('comunidad-mensaje');

  if (!formulario || !mensaje) return;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const correo = formulario.querySelector('#correo');
    if (!correo || !correo.checkValidity()) {
      mensaje.textContent = 'Introduce un correo válido para continuar.';
      return;
    }

    mensaje.textContent = '¡Apuntado! Te avisaremos en cuanto abramos las máquinas.';
    formulario.reset();
  });
}

/* ---------- Inclinación 3D de tarjetas ---------- */

function inicializarInclinacionTarjetas() {
  const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefiereMenosMovimiento) return;

  const tarjetas = document.querySelectorAll('.juego-card, .devlog-card');

  tarjetas.forEach((tarjeta) => {
    tarjeta.addEventListener('mousemove', (evento) => {
      const rect = tarjeta.getBoundingClientRect();
      const x = (evento.clientX - rect.left) / rect.width - 0.5;
      const y = (evento.clientY - rect.top) / rect.height - 0.5;
      const rotacionX = (-y * 8).toFixed(2);
      const rotacionY = (x * 8).toFixed(2);
      tarjeta.style.transform = `perspective(600px) rotateX(${rotacionX}deg) rotateY(${rotacionY}deg) translateY(-6px)`;
    });

    tarjeta.addEventListener('mouseleave', () => {
      tarjeta.style.transform = '';
    });
  });
}

/* ---------- Reacciones (localStorage, por navegador) ---------- */

function inicializarReacciones() {
  const botones = document.querySelectorAll('.reaccion');
  if (botones.length === 0) return;

  const estado = leerAlmacenamiento('prgamr_reacciones', {});

  botones.forEach((boton) => {
    const id = boton.dataset.id;
    const base = Number(boton.dataset.base || '0');

    actualizarBotonReaccion(boton, base, Boolean(estado[id]));

    boton.addEventListener('click', () => {
      const activa = !estado[id];
      estado[id] = activa;
      escribirAlmacenamiento('prgamr_reacciones', estado);
      actualizarBotonReaccion(boton, base, activa);
      reproducirTono(activa ? [660, 880] : [440], 'square', 0.08, 0.06);
    });
  });
}

function actualizarBotonReaccion(boton, base, activa) {
  const contador = base + (activa ? 1 : 0);
  boton.classList.toggle('reaccion--activa', activa);
  boton.setAttribute('aria-pressed', String(activa));
  boton.querySelector('.reaccion__contador').textContent = contador.toLocaleString('es-ES');
}

/* ---------- Generador de gamertag retro ---------- */

const GAMERTAG_ADJETIVOS = ['NEON', 'PIXEL', 'TURBO', 'RETRO', 'CYBER', 'ULTRA', 'GLITCH', 'VOLT', 'ARCADE', 'ATOMIC'];
const GAMERTAG_SUSTANTIVOS = ['WOLF', 'FALCON', 'GHOST', 'RIDER', 'VIPER', 'ROGUE', 'PHANTOM', 'BLADE', 'COMET', 'RONIN'];

function generarGamertag() {
  const adjetivo = GAMERTAG_ADJETIVOS[Math.floor(Math.random() * GAMERTAG_ADJETIVOS.length)];
  const sustantivo = GAMERTAG_SUSTANTIVOS[Math.floor(Math.random() * GAMERTAG_SUSTANTIVOS.length)];
  const numero = Math.floor(Math.random() * 90) + 10;
  return `${adjetivo}_${sustantivo}_${numero}`;
}

function inicializarGeneradorGamertag() {
  const resultado = document.getElementById('gamertag-resultado');
  const botonGenerar = document.getElementById('gamertag-generar');
  const botonGuardar = document.getElementById('gamertag-guardar');
  const listaFavoritos = document.getElementById('gamertag-favoritos');

  if (!resultado || !botonGenerar || !botonGuardar || !listaFavoritos) return;

  const CLAVE_FAVORITOS = 'prgamr_gamertags_favoritos';
  let actual = '';
  let favoritos = leerAlmacenamiento(CLAVE_FAVORITOS, []);
  pintarFavoritos();

  function generar() {
    actual = generarGamertag();
    resultado.textContent = actual;
    reproducirTono([440, 660], 'square', 0.07, 0.05);
  }

  function guardar() {
    if (!actual || favoritos.includes(actual)) return;
    favoritos = [actual, ...favoritos].slice(0, 5);
    escribirAlmacenamiento(CLAVE_FAVORITOS, favoritos);
    pintarFavoritos();
  }

  function pintarFavoritos() {
    listaFavoritos.innerHTML = '';
    favoritos.forEach((tag) => {
      const item = document.createElement('li');
      item.textContent = tag;
      listaFavoritos.appendChild(item);
    });
  }

  botonGenerar.addEventListener('click', generar);
  botonGuardar.addEventListener('click', guardar);
}

/* ---------- Arcade rápido (mini-juego en canvas) ---------- */

function inicializarArcade() {
  const canvas = document.getElementById('arcade-canvas');
  const overlay = document.getElementById('arcade-overlay');
  const botonIniciar = document.getElementById('arcade-iniciar');
  const elementoPuntuacion = document.getElementById('arcade-puntuacion');
  const elementoRecord = document.getElementById('arcade-record');

  if (!canvas || !overlay || !botonIniciar || !elementoPuntuacion || !elementoRecord) return;

  const contexto = canvas.getContext('2d');
  const ANCHO = canvas.width;
  const ALTO = canvas.height;
  const CLAVE_RECORD = 'prgamr_arcade_record';

  const overlayTitulo = overlay.querySelector('.juego-overlay-titulo');
  const overlayTexto = overlay.querySelector('.juego-overlay-texto');

  let record = Number(leerAlmacenamiento(CLAVE_RECORD, 0));
  elementoRecord.textContent = record;

  let jugador;
  let obstaculos;
  let ultimoTiempo;
  let tiempoUltimoObstaculo;
  let intervaloObstaculos;
  let velocidadBase;
  let puntuacion;
  let enMarcha = false;
  let idAnimacion;

  function reiniciarEstado() {
    jugador = { x: ANCHO / 2, objetivoX: ANCHO / 2, y: ALTO - 34, ancho: 26, alto: 26 };
    obstaculos = [];
    tiempoUltimoObstaculo = 0;
    intervaloObstaculos = 900;
    velocidadBase = 140;
    puntuacion = 0;
    ultimoTiempo = null;
  }

  function fijarObjetivoDesdeCliente(clienteX) {
    const rect = canvas.getBoundingClientRect();
    const escalaX = ANCHO / rect.width;
    jugador.objetivoX = (clienteX - rect.left) * escalaX;
  }

  canvas.addEventListener('pointerdown', (evento) => {
    canvas.setPointerCapture(evento.pointerId);
    fijarObjetivoDesdeCliente(evento.clientX);
  });

  canvas.addEventListener('pointermove', (evento) => {
    if (enMarcha) fijarObjetivoDesdeCliente(evento.clientX);
  });

  document.addEventListener('keydown', (evento) => {
    if (!enMarcha) return;
    if (evento.key === 'ArrowLeft') jugador.objetivoX -= 40;
    if (evento.key === 'ArrowRight') jugador.objetivoX += 40;
  });

  botonIniciar.addEventListener('click', iniciarJuego);

  function iniciarJuego() {
    reiniciarEstado();
    overlay.classList.add('juego-overlay--oculto');
    enMarcha = true;
    idAnimacion = requestAnimationFrame(bucle);
  }

  function bucle(marcaTiempo) {
    if (!ultimoTiempo) ultimoTiempo = marcaTiempo;
    const delta = Math.min((marcaTiempo - ultimoTiempo) / 1000, 0.05);
    ultimoTiempo = marcaTiempo;

    actualizar(delta, marcaTiempo);
    dibujar();

    if (enMarcha) {
      idAnimacion = requestAnimationFrame(bucle);
    }
  }

  function actualizar(delta, marcaTiempo) {
    jugador.x += (jugador.objetivoX - jugador.x) * 0.25;
    jugador.x = Math.max(jugador.ancho / 2, Math.min(ANCHO - jugador.ancho / 2, jugador.x));

    puntuacion += delta * 10;
    elementoPuntuacion.textContent = Math.floor(puntuacion);

    const velocidadActual = velocidadBase + puntuacion * 2;

    if (marcaTiempo - tiempoUltimoObstaculo > intervaloObstaculos) {
      tiempoUltimoObstaculo = marcaTiempo;
      intervaloObstaculos = Math.max(380, intervaloObstaculos - 15);
      const anchoObstaculo = 24 + Math.random() * 20;
      obstaculos.push({
        x: Math.random() * (ANCHO - anchoObstaculo),
        y: -30,
        ancho: anchoObstaculo,
        alto: 24,
      });
    }

    obstaculos.forEach((obstaculo) => {
      obstaculo.y += velocidadActual * delta;
    });

    obstaculos = obstaculos.filter((obstaculo) => obstaculo.y < ALTO + 40);

    const colision = obstaculos.some((obstaculo) => hayColision(jugador, obstaculo));
    if (colision) {
      terminarJuego();
    }
  }

  function hayColision(jugadorActual, obstaculo) {
    const izquierda = jugadorActual.x - jugadorActual.ancho / 2;
    const derecha = jugadorActual.x + jugadorActual.ancho / 2;
    const arriba = jugadorActual.y - jugadorActual.alto / 2;
    const abajo = jugadorActual.y + jugadorActual.alto / 2;

    return (
      izquierda < obstaculo.x + obstaculo.ancho &&
      derecha > obstaculo.x &&
      arriba < obstaculo.y + obstaculo.alto &&
      abajo > obstaculo.y
    );
  }

  function dibujar() {
    contexto.clearRect(0, 0, ANCHO, ALTO);

    contexto.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    contexto.lineWidth = 1;
    for (let x = 0; x <= ANCHO; x += 20) {
      contexto.beginPath();
      contexto.moveTo(x, 0);
      contexto.lineTo(x, ALTO);
      contexto.stroke();
    }

    contexto.shadowBlur = 16;
    contexto.shadowColor = '#ff2fd0';
    contexto.fillStyle = '#ff2fd0';
    obstaculos.forEach((obstaculo) => {
      contexto.fillRect(obstaculo.x, obstaculo.y, obstaculo.ancho, obstaculo.alto);
    });

    contexto.shadowColor = '#00f0ff';
    contexto.fillStyle = '#00f0ff';
    contexto.fillRect(
      jugador.x - jugador.ancho / 2,
      jugador.y - jugador.alto / 2,
      jugador.ancho,
      jugador.alto
    );

    contexto.shadowBlur = 0;
  }

  function terminarJuego() {
    enMarcha = false;
    cancelAnimationFrame(idAnimacion);

    const puntuacionFinal = Math.floor(puntuacion);
    if (puntuacionFinal > record) {
      record = puntuacionFinal;
      escribirAlmacenamiento(CLAVE_RECORD, record);
      elementoRecord.textContent = record;
    }

    reproducirTono([220, 160], 'sawtooth', 0.18, 0.1);

    overlayTitulo.textContent = 'Game Over';
    overlayTexto.textContent = `Puntuación: ${puntuacionFinal} · Récord: ${record}`;
    botonIniciar.textContent = 'Jugar de nuevo';
    overlay.classList.remove('juego-overlay--oculto');
  }

  function detener() {
    if (!enMarcha) return;
    enMarcha = false;
    cancelAnimationFrame(idAnimacion);
    overlayTitulo.textContent = 'Reto Neón';
    overlayTexto.textContent = 'Esquiva los bloques todo lo que puedas.';
    botonIniciar.textContent = 'Jugar';
    overlay.classList.remove('juego-overlay--oculto');
  }

  reiniciarEstado();
  dibujar();

  return { detener };
}

/* ---------- Código Konami (easter egg) ---------- */

function inicializarCodigoSecreto() {
  const secuenciaObjetivo = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a',
  ];
  let progreso = 0;

  document.addEventListener('keydown', (evento) => {
    const tecla = evento.key.length === 1 ? evento.key.toLowerCase() : evento.key;
    const coincide = tecla === secuenciaObjetivo[progreso];

    progreso = coincide ? progreso + 1 : (tecla === secuenciaObjetivo[0] ? 1 : 0);

    if (progreso === secuenciaObjetivo.length) {
      activarModoSecreto();
      progreso = 0;
    }
  });
}

function activarModoSecreto() {
  const overlay = document.getElementById('secreto-overlay');
  document.body.classList.add('modo-secreto');

  if (overlay) {
    const texto = overlay.querySelector('.secreto-overlay__texto');
    if (texto) texto.textContent = '¡MODO ARCADE SECRETO ACTIVADO!';
    overlay.classList.add('secreto-overlay--visible');

    setTimeout(() => overlay.classList.remove('secreto-overlay--visible'), 1800);
  }

  reproducirTono([523.25, 659.25, 783.99, 1046.5], 'square', 0.11, 0.12);

  setTimeout(() => {
    document.body.classList.remove('modo-secreto');
  }, 1600);
}

/* ---------- Utilidades: almacenamiento local ---------- */

function leerAlmacenamiento(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo === null ? porDefecto : JSON.parse(crudo);
  } catch (error) {
    return porDefecto;
  }
}

function escribirAlmacenamiento(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    // Almacenamiento no disponible (modo privado, cuota agotada, etc.): se ignora sin romper la interacción.
  }
}

/* ---------- Utilidades: sonido retro (Web Audio API) ---------- */

let contextoAudioCompartido = null;

function obtenerContextoAudio() {
  const ContextoAudio = window.AudioContext || window.webkitAudioContext;
  if (!ContextoAudio) return null;

  if (!contextoAudioCompartido) {
    contextoAudioCompartido = new ContextoAudio();
  }
  if (contextoAudioCompartido.state === 'suspended') {
    contextoAudioCompartido.resume();
  }
  return contextoAudioCompartido;
}

function reproducirTono(frecuencias, tipoOnda, duracion, espaciado) {
  const contexto = obtenerContextoAudio();
  if (!contexto) return;

  frecuencias.forEach((frecuencia, indice) => {
    const oscilador = contexto.createOscillator();
    const ganancia = contexto.createGain();

    oscilador.type = tipoOnda;
    oscilador.frequency.value = frecuencia;

    const inicio = contexto.currentTime + indice * espaciado;
    ganancia.gain.setValueAtTime(0.07, inicio);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);

    oscilador.connect(ganancia).connect(contexto.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracion + 0.02);
  });
}
