/* ===========================================================
   dados.js — leitura e gravação dos arquivos da Come Home.

   Os arquivos ficam em agentes/dados/ e são lidos a cada pedido: são
   pequenos, e assim o que o Comercial grava aparece na hora para o
   Financeiro, que roda em outro processo. A gravação é atômica (arquivo
   temporário + rename) para nunca deixar um JSON pela metade.
   =========================================================== */
const fs = require('fs');
const path = require('path');
const { COLECOES, DONO, vazio } = require('./esquemas');
const exemplo = require('./exemplo');

const PASTA = path.join(__dirname, '..', 'dados');
const arquivo = area => path.join(PASTA, area + '.json');

function gravar(area, obj) {
  fs.mkdirSync(PASTA, { recursive: true });
  const tmp = arquivo(area) + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n');
  fs.renameSync(tmp, arquivo(area));
}

/* Primeira vez (nenhum arquivo): nasce com os exemplos. O gerador é
   determinístico, então os seis sistemas subindo juntos gravam o mesmo
   conteúdo e as referências entre áreas batem. Se só faltar uma área,
   ela nasce vazia para não misturar exemplo com dado real. */
function garantir() {
  const faltam = Object.keys(COLECOES).filter(a => !fs.existsSync(arquivo(a)));
  if (!faltam.length) return;
  const primeiraVez = faltam.length === Object.keys(COLECOES).length;
  const base = primeiraVez ? exemplo.gerar() : null;
  for (const a of faltam) gravar(a, base ? base[a] : vazio(a));
}

function ler(area) {
  try {
    const d = JSON.parse(fs.readFileSync(arquivo(area), 'utf8'));
    return Object.assign(vazio(area), d);
  } catch (e) {
    return vazio(area);
  }
}

/** tudo de todas as áreas, já achatado por coleção: { contatos: [...], negocios: [...], ... } */
function tudo() {
  garantir();
  const out = {};
  for (const area of Object.keys(COLECOES)) Object.assign(out, ler(area));
  return out;
}

/** rótulos legíveis para os campos `ref` do formulário */
function referencias(d) {
  const nome = (col, id) => { const i = (d[col] || []).find(x => x.id === id); return i ? rotulo(col, i, d) : ''; };
  function rotulo(col, i) {
    if (col === 'negocios') {
      const imovel = (d.imoveis || []).find(x => x.id === i.imovel);
      return [nome('contatos', i.contato) || 'cliente?', imovel ? imovel.codigo : null, i.etapa].filter(Boolean).join(' · ');
    }
    const f = COLECOES[DONO[col]][col].rotulo;
    return f ? f(i) : i.id;
  }
  const out = {};
  for (const col of ['contatos', 'imoveis', 'negocios', 'corretores']) {
    out[col] = (d[col] || []).map(i => ({ id: i.id, rotulo: rotulo(col, i) }));
  }
  return out;
}

/* ---------- gravação de um item, validado pelo esquema ---------- */
function limpar(campos, entrada) {
  const out = {};
  for (const c of campos) {
    let v = entrada[c.k];
    if (v === undefined || v === null || v === '') { out[c.k] = c.t === 'sim' ? false : null; continue; }
    if (c.t === 'numero' || c.t === 'dinheiro') { v = Number(String(v).replace(',', '.')); v = isFinite(v) ? v : null; }
    else if (c.t === 'sim') v = v === true || v === 'true' || v === 'on';
    else if (c.t === 'data') v = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
    else if (c.t === 'datahora') v = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v) ? String(v).slice(0, 16) : null;
    else if (c.t === 'mes') v = /^\d{4}-\d{2}$/.test(v) ? v : null;
    else if (c.t === 'opcao') v = c.op.includes(v) ? v : null;
    else v = String(v).slice(0, 500);
    out[c.k] = v;
  }
  const falta = campos.find(c => c.obrigatorio && (out[c.k] === null || out[c.k] === ''));
  return falta ? { erro: `preencha o campo "${falta.r}"` } : { item: out };
}

let seq = 0;
const novoId = col => col.slice(0, 3) + '-' + Date.now().toString(36) + (seq++).toString(36);

function salvar(area, col, id, entrada) {
  const esquema = COLECOES[area] && COLECOES[area][col];
  if (!esquema) return { ok: false, motivo: 'essa lista não é desta área' };
  const { item, erro } = limpar(esquema.campos, entrada || {});
  if (erro) return { ok: false, motivo: erro };
  garantir();
  const d = ler(area);
  if (id) {
    const i = d[col].findIndex(x => x.id === id);
    if (i < 0) return { ok: false, motivo: 'item não encontrado' };
    d[col][i] = Object.assign({ id }, item);      // editar tira a marca de exemplo: agora é dado seu
  } else {
    d[col].push(Object.assign({ id: novoId(col) }, item));
  }
  gravar(area, d);
  return { ok: true };
}

function apagar(area, col, id) {
  if (!COLECOES[area] || !COLECOES[area][col]) return { ok: false, motivo: 'essa lista não é desta área' };
  const d = ler(area);
  const antes = d[col].length;
  d[col] = d[col].filter(x => x.id !== id);
  if (d[col].length === antes) return { ok: false, motivo: 'item não encontrado' };
  gravar(area, d);
  return { ok: true };
}

/** tira os itens de exemplo. A Diretoria limpa todas as áreas de uma vez. */
function limparExemplos(areas) {
  let n = 0;
  for (const a of areas) {
    const d = ler(a);
    for (const col of Object.keys(COLECOES[a])) {
      const antes = d[col].length;
      d[col] = d[col].filter(x => !x.exemplo);
      n += antes - d[col].length;
    }
    gravar(a, d);
  }
  return { ok: true, removidos: n };
}

const temExemplos = d => Object.values(d).some(l => Array.isArray(l) && l.some(x => x.exemplo));

module.exports = { tudo, ler, salvar, apagar, limparExemplos, referencias, temExemplos, PASTA };
