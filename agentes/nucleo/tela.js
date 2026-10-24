/* ===========================================================
   tela.js — a tela do sistema de um agente, no navegador.
   Lê /api/painel e desenha: números, o que melhorar, resumos e as
   listas da área, com formulário para cadastrar e editar.
   =========================================================== */
(() => {
  const app = document.getElementById('app');
  const dlg = document.getElementById('form');
  let P = null;                       // último painel
  const busca = {};                   // texto de busca por lista

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  function fmt(c, v) {
    if (v === null || v === undefined || v === '') return c.t === 'sim' ? 'Não' : '—';
    switch (c.t) {
      case 'dinheiro': return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
      case 'numero': return String(v).replace('.', ',');
      case 'data': { const [a, m, d] = v.split('-'); return `${d}/${m}/${a}`; }
      case 'datahora': { const [dt, h] = v.split('T'); const [a, m, d] = dt.split('-'); return `${d}/${m} ${h}`; }
      case 'mes': { const [a, m] = v.split('-'); return `${m}/${a}`; }
      case 'sim': return v ? 'Sim' : 'Não';
      case 'ref': { const r = (P.refs[c.ref] || []).find(x => x.id === v); return r ? r.rotulo : '—'; }
      default: return v;
    }
  }

  async function api(metodo, rota, corpo) {
    const r = await fetch(rota, { method: metodo, headers: corpo ? { 'Content-Type': 'application/json' } : {},
                                  body: corpo ? JSON.stringify(corpo) : undefined });
    const j = await r.json().catch(() => ({ ok: false, motivo: 'resposta inválida do sistema' }));
    if (!r.ok && j.ok !== false) j.ok = false;
    return j;
  }

  async function carregar() {
    try {
      P = await api('GET', '/api/painel');
      desenhar();
    } catch (e) {
      app.innerHTML = `<p class="erro">Não consegui falar com o sistema. Ele pode ter sido desligado no escritório.</p>`;
    }
  }

  /* ---------------- desenho ---------------- */
  function desenhar() {
    const { info, indicadores: I, area } = P;
    const hora = new Date(P.gerado).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    let h = `
      <header class="topo">
        <img src="/logo.svg" alt="Come Home">
        <div class="quem">
          <div class="eyebrow">Imobiliária Come Home · ${esc(info.sala)}</div>
          <h1>${esc(info.agente)}, agente de ${esc(info.nome)}</h1>
          <p class="missao">${esc(info.missao)}</p>
        </div>
        <div class="acoes"><span>Atualizado às ${hora}</span><button class="btn" data-acao="atualizar">Atualizar</button></div>
      </header>`;

    if (P.exemplos) {
      h += area === 'diretoria'
        ? `<div class="aviso" role="status"><span>Os sistemas estão com dados de <b>exemplo</b>, marcados nas listas. Quando quiser começar com os dados reais da Come Home, apague todos de uma vez.</span>
             <button class="btn perigo" data-acao="limpar">Apagar exemplos de todas as áreas</button></div>`
        : `<div class="aviso" role="status"><span>${Object.keys(P.colecoes).length
            ? 'Estes são dados de <b>exemplo</b>, marcados nas listas.'
            : 'Os números abaixo ainda vêm de dados de <b>exemplo</b> das outras áreas.'} Para começar com os dados reais, apague os exemplos no sistema da Diretoria.</span></div>`;
    }

    h += `<section class="kpis" aria-label="Números">${I.kpis.map(k => `
      <div class="kpi ${k.tom || ''}"><span>${esc(k.rotulo)}</span><b>${esc(k.valor)}</b><small>${esc(k.detalhe || '')}</small></div>`).join('')}</section>`;

    if (I.resumo) {
      h += `<section class="areas" aria-label="Áreas">${I.resumo.map(s => `
        <div class="area" style="--c:${s.cor}">
          <h3>${esc(s.nome)} <small class="num">· ${esc(s.agente)}</small></h3>
          ${s.kpis.map(k => `<div class="num">${esc(k.rotulo)}: <b>${esc(k.valor)}</b></div>`).join('')}
          <div class="num">${s.altas ? `<b style="color:var(--ruim)">${s.altas} urgente${s.altas > 1 ? 's' : ''}</b>` : 'nada urgente'} · ${s.total} ponto${s.total === 1 ? '' : 's'} de melhoria</div>
          <a href="http://localhost:${s.porta}" target="_blank" rel="noopener">Abrir o sistema de ${esc(s.nome)}</a>
        </div>`).join('')}</section>`;
    }

    const melhorias = I.melhorias.length ? `<ol class="melhorias">${I.melhorias.map((m, i) => `
        <li class="${m.nivel}">
          <span class="fato">${esc(m.texto)}</span>
          <span class="acao">${esc(m.acao)}</span>
          <span class="rodape"><span class="chip ${m.nivel}">${m.nivel === 'media' ? 'média' : m.nivel}${area === 'diretoria' && m.area ? ' · ' + esc(m.area) : ''}</span>
          ${area === 'diretoria' ? `<button class="btn" data-acao="virar" data-i="${i}">Colocar no plano</button>` : ''}</span>
        </li>`).join('')}</ol>`
      : `<p class="vazio">Nada pedindo atenção agora. Bom sinal.</p>`;

    const tabelas = (I.tabelas || []).filter(t => t.linhas.length).map(t => `
      <div class="caixa"><h2>${esc(t.titulo)}</h2><div class="rolagem"><table>
        <thead><tr>${t.colunas.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
        <tbody>${t.linhas.map(l => `<tr>${l.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div></div>`).join('');

    const caixaMelhorias = `<section class="caixa"><h2>O que melhorar agora <small>${I.melhorias.length ? `${I.melhorias.length} pontos, do mais urgente para o menos` : ''}</small></h2>${melhorias}</section>`;
    h += tabelas
      ? `<div class="grade">${caixaMelhorias}<div style="display:grid;gap:18px;min-width:0">${tabelas}</div></div>`
      : caixaMelhorias;

    for (const [col, L] of Object.entries(P.colecoes)) h += lista(col, L);
    // redesenhar não pode roubar o cursor de quem está digitando na busca
    const foco = document.activeElement, pos = foco && foco.dataset && foco.dataset.busca ? foco.selectionStart : null;
    const focoId = pos !== null ? foco.id : null;
    app.innerHTML = h;
    if (focoId) { const el = document.getElementById(focoId); el.focus(); el.setSelectionRange(pos, pos); }
  }

  function lista(col, L) {
    const cols = L.campos.filter(c => c.lista);
    const q = (busca[col] || '').toLowerCase();
    const itens = q ? L.itens.filter(i => cols.some(c => String(fmt(c, i[c.k])).toLowerCase().includes(q))) : L.itens;
    return `<section class="caixa">
      <div class="lista-topo">
        <h2>${esc(L.titulo)} <small>${L.itens.length} ${L.itens.length === 1 ? 'item' : 'itens'}</small></h2>
        <div class="acoes">
          <input class="busca" id="busca-${col}" data-busca="${col}" type="search" placeholder="Buscar" value="${esc(busca[col] || '')}" aria-label="Buscar em ${esc(L.titulo)}">
          <button class="btn forte" data-acao="novo" data-col="${col}">+ ${esc(L.singular)}</button>
        </div>
      </div>
      ${itens.length ? `<div class="rolagem"><table>
        <thead><tr>${cols.map(c => `<th>${esc(c.r)}</th>`).join('')}</tr></thead>
        <tbody>${itens.map(i => `<tr class="linha" tabindex="0" data-col="${col}" data-id="${esc(i.id)}">${cols.map((c, n) =>
          `<td class="${c.t === 'texto' || c.t === 'ref' ? 'texto' : ''}">${esc(fmt(c, i[c.k]))}${n === 0 && i.exemplo ? '<span class="tag">exemplo</span>' : ''}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>` : `<p class="vazio">${q ? 'Nada encontrado com essa busca.' : `${L.f ? 'Nenhuma' : 'Nenhum'} ${esc(L.singular)} ainda. Clique em "+ ${esc(L.singular)}" para cadastrar.`}</p>`}
    </section>`;
  }

  /* ---------------- formulário ---------------- */
  function abrirForm(col, item, preenche) {
    const L = P.colecoes[col];
    const v = Object.assign({}, item || {}, preenche || {});
    const campo = c => {
      const id = `f-${col}-${c.k}`;
      let val = v[c.k];
      if (!item && (val === undefined || val === null) && c.padrao !== undefined) val = c.padrao;
      if (!item && (val === undefined || val === null) && c.t === 'data' && /atualizado|captadoEm/.test(c.k)) val = hojeISO();
      if (c.t === 'sim') return `<div class="campo check"><input type="checkbox" id="${id}" name="${c.k}" ${val ? 'checked' : ''}><label for="${id}">${esc(c.r)}</label></div>`;
      let input;
      if (c.t === 'opcao') input = `<select id="${id}" name="${c.k}">${c.op.map(o => `<option value="${esc(o)}" ${o === (val || '') ? 'selected' : ''}>${esc(o || '—')}</option>`).join('')}${c.op.includes('') ? '' : `<option value="" ${val ? '' : 'selected'}>—</option>`}</select>`;
      else if (c.t === 'textolongo') return `<div class="campo largo"><label for="${id}">${esc(c.r)}</label><textarea id="${id}" name="${c.k}" rows="6">${esc(val == null ? '' : val)}</textarea></div>`;
      else if (c.t === 'ref') input = `<select id="${id}" name="${c.k}"><option value="">—</option>${(P.refs[c.ref] || []).map(r => `<option value="${esc(r.id)}" ${r.id === val ? 'selected' : ''}>${esc(r.rotulo)}</option>`).join('')}</select>`;
      else {
        const tipo = { numero: 'number', dinheiro: 'number', data: 'date', datahora: 'datetime-local', mes: 'month' }[c.t] || 'text';
        input = `<input id="${id}" name="${c.k}" type="${tipo}" ${c.t === 'dinheiro' ? 'step="1" min="0"' : c.t === 'numero' ? 'step="any"' : ''} value="${esc(val == null ? '' : val)}" ${c.obrigatorio ? 'required' : ''}>`;
      }
      const largo = c.t === 'texto' && !['telefone', 'codigo', 'creci', 'bairro', 'responsavel'].includes(c.k);
      return `<div class="campo ${largo ? 'largo' : ''}"><label for="${id}">${esc(c.r)}${c.obrigatorio ? ' *' : ''}</label>${input}</div>`;
    };
    dlg.innerHTML = `<form method="dialog" novalidate>
      <h2>${item ? 'Editar' : L.f ? 'Nova' : 'Novo'} ${esc(L.singular)}</h2>
      ${item && item.exemplo ? '<p class="vazio">Este é um item de exemplo. Ao salvar, ele passa a ser um dado seu.</p>' : ''}
      <div class="campos">${L.campos.map(campo).join('')}</div>
      <p class="erro" id="erro-form" role="alert"></p>
      <div class="botoes">
        <div>${item ? '<button type="button" class="btn perigo" data-acao="apagar">Apagar</button>' : ''}</div>
        <div><button type="button" class="btn" data-acao="fechar">Cancelar</button><button type="submit" class="btn forte">Salvar</button></div>
      </div>
    </form>`;
    const form = dlg.querySelector('form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const dados = {};
      for (const c of L.campos) {
        const el = form.elements[c.k];
        dados[c.k] = c.t === 'sim' ? el.checked : el.value;
      }
      const r = await api(item ? 'PUT' : 'POST', `/api/${col}${item ? '/' + encodeURIComponent(item.id) : ''}`, dados);
      if (!r.ok) { form.querySelector('#erro-form').textContent = r.motivo || 'Não consegui salvar.'; return; }
      dlg.close(); carregar();
    });
    form.addEventListener('click', async e => {
      const b = e.target.closest('[data-acao]');
      if (!b) return;
      if (b.dataset.acao === 'fechar') dlg.close();
      if (b.dataset.acao === 'apagar') {
        if (!b.classList.contains('confirmar')) { b.classList.add('confirmar'); b.textContent = 'Clique de novo para apagar'; return; }
        const r = await api('DELETE', `/api/${col}/${encodeURIComponent(item.id)}`);
        if (!r.ok) { form.querySelector('#erro-form').textContent = r.motivo || 'Não consegui apagar.'; return; }
        dlg.close(); carregar();
      }
    });
    dlg.showModal();
    const primeiro = form.querySelector('input:not([type=checkbox]), select');
    if (primeiro) primeiro.focus();
  }

  /* ---------------- eventos ---------------- */
  app.addEventListener('click', async e => {
    const b = e.target.closest('[data-acao]');
    const linha = e.target.closest('.linha');
    if (b) {
      const acao = b.dataset.acao;
      if (acao === 'atualizar') carregar();
      if (acao === 'novo') abrirForm(b.dataset.col);
      if (acao === 'virar') {
        const m = P.indicadores.melhorias[+b.dataset.i];
        abrirForm('melhorias', null, { titulo: m.acao, area: m.area, impacto: m.nivel === 'alta' ? 'alto' : m.nivel === 'media' ? 'médio' : 'baixo', origem: m.texto });
      }
      if (acao === 'limpar') {
        if (!b.classList.contains('confirmar')) { b.classList.add('confirmar'); b.textContent = 'Clique de novo para apagar os exemplos'; return; }
        b.disabled = true;
        const r = await api('POST', '/api/limpar-exemplos');
        if (!r.ok) { b.textContent = r.motivo || 'Não consegui apagar'; return; }
        carregar();
      }
      return;
    }
    if (linha) abrirForm(linha.dataset.col, P.colecoes[linha.dataset.col].itens.find(i => i.id === linha.dataset.id));
  });
  app.addEventListener('keydown', e => {
    const linha = e.target.closest('.linha');
    if (linha && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); linha.click(); }
  });
  app.addEventListener('input', e => {
    const col = e.target.dataset && e.target.dataset.busca;
    if (!col) return;
    busca[col] = e.target.value;
    desenhar();
  });

  carregar();
  // as outras áreas mudam os números sem avisar: relê a cada 30 s, menos com o formulário aberto
  setInterval(() => { if (!dlg.open && document.visibilityState === 'visible') carregar(); }, 30000);
})();
