document.addEventListener('DOMContentLoaded', () => {
  if (typeof registrarJuego === 'function') {
    registrarJuego('plumber-dash', inicializarPlumberDash());
  }
});

/* ---------- Plumber Dash: plataformas inspirado en los clásicos de siempre ---------- */

const TILE = 24;
const ANCHO_CANVAS = 384;
const ALTO_CANVAS = 216;

const GRAVEDAD = 1400;
const VELOCIDAD_SALTO = -480;
const VELOCIDAD_MOVIMIENTO = 150;
const VELOCIDAD_MAXIMA_CAIDA = 600;
const TIEMPO_COYOTE = 0.1;
const DELTA_MAXIMO = 0.033;

const ANCHO_JUGADOR = 18;
const ALTO_JUGADOR = 26;
const ANCHO_ENEMIGO = 20;
const ALTO_ENEMIGO = 20;
const VELOCIDAD_ENEMIGO = 45;

const NIVEL = {
  // Nivel dividido en zonas con un ritmo propio: calentamiento, primer gancho
  // de huecos seguidos, una colina de ladrillos con enemigos, un puente móvil
  // sobre un hueco imposible de saltar, un islote de riesgo, una plataforma
  // vertical con monedas de bonus, una zona de enemigos en manada y el tramo
  // final antes de la bandera.
  anchoTiles: 150,
  altoTiles: 9,
  colInicioJugador: 1,
  suelo: [
    { desde: 0, hasta: 17 },
    { desde: 19, hasta: 33 },
    { desde: 36, hasta: 37 },
    { desde: 40, hasta: 63 },
    { desde: 71, hasta: 90 },
    { desde: 94, hasta: 94 },
    { desde: 98, hasta: 121 },
    { desde: 124, hasta: 149 },
  ],
  bloques: [
    // Zona A — calentamiento
    { col: 9, fila: 4, tipo: 'interrogante' },
    // Zona B — primera escalera y tubería
    { col: 22, fila: 6, tipo: 'ladrillo' },
    { col: 23, fila: 6, tipo: 'ladrillo' }, { col: 23, fila: 5, tipo: 'ladrillo' },
    { col: 24, fila: 6, tipo: 'ladrillo' }, { col: 24, fila: 5, tipo: 'ladrillo' }, { col: 24, fila: 4, tipo: 'ladrillo' },
    { col: 28, fila: 6, tipo: 'tuberia' }, { col: 28, fila: 5, tipo: 'tuberia' },
    { col: 29, fila: 6, tipo: 'tuberia' }, { col: 29, fila: 5, tipo: 'tuberia' },
    // Zona D — plataforma flotante, tubería alta y colina completa
    { col: 43, fila: 4, tipo: 'ladrillo' }, { col: 44, fila: 4, tipo: 'ladrillo' }, { col: 45, fila: 4, tipo: 'ladrillo' },
    { col: 49, fila: 4, tipo: 'interrogante' },
    { col: 53, fila: 6, tipo: 'tuberia' }, { col: 53, fila: 5, tipo: 'tuberia' }, { col: 53, fila: 4, tipo: 'tuberia' },
    { col: 54, fila: 6, tipo: 'tuberia' }, { col: 54, fila: 5, tipo: 'tuberia' }, { col: 54, fila: 4, tipo: 'tuberia' },
    { col: 57, fila: 6, tipo: 'ladrillo' },
    { col: 58, fila: 6, tipo: 'ladrillo' }, { col: 58, fila: 5, tipo: 'ladrillo' },
    { col: 59, fila: 6, tipo: 'ladrillo' }, { col: 59, fila: 5, tipo: 'ladrillo' }, { col: 59, fila: 4, tipo: 'ladrillo' },
    { col: 60, fila: 6, tipo: 'ladrillo' }, { col: 60, fila: 5, tipo: 'ladrillo' }, { col: 60, fila: 4, tipo: 'ladrillo' },
    { col: 61, fila: 6, tipo: 'ladrillo' }, { col: 61, fila: 5, tipo: 'ladrillo' },
    { col: 62, fila: 6, tipo: 'ladrillo' },
    // Zona E — segunda escalera, bloque e interrogante y tubería
    { col: 76, fila: 6, tipo: 'ladrillo' },
    { col: 77, fila: 6, tipo: 'ladrillo' }, { col: 77, fila: 5, tipo: 'ladrillo' },
    { col: 78, fila: 6, tipo: 'ladrillo' }, { col: 78, fila: 5, tipo: 'ladrillo' }, { col: 78, fila: 4, tipo: 'ladrillo' },
    { col: 81, fila: 4, tipo: 'interrogante' },
    { col: 84, fila: 6, tipo: 'tuberia' }, { col: 84, fila: 5, tipo: 'tuberia' },
    { col: 85, fila: 6, tipo: 'tuberia' }, { col: 85, fila: 5, tipo: 'tuberia' },
    // Zona F — interrogante, tubería alta junto al ascensor vertical
    { col: 110, fila: 4, tipo: 'interrogante' },
    { col: 114, fila: 6, tipo: 'tuberia' }, { col: 114, fila: 5, tipo: 'tuberia' }, { col: 114, fila: 4, tipo: 'tuberia' },
    { col: 115, fila: 6, tipo: 'tuberia' }, { col: 115, fila: 5, tipo: 'tuberia' }, { col: 115, fila: 4, tipo: 'tuberia' },
    // Zona G — colina final, tubería e interrogante antes de la bandera
    { col: 129, fila: 6, tipo: 'ladrillo' },
    { col: 130, fila: 6, tipo: 'ladrillo' }, { col: 130, fila: 5, tipo: 'ladrillo' },
    { col: 131, fila: 6, tipo: 'ladrillo' }, { col: 131, fila: 5, tipo: 'ladrillo' }, { col: 131, fila: 4, tipo: 'ladrillo' },
    { col: 132, fila: 6, tipo: 'ladrillo' }, { col: 132, fila: 5, tipo: 'ladrillo' }, { col: 132, fila: 4, tipo: 'ladrillo' },
    { col: 133, fila: 6, tipo: 'ladrillo' }, { col: 133, fila: 5, tipo: 'ladrillo' },
    { col: 134, fila: 6, tipo: 'ladrillo' },
    { col: 137, fila: 6, tipo: 'tuberia' }, { col: 137, fila: 5, tipo: 'tuberia' },
    { col: 138, fila: 6, tipo: 'tuberia' }, { col: 138, fila: 5, tipo: 'tuberia' },
    { col: 140, fila: 4, tipo: 'interrogante' },
  ],
  monedas: [
    { col: 3, fila: 5 }, { col: 4, fila: 5 },
    { col: 24, fila: 2 },
    { col: 31, fila: 5 }, { col: 32, fila: 5 },
    { col: 36, fila: 5 },
    { col: 43, fila: 3 }, { col: 44, fila: 3 }, { col: 45, fila: 3 },
    { col: 58, fila: 4 }, { col: 59, fila: 2 }, { col: 60, fila: 4 },
    { col: 72, fila: 5 }, { col: 73, fila: 5 },
    { col: 78, fila: 2 },
    { col: 88, fila: 5 }, { col: 89, fila: 5 },
    { col: 94, fila: 5 },
    { col: 99, fila: 5 }, { col: 100, fila: 5 },
    { col: 105, fila: 2 }, { col: 106, fila: 2 }, { col: 107, fila: 2 },
    { col: 119, fila: 5 }, { col: 120, fila: 5 },
    { col: 125, fila: 5 }, { col: 126, fila: 5 },
    { col: 131, fila: 3 }, { col: 132, fila: 3 }, { col: 133, fila: 3 },
    { col: 142, fila: 5 }, { col: 143, fila: 5 }, { col: 144, fila: 5 },
  ],
  enemigos: [
    { colInicial: 13, colMin: 11, colMax: 17 },
    { colInicial: 26, colMin: 20, colMax: 33 },
    { colInicial: 47, colMin: 41, colMax: 52 },
    { colInicial: 57, colMin: 41, colMax: 63 },
    { colInicial: 61, colMin: 41, colMax: 63 },
    { colInicial: 75, colMin: 72, colMax: 90 },
    { colInicial: 85, colMin: 72, colMax: 90 },
    { colInicial: 102, colMin: 99, colMax: 121 },
    { colInicial: 112, colMin: 99, colMax: 121 },
    { colInicial: 118, colMin: 99, colMax: 121 },
    { colInicial: 127, colMin: 125, colMax: 135 },
    { colInicial: 140, colMin: 136, colMax: 146 },
  ],
  // Plataformas móviles: un puente horizontal para cruzar el hueco imposible
  // de la zona D-E, y un ascensor vertical que lleva a monedas de bonus.
  plataformas: [
    {
      tipo: 'horizontal', x: 64 * 24, y: 7 * 24, ancho: 48, alto: 8,
      min: 64 * 24, max: 69 * 24, velocidad: 40, direccionInicial: 1,
    },
    {
      tipo: 'vertical', x: 106 * 24, y: 7 * 24, ancho: 48, alto: 8,
      min: 2 * 24, max: 7 * 24, velocidad: 35, direccionInicial: -1,
    },
  ],
  colBandera: 147,
};

