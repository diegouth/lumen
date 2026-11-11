/* LUMEN — configuración editable
   Cambia estos datos y se actualizan el README (a mano), los enlaces del
   juego y la pantalla de créditos. */

window.LUMEN_CONFIG = {
  title: 'LUMEN',
  subtitle: 'La última luciérnaga',
  version: '1.0.0',
  author: 'Diego Alejandro Franco Partida',
  githubUser: 'diegouth',
  repo: 'lumen',
  license: 'MIT'
};

(function applyConfig() {
  const c = window.LUMEN_CONFIG;
  const repoUrl = 'https://github.com/' + c.githubUser + '/' + c.repo;
  const pagesUrl = 'https://' + c.githubUser + '.github.io/' + c.repo + '/';

  c.repoUrl = repoUrl;
  c.pagesUrl = pagesUrl;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll('#repoLink, .repo-link').forEach(function (a) {
      a.href = repoUrl;
    });
    document.querySelectorAll('.pages-link').forEach(function (a) {
      a.href = pagesUrl;
    });
    const year = document.getElementById('footerYear');
    if (year) year.textContent = String(new Date().getFullYear());
    const name = document.getElementById('creditName');
    if (name) name.textContent = c.author;
  });
})();
