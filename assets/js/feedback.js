document.addEventListener('DOMContentLoaded', function () {
  const stage = document.querySelector('#feedbacks-stage');
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll('.notificacao'));
  const dotsBox = document.querySelector('#feedbacks-dots');
  if (!cards.length) return;

  let atual = 0;
  let timer = null;
  const INTERVALO = 3500;

  const dots = cards.map(function (_, i) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Ver depoimento ' + (i + 1));
    dot.addEventListener('click', function () {
      atual = i;
      render();
      reiniciar();
    });
    if (dotsBox) dotsBox.appendChild(dot);
    return dot;
  });

  function render() {
    const total = cards.length;
    cards.forEach(function (card, i) {
      let pos = (i - atual + total) % total;
      if (pos > total - 2) pos = pos - total;
      card.dataset.pos = pos <= 2 ? String(pos) : 'off';
      card.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('ativo', i === atual);
    });
  }

  function avancar() {
    atual = (atual + 1) % cards.length;
    render();
  }

  function iniciar() {
    timer = window.setInterval(avancar, INTERVALO);
  }

  function parar() {
    window.clearInterval(timer);
  }

  function reiniciar() {
    parar();
    iniciar();
  }

  stage.addEventListener('mouseenter', parar);
  stage.addEventListener('mouseleave', iniciar);

  render();
  iniciar();
});