/* ---------- Sonido (reutiliza obtenerContextoAudio de main.js) ---------- */

function sonidoSalto() {
  reproducirTono([392, 523], 'square', 0.09, 0.05);
}

function sonidoMoneda() {
  reproducirTono([784, 1046], 'square', 0.08, 0.05);
}

function sonidoAplastar() {
  reproducirTono([180, 90], 'triangle', 0.12, 0.06);
}

function sonidoGolpeBloque() {
  reproducirTono([220], 'square', 0.06, 0);
}

function sonidoDanio() {
  reproducirTono([300, 220, 140], 'sawtooth', 0.15, 0.09);
}

function sonidoVictoria() {
  reproducirTono([523, 659, 784, 1046, 1318], 'square', 0.14, 0.11);
}

function sonidoGameOver() {
  reproducirTono([220, 196, 174, 146], 'sawtooth', 0.22, 0.14);
}

function sonidoDeslizarBandera() {
  reproducirTono([587, 440, 330, 247], 'triangle', 0.16, 0.11);
}

function sonidoNuevoRecord() {
  reproducirTono([659, 784, 988, 1318, 1568], 'square', 0.12, 0.09);
}

const MELODIA_FONDO = [392, 440, 494, 440, 392, 330, 294, 330, 392, 440, 494, 523, 494, 440, 392, 330];
const BAJO_FONDO = [196, 196, 220, 220, 196, 196, 165, 165];

