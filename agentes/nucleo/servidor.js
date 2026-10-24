/* ===========================================================
   servidor.js — o sistema de um agente da Come Home.

   Cada pasta de agente (agentes/comercial, agentes/marketing...) tem um
   server.js de uma linha que chama iniciar('<area>'). O escritório sobe
   esse arquivo com PORT definido em data/sistemas.json e mostra a tela
   no monitor do agente.

     GET  /                 a tela
     GET  /api/painel       números, melhorias e as listas da área
     GET  /api/status       só números e melhorias (para quem quiser ler)
     POST /api/<lista>      cria um item
     PUT  /api/<lista>/<id> edita
     DELETE /api/<lista>/<id>
     POST /api/limpar-exemplos   (Diretoria: apaga os exemplos de todas as áreas)

   A cada mudança, e a cada minuto, o sistema reescreve RELATORIO.md na
   pasta do agente. É esse arquivo que o agente lê quando você conversa
   com ele ou quando ele vai para a reunião.
   =========================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { AREAS, COLECOES } = require('./esquemas');
const dados = require('./dados');
const { calcular, relatorio } = require('./indicadores');

const TIPOS = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const ESTATICOS = ['tela.css', 'tela.js', 'logo.svg'];

module.exports = function iniciar(area) {
  const info = AREAS[area];
  if (!info) throw new Error('área desconhecida: ' + area);
  const PORT = Number(process.env.PORT) || info.porta;
  const RELATORIO = path.join(__dirname, '..', area, 'RELATORIO.md');

  function painel() {
    const d = dados.tudo();
    const colecoes = {};
    for (const [c, e] of Object.entries(COLECOES[area])) {
      colecoes[c] = { titulo: e.titulo, singular: e.singular, f: !!e.f, campos: e.campos,
                      itens: (d[c] || []).slice().sort(e.ordem || (() => 0)) };
    }
    return { area, info, areas: AREAS, gerado: new Date().toISOString(),
             exemplos: dados.temExemplos(d), indicadores: calcular(d)[area], colecoes,
             refs: dados.referencias(d) };
  }

  function escreverRelatorio() {
    try { fs.writeFileSync(RELATORIO, relatorio(area, calcular(dados.tudo()))); }
    catch (e) { console.error('não consegui escrever o RELATORIO.md:', e.message); }
  }

  const json = (res, code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(obj));
  };

  function corpo(req) {
    return new Promise((ok, falha) => {
      let s = '';
      req.on('data', c => { s += c; if (s.length > 100000) { falha(new Error('pedido grande demais')); req.destroy(); } });
      req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { falha(new Error('JSON inválido')); } });
    });
  }

  const tela = () => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${info.agente} · ${info.nome} · Come Home</title>
<link rel="icon" href="/logo.svg">
<link rel="stylesheet" href="/tela.css">
</head><body data-area="${area}" style="--area:${info.cor}">
<main id="app"><p class="carregando">Carregando o sistema de ${info.nome}…</p></main>
<dialog id="form"></dialog>
<script src="/tela.js"></script>
</body></html>`;

  http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const partes = url.pathname.split('/').filter(Boolean);

    // escrita só da própria máquina: outro site aberto no navegador não mexe nos dados
    if (req.method !== 'GET' && req.headers.origin &&
        !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(req.headers.origin)) {
      return json(res, 403, { ok: false, motivo: 'origem não permitida' });
    }

    try {
      if (req.method === 'GET' && partes.length === 0) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        return res.end(tela());
      }
      if (req.method === 'GET' && partes.length === 1 && ESTATICOS.includes(partes[0])) {
        res.writeHead(200, { 'Content-Type': TIPOS[path.extname(partes[0])], 'Cache-Control': 'no-store' });
        return res.end(fs.readFileSync(path.join(__dirname, partes[0])));
      }
      if (partes[0] !== 'api') return json(res, 404, { ok: false, motivo: 'não existe' });

      const [, alvo, id] = partes;
      if (req.method === 'GET' && alvo === 'painel') return json(res, 200, painel());
      if (req.method === 'GET' && alvo === 'status') {
        const ind = calcular(dados.tudo())[area];
        return json(res, 200, { ok: true, area, agente: info.agente, kpis: ind.kpis, melhorias: ind.melhorias });
      }
      if (req.method === 'POST' && alvo === 'limpar-exemplos') {
        if (area !== 'diretoria') return json(res, 403, { ok: false, motivo: 'os exemplos são apagados pela Diretoria, de uma vez em todas as áreas' });
        const r = dados.limparExemplos(Object.keys(AREAS));
        escreverRelatorio();
        return json(res, 200, r);
      }

      let r = null;
      if (req.method === 'POST' && alvo && !id) r = dados.salvar(area, alvo, null, await corpo(req));
      else if (req.method === 'PUT' && alvo && id) r = dados.salvar(area, alvo, id, await corpo(req));
      else if (req.method === 'DELETE' && alvo && id) r = dados.apagar(area, alvo, id);
      if (!r) return json(res, 404, { ok: false, motivo: 'rota não existe' });
      if (r.ok) escreverRelatorio();
      return json(res, r.ok ? 200 : 400, r);
    } catch (e) {
      return json(res, 500, { ok: false, motivo: e.message });
    }
  }).listen(PORT, '127.0.0.1', () => {
    console.log(`${info.agente} (${info.nome}) -> http://localhost:${PORT}`);
    escreverRelatorio();
    setInterval(escreverRelatorio, 60000);   // as outras áreas mudam sem avisar
  });
};
