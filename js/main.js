document.addEventListener('DOMContentLoaded', () => {
  inicializarMenuMovil();
  mostrarAnioActual();
});

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