let musicaActiva = false;
let notaMelodiaIndice = 0;
let notaBajoIndice = 0;
let temporizadorMusica = null;

function reproducirNotaMusica(frecuencia, tipoOnda, volumen, duracion) {
  const contexto = obtenerContextoAudio();
  if (!contexto) return;

  const oscilador = contexto.createOscillator();
  const ganancia = contexto.createGain();

  oscilador.type = tipoOnda;
  oscilador.frequency.value = frecuencia;
  ganancia.gain.setValueAtTime(volumen, contexto.currentTime);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + duracion);

  oscilador.connect(ganancia).connect(contexto.destination);
  oscilador.start();
  oscilador.stop(contexto.currentTime + duracion + 0.02);
}

function pasoMusicaFondo() {
  if (!musicaActiva) return;

  reproducirNotaMusica(MELODIA_FONDO[notaMelodiaIndice % MELODIA_FONDO.length], 'square', 0.035, 0.16);
  if (notaMelodiaIndice % 2 === 0) {
    reproducirNotaMusica(BAJO_FONDO[notaBajoIndice % BAJO_FONDO.length], 'triangle', 0.05, 0.32);
    notaBajoIndice++;
  }
  notaMelodiaIndice++;

  temporizadorMusica = setTimeout(pasoMusicaFondo, 160);
}

function iniciarMusicaFondo() {
  if (musicaActiva) return;
  musicaActiva = true;
  notaMelodiaIndice = 0;
  notaBajoIndice = 0;
  pasoMusicaFondo();
}

function detenerMusicaFondo() {
  musicaActiva = false;
  clearTimeout(temporizadorMusica);
}

/* ---------- Motor del juego ---------- */

