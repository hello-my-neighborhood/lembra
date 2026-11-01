// Para ligar a busca de filmes e séries para todo mundo, sem cada pessoa precisar de uma chave:
// 1) copie este arquivo para "lembra-config.js", na mesma pasta do index.html;
// 2) preencha UMA das opções abaixo.
window.LEMBRA = {
  // Opção A (simples): a sua chave do TMDB (a "API Key" v3). Ela fica visível a quem abrir o código do app.
  tmdbKey: '9882351caef203d37619038db7a04fc3',
  // Opção B (mais segura): o endereço do proxy, por exemplo 'https://lembra-tmdb.seunome.workers.dev'
  // (veja tmdb-proxy-worker.js). A chave fica guardada no Cloudflare, fora do app.
  tmdbProxy: ''
};