function inicializarPlumberDash() {
  const canvas = document.getElementById('plumber-canvas');
  const overlay = document.getElementById('plumber-overlay');
  const botonIniciar = document.getElementById('plumber-iniciar');
  const elementoMonedas = document.getElementById('plumber-monedas');
  const elementoVidas = document.getElementById('plumber-vidas');
  const elementoRecord = document.getElementById('plumber-record');
  const botonMute = document.getElementById('plumber-mute');
  const controlesTactiles = document.getElementById('plumber-controles');

  if (!canvas || !overlay || !botonIniciar || !elementoMonedas || !elementoVidas || !elementoRecord) return;

  const contexto = canvas.getContext('2d');
  const overlayTitulo = overlay.querySelector('.juego-overlay-titulo');
  const overlayTexto = overlay.querySelector('.juego-overlay-texto');

  const CLAVE_RECORD = 'prgamr_plumber_record';
  const CLAVE_SILENCIO = 'prgamr_plumber_silencio';

  const fondoCielo = contexto.createLinearGradient(0, 0, 0, ALTO_CANVAS);
  fondoCielo.addColorStop(0, '#1a0b33');
  fondoCielo.addColorStop(1, '#3a1257');

  let record = Number(leerAlmacenamiento(CLAVE_RECORD, 0));
  elementoRecord.textContent = record;

  let musicaSilenciada = Boolean(leerAlmacenamiento(CLAVE_SILENCIO, false));
  actualizarBotonMute();

  let jugador;
  let bloques;
  let monedas;
  let enemigos;
  let plataformas;
  let efectos;
  let camaraX = 0;
  let tiempoFueraDeSuelo = 0;
  let tiempoJuego = 0;
  let monedasRecolectadas = 0;
  let vidasRestantes = 3;
  let saltoSolicitado = false;
  let enMarcha = false;
  let ultimoTiempo = null;
  let idAnimacion;
  let bajandoBandera = false;
  let destelloDanio = 0;

  const teclas = { izquierda: false, derecha: false };

  /* ---- Colisiones con el mapa ---- */

  function sueloEnColumna(col) {
    return NIVEL.suelo.some((rango) => col >= rango.desde && col <= rango.hasta);
  }

  function obtenerBloque(col, fila) {
    return bloques.find((bloque) => bloque.col === col && bloque.fila === fila && !bloque.usado) || null;
  }

  function esBandera(col, fila) {
    return col === NIVEL.colBandera && fila >= 2 && fila <= 6;
  }

  function esSolido(col, fila) {
    if (col < 0 || col >= NIVEL.anchoTiles) return true;
    if ((fila === 7 || fila === 8) && sueloEnColumna(col)) return true;
    return Boolean(obtenerBloque(col, fila));
  }

  // La bandera solo bloquea el avance lateral: nunca debe poder "pisarse"
  // desde arriba, o el jugador se quedaría flotando sobre ella al caer cerca.
  function esSolidoParaAvance(col, fila) {
    return esSolido(col, fila) || esBandera(col, fila);
  }

  function resolverColisionesX(entidad) {
    const filaSuperior = Math.floor(entidad.y / TILE);
    const filaInferior = Math.floor((entidad.y + entidad.alto - 1) / TILE);

    if (entidad.vx > 0) {
      const columna = Math.floor((entidad.x + entidad.ancho - 1) / TILE);
      for (let fila = filaSuperior; fila <= filaInferior; fila++) {
        if (esSolidoParaAvance(columna, fila)) {
          entidad.x = columna * TILE - entidad.ancho;
          entidad.vx = 0;
          if (entidad === jugador && esBandera(columna, fila)) {
            tocarBandera();
          }
          break;
        }
      }
    } else if (entidad.vx < 0) {
      const columna = Math.floor(entidad.x / TILE);
      for (let fila = filaSuperior; fila <= filaInferior; fila++) {
        if (esSolidoParaAvance(columna, fila)) {
          entidad.x = (columna + 1) * TILE;
          entidad.vx = 0;
          break;
        }
      }
    }
  }

  function resolverColisionesY(entidad, esJugador) {
    const colIzquierda = Math.floor(entidad.x / TILE);
    const colDerecha = Math.floor((entidad.x + entidad.ancho - 1) / TILE);

    entidad.enSuelo = false;

    if (entidad.vy > 0) {
      const fila = Math.floor((entidad.y + entidad.alto - 1) / TILE);
      for (let col = colIzquierda; col <= colDerecha; col++) {
        if (esSolido(col, fila)) {
          entidad.y = fila * TILE - entidad.alto;
          entidad.vy = 0;
          entidad.enSuelo = true;
          break;
        }
      }
    } else if (entidad.vy < 0) {
      const fila = Math.floor(entidad.y / TILE);
      for (let col = colIzquierda; col <= colDerecha; col++) {
        const bloque = obtenerBloque(col, fila);
        const chocaConSuelo = (fila === 7 || fila === 8) && sueloEnColumna(col);

        if (bloque || chocaConSuelo) {
          entidad.y = (fila + 1) * TILE;
          entidad.vy = 0;

          if (esJugador && bloque && bloque.tipo === 'interrogante') {
            activarBloqueInterrogante(bloque);
          } else if (esJugador && bloque) {
            sonidoGolpeBloque();
          }
          break;
        }
      }
    }
  }

  function activarBloqueInterrogante(bloque) {
    bloque.usado = true;
    monedasRecolectadas++;
    elementoMonedas.textContent = monedasRecolectadas;
    sonidoMoneda();
    agregarEfecto(bloque.col * TILE + TILE / 2, bloque.fila * TILE, '#f9e94e', '+1', 0.7);
  }

  /* ---- Plataformas móviles ---- */

  function actualizarPlataformas(delta) {
    plataformas.forEach((plataforma) => {
      const eje = plataforma.tipo === 'horizontal' ? 'x' : 'y';
      const posicionAnterior = plataforma[eje];

      plataforma[eje] += plataforma.velocidad * plataforma.direccion * delta;

      if (plataforma[eje] <= plataforma.min) {
        plataforma[eje] = plataforma.min;
        plataforma.direccion = 1;
      } else if (plataforma[eje] >= plataforma.max) {
        plataforma[eje] = plataforma.max;
        plataforma.direccion = -1;
      }

      plataforma.deltaX = plataforma.tipo === 'horizontal' ? plataforma[eje] - posicionAnterior : 0;
    });
  }

  function llevarJugadorEnPlataformas() {
    if (jugador.vy < 0) return;

    plataformas.forEach((plataforma) => {
      const piesJugador = jugador.y + jugador.alto;
      const dentroX = jugador.x + jugador.ancho > plataforma.x && jugador.x < plataforma.x + plataforma.ancho;
      const tocandoArriba = piesJugador >= plataforma.y - 4 && piesJugador <= plataforma.y + 10;

      if (dentroX && tocandoArriba) {
        jugador.y = plataforma.y - jugador.alto;
        jugador.vy = 0;
        jugador.enSuelo = true;
        jugador.x += plataforma.deltaX;
      }
    });
  }

  /* ---- Bandera de meta ---- */

  function tocarBandera() {
    if (bajandoBandera) return;
    bajandoBandera = true;
    jugador.vx = 0;
    jugador.vy = 0;
    jugador.mirando = 1;
    jugador.x = NIVEL.colBandera * TILE - jugador.ancho / 2;
    jugador.y = 7 * TILE - jugador.alto;
    sonidoDeslizarBandera();
    terminarJuego(true);
  }

  /* ---- Efectos visuales (partículas y texto flotante) ---- */

  function agregarEfecto(x, y, color, texto, duracion) {
    efectos.push({ x, y, color, texto: texto || null, vida: duracion || 0.4, vidaInicial: duracion || 0.4 });
  }

  function actualizarEfectos(delta) {
    efectos.forEach((efecto) => {
      efecto.vida -= delta;
      efecto.y -= 40 * delta;
    });
    efectos = efectos.filter((efecto) => efecto.vida > 0);

    if (destelloDanio > 0) destelloDanio = Math.max(destelloDanio - delta, 0);
  }

  /* ---- Ciclo de vida de la partida ---- */

  function reiniciarNivel() {
    bloques = NIVEL.bloques.map((bloque) => ({ ...bloque, usado: false }));
    monedas = NIVEL.monedas.map((moneda) => ({ ...moneda, recolectada: false }));
    enemigos = NIVEL.enemigos.map((enemigo) => ({
      x: enemigo.colInicial * TILE,
      y: 7 * TILE - ALTO_ENEMIGO,
      vx: 0,
      vy: 0,
      ancho: ANCHO_ENEMIGO,
      alto: ALTO_ENEMIGO,
      colMinPx: enemigo.colMin * TILE,
      colMaxPx: (enemigo.colMax + 1) * TILE - ANCHO_ENEMIGO,
      direccion: enemigo.direccionInicial || 1,
      vivo: true,
    }));
    plataformas = NIVEL.plataformas.map((plataforma) => ({
      ...plataforma,
      direccion: plataforma.direccionInicial,
      deltaX: 0,
    }));
    efectos = [];
    monedasRecolectadas = 0;
    vidasRestantes = 3;
    tiempoJuego = 0;
    bajandoBandera = false;
    destelloDanio = 0;
    elementoMonedas.textContent = '0';
    elementoVidas.textContent = '3';
    colocarJugadorEnInicio();
  }

  function colocarJugadorEnInicio() {
    jugador = {
      x: NIVEL.colInicioJugador * TILE,
      y: 7 * TILE - ALTO_JUGADOR,
      vx: 0,
      vy: 0,
      ancho: ANCHO_JUGADOR,
      alto: ALTO_JUGADOR,
      enSuelo: false,
      mirando: 1,
    };
    tiempoFueraDeSuelo = 0;
    camaraX = 0;
  }

  function iniciarJuego() {
    if (enMarcha) return;
    reiniciarNivel();
    overlay.classList.add('juego-overlay--oculto');
    enMarcha = true;
    ultimoTiempo = null;
    if (!musicaSilenciada) iniciarMusicaFondo();
    idAnimacion = requestAnimationFrame(bucle);
  }

  function perderVida() {
    vidasRestantes--;
    elementoVidas.textContent = Math.max(vidasRestantes, 0);
    sonidoDanio();
    destelloDanio = 0.3;

    if (vidasRestantes <= 0) {
      terminarJuego(false);
    } else {
      colocarJugadorEnInicio();
    }
  }

  function terminarJuego(gano) {
    enMarcha = false;
    cancelAnimationFrame(idAnimacion);
    detenerMusicaFondo();

    const puntuacionFinal = monedasRecolectadas * 100 + (gano ? 1000 : 0);
    const esNuevoRecord = puntuacionFinal > record;
    if (esNuevoRecord) {
      record = puntuacionFinal;
      escribirAlmacenamiento(CLAVE_RECORD, record);
      elementoRecord.textContent = record;
    }

    if (esNuevoRecord) {
      sonidoNuevoRecord();
      overlayTitulo.textContent = gano ? '¡Lo lograste! Nuevo récord' : '¡Nuevo récord!';
    } else if (gano) {
      sonidoVictoria();
      overlayTitulo.textContent = '¡Lo lograste!';
    } else {
      sonidoGameOver();
      overlayTitulo.textContent = 'Game Over';
    }

    overlayTexto.textContent = `Monedas: ${monedasRecolectadas} · Puntuación: ${puntuacionFinal} · Récord: ${record}`;
    botonIniciar.textContent = 'Jugar de nuevo';
    overlay.classList.remove('juego-overlay--oculto');
  }

  function detener() {
    if (!enMarcha) return;
    enMarcha = false;
    cancelAnimationFrame(idAnimacion);
    detenerMusicaFondo();
    overlayTitulo.textContent = 'Plumber Dash';
    overlayTexto.textContent =
      'Llega a la bandera esquivando huecos y enemigos. Flechas o A/D para moverte, Espacio o ↑ para saltar.';
    botonIniciar.textContent = 'Jugar';
    overlay.classList.remove('juego-overlay--oculto');
  }

  /* ---- Bucle principal ---- */

  function bucle(marcaTiempo) {
    if (!ultimoTiempo) ultimoTiempo = marcaTiempo;
    const delta = Math.min((marcaTiempo - ultimoTiempo) / 1000, DELTA_MAXIMO);
    ultimoTiempo = marcaTiempo;

    actualizar(delta);
    dibujar();

    if (enMarcha) {
      idAnimacion = requestAnimationFrame(bucle);
    }
  }

  function actualizar(delta) {
    tiempoJuego += delta;

    if (bajandoBandera) return;

    let objetivoVx = 0;
    if (teclas.izquierda && !teclas.derecha) objetivoVx = -VELOCIDAD_MOVIMIENTO;
    else if (teclas.derecha && !teclas.izquierda) objetivoVx = VELOCIDAD_MOVIMIENTO;

    if (objetivoVx !== 0) jugador.mirando = objetivoVx > 0 ? 1 : -1;

    jugador.vx += (objetivoVx - jugador.vx) * Math.min(delta * 12, 1);
    if (Math.abs(jugador.vx) < 2) jugador.vx = 0;

    if (saltoSolicitado) {
      saltoSolicitado = false;
      if (jugador.enSuelo || tiempoFueraDeSuelo < TIEMPO_COYOTE) {
        jugador.vy = VELOCIDAD_SALTO;
        jugador.enSuelo = false;
        tiempoFueraDeSuelo = TIEMPO_COYOTE;
        sonidoSalto();
      }
    }

    jugador.vy = Math.min(jugador.vy + GRAVEDAD * delta, VELOCIDAD_MAXIMA_CAIDA);

    jugador.x += jugador.vx * delta;
    resolverColisionesX(jugador);

    jugador.y += jugador.vy * delta;
    resolverColisionesY(jugador, true);

    actualizarPlataformas(delta);
    llevarJugadorEnPlataformas();

    if (jugador.enSuelo) tiempoFueraDeSuelo = 0;
    else tiempoFueraDeSuelo += delta;

    if (jugador.x < 0) jugador.x = 0;

    if (jugador.y > ALTO_CANVAS + 60) {
      perderVida();
      if (!enMarcha) return;
    }

    actualizarEnemigos(delta);
    comprobarColisionesEnemigos();
    recogerMonedasCercanas();
    actualizarEfectos(delta);

    camaraX = Math.max(
      0,
      Math.min(jugador.x - ANCHO_CANVAS / 2 + jugador.ancho / 2, NIVEL.anchoTiles * TILE - ANCHO_CANVAS)
    );
  }

  function actualizarEnemigos(delta) {
    enemigos.forEach((enemigo) => {
      if (!enemigo.vivo) return;

      enemigo.vy = Math.min(enemigo.vy + GRAVEDAD * delta, VELOCIDAD_MAXIMA_CAIDA);
      enemigo.y += enemigo.vy * delta;
      resolverColisionesY(enemigo, false);

      enemigo.vx = VELOCIDAD_ENEMIGO * enemigo.direccion;
      enemigo.x += enemigo.vx * delta;
      resolverColisionesX(enemigo);

      if (enemigo.x <= enemigo.colMinPx) {
        enemigo.x = enemigo.colMinPx;
        enemigo.direccion = 1;
      } else if (enemigo.x >= enemigo.colMaxPx) {
        enemigo.x = enemigo.colMaxPx;
        enemigo.direccion = -1;
      } else if (enemigo.vx === 0) {
        // Chocó contra un obstáculo sólido a media patrulla (tubería, otro
        // enemigo): invierte el sentido en vez de quedarse vibrando.
        enemigo.direccion *= -1;
      }
    });

    resolverColisionesEntreEnemigos();
  }

  function resolverColisionesEntreEnemigos() {
    for (let i = 0; i < enemigos.length; i++) {
      const a = enemigos[i];
      if (!a.vivo) continue;

      for (let j = i + 1; j < enemigos.length; j++) {
        const b = enemigos[j];
        if (!b.vivo) continue;
        if (!hayColisionAABB(a, b)) continue;

        if (a.x < b.x) {
          a.direccion = -1;
          b.direccion = 1;
          const solape = a.x + a.ancho - b.x;
          a.x -= solape / 2;
          b.x += solape / 2;
        } else {
          a.direccion = 1;
          b.direccion = -1;
          const solape = b.x + b.ancho - a.x;
          b.x -= solape / 2;
          a.x += solape / 2;
        }

        a.x = Math.max(a.colMinPx, Math.min(a.x, a.colMaxPx));
        b.x = Math.max(b.colMinPx, Math.min(b.x, b.colMaxPx));
      }
    }
  }

  function hayColisionAABB(a, b) {
    return a.x < b.x + b.ancho && a.x + a.ancho > b.x && a.y < b.y + b.alto && a.y + a.alto > b.y;
  }

  function comprobarColisionesEnemigos() {
    enemigos.forEach((enemigo) => {
      if (!enemigo.vivo) return;
      if (!hayColisionAABB(jugador, enemigo)) return;

      const jugadorCayendo = jugador.vy > 0;
      const piesJugador = jugador.y + jugador.alto;
      const golpeaDesdeArriba = piesJugador - enemigo.y < TILE * 0.6;

      if (jugadorCayendo && golpeaDesdeArriba) {
        enemigo.vivo = false;
        jugador.vy = VELOCIDAD_SALTO * 0.55;
        monedasRecolectadas += 1;
        elementoMonedas.textContent = monedasRecolectadas;
        sonidoAplastar();
        agregarEfecto(enemigo.x + enemigo.ancho / 2, enemigo.y, '#ff2fd0', '+100', 0.7);
      } else {
        perderVida();
      }
    });

    enemigos = enemigos.filter((enemigo) => enemigo.vivo);
  }

  function recogerMonedasCercanas() {
    monedas.forEach((moneda) => {
      if (moneda.recolectada) return;

      const cajaMoneda = { x: moneda.col * TILE + 4, y: moneda.fila * TILE + 4, ancho: TILE - 8, alto: TILE - 8 };
      if (hayColisionAABB(jugador, cajaMoneda)) {
        moneda.recolectada = true;
        monedasRecolectadas++;
        elementoMonedas.textContent = monedasRecolectadas;
        sonidoMoneda();
        agregarEfecto(moneda.col * TILE + TILE / 2, moneda.fila * TILE, '#f9e94e', '+1', 0.7);
      }
    });
  }

  /* ---- Dibujado ---- */

  function dibujar() {
    contexto.fillStyle = fondoCielo;
    contexto.fillRect(0, 0, ANCHO_CANVAS, ALTO_CANVAS);

    contexto.fillStyle = 'rgba(255, 47, 208, 0.12)';
    contexto.beginPath();
    contexto.arc(90, 50, 40, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = 'rgba(0, 240, 255, 0.1)';
    contexto.beginPath();
    contexto.arc(300, 30, 30, 0, Math.PI * 2);
    contexto.fill();

    const colInicio = Math.max(0, Math.floor(camaraX / TILE) - 1);
    const colFin = Math.min(NIVEL.anchoTiles - 1, Math.ceil((camaraX + ANCHO_CANVAS) / TILE) + 1);

    for (let col = colInicio; col <= colFin; col++) {
      for (let fila = 0; fila < NIVEL.altoTiles; fila++) {
        dibujarTile(col, fila);
      }
    }

    dibujarBandera();

    plataformas.forEach((plataforma) => dibujarPlataforma(plataforma));

    monedas.forEach((moneda) => {
      if (moneda.recolectada) return;
      dibujarMoneda(moneda);
    });

    enemigos.forEach((enemigo) => dibujarEnemigo(enemigo));

    dibujarJugador();

    efectos.forEach((efecto) => {
      contexto.globalAlpha = Math.max(efecto.vida / efecto.vidaInicial, 0);
      contexto.fillStyle = efecto.color;

      if (efecto.texto) {
        contexto.font = 'bold 11px sans-serif';
        contexto.textAlign = 'center';
        contexto.fillText(efecto.texto, efecto.x - camaraX, efecto.y);
      } else {
        contexto.beginPath();
        contexto.arc(efecto.x - camaraX, efecto.y, 4, 0, Math.PI * 2);
        contexto.fill();
      }
    });
    contexto.globalAlpha = 1;

    if (destelloDanio > 0) {
      contexto.fillStyle = `rgba(255, 20, 60, ${(destelloDanio / 0.3) * 0.35})`;
      contexto.fillRect(0, 0, ANCHO_CANVAS, ALTO_CANVAS);
    }
  }

  function dibujarTile(col, fila) {
    const x = col * TILE - camaraX;
    const y = fila * TILE;

    const bloque = obtenerBloque(col, fila);

    if (bloque) {
      dibujarBloque(x, y, bloque);
      return;
    }

    if ((fila === 7 || fila === 8) && sueloEnColumna(col)) {
      contexto.fillStyle = fila === 7 ? '#3a1257' : '#241040';
      contexto.fillRect(x, y, TILE, TILE);
      if (fila === 7) {
        contexto.fillStyle = '#ff2fd0';
        contexto.fillRect(x, y, TILE, 3);
      }
    }
  }

  function dibujarBloque(x, y, bloque) {
    if (bloque.tipo === 'tuberia') {
      contexto.fillStyle = '#0d3d3a';
      contexto.fillRect(x, y, TILE, TILE);
      contexto.fillStyle = '#00f0ff';
      contexto.fillRect(x, y, TILE, 3);
      contexto.fillRect(x, y, 3, TILE);
      return;
    }

    if (bloque.tipo === 'interrogante') {
      if (bloque.usado) {
        contexto.fillStyle = '#2a2038';
        contexto.fillRect(x, y, TILE, TILE);
        return;
      }
      const pulso = 0.7 + 0.3 * Math.sin(tiempoJuego * 4);
      contexto.fillStyle = `rgba(249, 233, 78, ${pulso})`;
      contexto.fillRect(x, y, TILE, TILE);
      contexto.fillStyle = '#3a1257';
      contexto.font = 'bold 14px sans-serif';
      contexto.textAlign = 'center';
      contexto.textBaseline = 'middle';
      contexto.fillText('?', x + TILE / 2, y + TILE / 2 + 1);
      return;
    }

    contexto.fillStyle = '#c4189f';
    contexto.fillRect(x, y, TILE, TILE);
    contexto.strokeStyle = 'rgba(255,255,255,0.25)';
    contexto.lineWidth = 1;
    contexto.strokeRect(x + 1, y + 1, TILE - 2, TILE / 2 - 2);
    contexto.strokeRect(x + 1, y + TILE / 2 + 1, TILE - 2, TILE / 2 - 2);
  }

  function dibujarMoneda(moneda) {
    const x = moneda.col * TILE + TILE / 2 - camaraX;
    const y = moneda.fila * TILE + TILE / 2;
    const ancho = Math.abs(Math.cos(tiempoJuego * 5 + moneda.col)) * 7 + 2;

    contexto.shadowColor = '#f9e94e';
    contexto.shadowBlur = 10;
    contexto.fillStyle = '#f9e94e';
    contexto.beginPath();
    contexto.ellipse(x, y, ancho, 8, 0, 0, Math.PI * 2);
    contexto.fill();
    contexto.shadowBlur = 0;
  }

  function dibujarEnemigo(enemigo) {
    const x = enemigo.x - camaraX;
    const y = enemigo.y;
    const bamboleo = Math.sin(tiempoJuego * 10 + enemigo.x) * 2;

    contexto.shadowColor = '#ff2fd0';
    contexto.shadowBlur = 8;
    contexto.fillStyle = '#ff2fd0';
    contexto.beginPath();
    contexto.ellipse(
      x + enemigo.ancho / 2,
      y + enemigo.alto / 2 + bamboleo * 0.2,
      enemigo.ancho / 2,
      enemigo.alto / 2 - Math.abs(bamboleo) * 0.15,
      0,
      0,
      Math.PI * 2
    );
    contexto.fill();
    contexto.shadowBlur = 0;

    contexto.fillStyle = '#150c2b';
    contexto.fillRect(x + 5, y + 6, 3, 3);
    contexto.fillRect(x + enemigo.ancho - 8, y + 6, 3, 3);
  }

  function dibujarJugador() {
    const x = jugador.x - camaraX;
    const y = jugador.y;
    const moviendo = Math.abs(jugador.vx) > 5;
    const fasePierna = moviendo ? Math.sin(tiempoJuego * 14) * 4 : 0;

    contexto.save();
    if (jugador.mirando < 0) {
      contexto.translate(x + jugador.ancho, y);
      contexto.scale(-1, 1);
    } else {
      contexto.translate(x, y);
    }

    contexto.fillStyle = '#00f0ff';
    contexto.fillRect(4 - fasePierna * 0.3, jugador.alto - 8, 5, 8);
    contexto.fillRect(jugador.ancho - 9 + fasePierna * 0.3, jugador.alto - 8, 5, 8);

    contexto.fillStyle = '#00c2d1';
    contexto.fillRect(2, jugador.alto - 20, jugador.ancho - 4, 14);

    contexto.fillStyle = '#f4d9b8';
    contexto.fillRect(3, jugador.alto - 28, jugador.ancho - 6, 9);

    contexto.fillStyle = '#ff2fd0';
    contexto.fillRect(1, jugador.alto - 30, jugador.ancho - 2, 5);
    contexto.fillRect(jugador.ancho - 6, jugador.alto - 27, 6, 3);

    contexto.restore();
  }

  function dibujarBandera() {
    const x = NIVEL.colBandera * TILE + TILE / 2 - camaraX;
    const ySuelo = 7 * TILE;

    contexto.strokeStyle = '#00f0ff';
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.moveTo(x, ySuelo);
    contexto.lineTo(x, ySuelo - TILE * 5);
    contexto.stroke();

    contexto.fillStyle = '#ff2fd0';
    contexto.beginPath();
    contexto.moveTo(x, ySuelo - TILE * 5);
    contexto.lineTo(x + 18, ySuelo - TILE * 5 + 6);
    contexto.lineTo(x, ySuelo - TILE * 5 + 12);
    contexto.closePath();
    contexto.fill();
  }

  function dibujarPlataforma(plataforma) {
    const x = plataforma.x - camaraX;
    const y = plataforma.y;

    contexto.shadowColor = '#00f0ff';
    contexto.shadowBlur = 6;
    contexto.fillStyle = '#00c2d1';
    contexto.fillRect(x, y, plataforma.ancho, plataforma.alto);
    contexto.shadowBlur = 0;

    contexto.strokeStyle = '#00f0ff';
    contexto.lineWidth = 1;
    contexto.strokeRect(x + 0.5, y + 0.5, plataforma.ancho - 1, plataforma.alto - 1);
  }

  /* ---- Entrada: teclado ---- */

  document.addEventListener('keydown', (evento) => {
    if (!enMarcha) return;

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW'].includes(evento.code)) {
      evento.preventDefault();
    }

    if (evento.code === 'ArrowLeft' || evento.code === 'KeyA') teclas.izquierda = true;
    if (evento.code === 'ArrowRight' || evento.code === 'KeyD') teclas.derecha = true;
    if (evento.code === 'ArrowUp' || evento.code === 'KeyW' || evento.code === 'Space') saltoSolicitado = true;
  });

  document.addEventListener('keyup', (evento) => {
    if (evento.code === 'ArrowLeft' || evento.code === 'KeyA') teclas.izquierda = false;
    if (evento.code === 'ArrowRight' || evento.code === 'KeyD') teclas.derecha = false;
  });

  /* ---- Entrada: controles táctiles ---- */

  if (controlesTactiles) {
    controlesTactiles.querySelectorAll('.control-tactil').forEach((boton) => {
      const control = boton.dataset.control;

      const activar = (evento) => {
        evento.preventDefault();
        if (control === 'izquierda') teclas.izquierda = true;
        if (control === 'derecha') teclas.derecha = true;
        if (control === 'salto') saltoSolicitado = true;
      };

      const desactivar = (evento) => {
        evento.preventDefault();
        if (control === 'izquierda') teclas.izquierda = false;
        if (control === 'derecha') teclas.derecha = false;
      };

      boton.addEventListener('pointerdown', activar);
      boton.addEventListener('pointerup', desactivar);
      boton.addEventListener('pointerleave', desactivar);
      boton.addEventListener('pointercancel', desactivar);
    });
  }

  /* ---- Silencio de música ---- */

  function actualizarBotonMute() {
    if (!botonMute) return;
    botonMute.textContent = musicaSilenciada ? '🔇 Música' : '🔊 Música';
    botonMute.setAttribute('aria-pressed', String(musicaSilenciada));
  }

  if (botonMute) {
    botonMute.addEventListener('click', () => {
      musicaSilenciada = !musicaSilenciada;
      escribirAlmacenamiento(CLAVE_SILENCIO, musicaSilenciada);
      actualizarBotonMute();

      if (musicaSilenciada) {
        detenerMusicaFondo();
      } else if (enMarcha) {
        iniciarMusicaFondo();
      }
    });
  }

  botonIniciar.addEventListener('click', iniciarJuego);

  reiniciarNivel();
  dibujar();

  return { detener };
}
