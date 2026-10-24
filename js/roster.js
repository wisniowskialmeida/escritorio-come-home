/* ===========================================================
   roster.js — quem trabalha aqui.
   BOSSES  : o dono e a sócia (sempre em serviço, na Diretoria)
   CATALOG : os agentes da Come Home, o de exemplo e vagas sugeridas
   =========================================================== */
const ROSTER = (() => {

  const KEY = 'escritorio-agentes-v1';

  /* ===========================================================
     O DONO — o nome vem de data/config.json ("dono")
     =========================================================== */
  const BOSSES = [
    {
      id: 'boss-1', name: (window.ESCRITORIO && ESCRITORIO.dono) || 'Você', role: 'Dono · Diretoria',
      emoji: '⭐', boss: true, dept: 'diretoria', slotId: 'DIR-1',
      status: 'trabalhando', locked: true,
      source: 'Diretoria', sistema: null,
      brief: 'Quem manda aqui. Sempre em serviço.',
      look: {
        skin: '#d9a17a', hair: '#2a1d14', style: 'curto',
        shirt: '#334155', pants: '#1e293b', shoes: '#15181f',
        glasses: null, beard: null, tattoo: false, cap: false,
        uniforme: false
      }
    },
    {
      id: 'boss-2', name: (window.ESCRITORIO && ESCRITORIO.socia) || 'Day', role: 'Sócia · Diretoria',
      emoji: '⭐', boss: true, dept: 'diretoria', slotId: 'DIR-2',
      status: 'trabalhando', locked: true,
      source: 'Diretoria', sistema: null,
      brief: 'Sócia da Come Home. Sempre em serviço.',
      look: {
        skin: '#d9a77e', hair: '#2a1a12', style: 'longo',
        shirt: '#c0654a', pants: '#2b2d3a', shoes: '#15181f',
        glasses: null, beard: null, tattoo: false, cap: false,
        uniforme: false
      }
    }
  ];

  /* ===========================================================
     BANCO DE TALENTOS
     'detectado' = tem sistema no registro (data/sistemas.json)
     'sugerido'  = vaga de ideia; contrate e depois ligue um sistema a ela
     =========================================================== */
  const CATALOG = [
    /* ---- os agentes da Come Home: cada um opera o sistema da pasta agentes/<área> ---- */
    {
      key: 'atendimento', name: 'Lia', role: 'Atendimento', emoji: '🎧', cat: 'detectado',
      system: 'Atendimento · Lia', sistema: 'atendimento',
      desc: 'Responde todo contato que chega e entrega ao corretor certo.',
      why: 'Quem pede informação de imóvel fala com várias imobiliárias. A primeira que responde sai na frente.',
      look: { skin: '#e2b48b', hair: '#5a3b24', style: 'coque', shirt: '#cfa441', pants: '#1b2030', glasses: null, beard: null }
    },
    {
      key: 'comercial', name: 'Bento', role: 'Comercial', emoji: '🔑', cat: 'detectado',
      system: 'Comercial · Bento', sistema: 'comercial',
      desc: 'Acompanha visitas, propostas e vendas de cada corretor, e a meta do mês.',
      why: 'É onde o faturamento acontece: nenhuma negociação pode esfriar sem alguém ver.',
      look: { skin: '#c9854f', hair: '#1a120d', style: 'fade', shirt: '#d9a531', pants: '#26304a', glasses: null, beard: 'cavanhaque' }
    },
    {
      key: 'marketing', name: 'Nina', role: 'Marketing', emoji: '📣', cat: 'detectado',
      system: 'Marketing · Nina', sistema: 'marketing',
      desc: 'Cuida dos anúncios dos imóveis e de quanto custa cada contato em cada canal.',
      why: 'Imóvel bem anunciado vende mais rápido, e verba no canal certo traz comprador de verdade.',
      look: { skin: '#e0a878', hair: '#b8532b', style: 'longo', shirt: '#e2803a', pants: '#26304a', glasses: null, beard: null }
    },
    {
      key: 'juridico', name: 'Teo', role: 'Jurídico', emoji: '⚖️', cat: 'detectado',
      system: 'Jurídico · Teo', sistema: 'juridico',
      desc: 'Leva cada venda fechada até a escritura e o registro, com os documentos em dia.',
      why: 'Venda só termina no cartório. Prazo perdido vira dor de cabeça para cliente e corretor.',
      look: { skin: '#f0c29b', hair: '#3b2a1e', style: 'curto', shirt: '#5b5aa8', pants: '#1b2030', glasses: 'retangular', beard: null }
    },
    {
      key: 'financeiro', name: 'Rui', role: 'Financeiro', emoji: '🧾', cat: 'detectado',
      system: 'Financeiro · Rui', sistema: 'financeiro',
      desc: 'Cobra as comissões, paga os corretores e acompanha despesas e resultado do mês.',
      why: 'Comissão esquecida é dinheiro perdido. Caixa em dia mostra o que dá para investir.',
      look: { skin: '#c6936b', hair: '#111111', style: 'curto', shirt: '#3f8f5c', pants: '#26304a', glasses: 'redondo', beard: 'cheia' }
    },
    {
      key: 'diretoria', name: 'Clara', role: 'Assistente da Diretoria', emoji: '🧭', cat: 'detectado',
      system: 'Diretoria · Clara', sistema: 'diretoria',
      desc: 'Junta o que todas as áreas veem e mantém o plano de melhorias do Vitor e da Day.',
      why: 'Com cinco áreas apontando problemas, alguém precisa dizer o que vem primeiro.',
      look: { skin: '#f7d7bd', hair: '#140f0c', style: 'longo', shirt: '#2f7a57', pants: '#1b2030', glasses: 'redondo', beard: null }
    },
    {
      key: 'exemplo', name: 'EXEMPLO', role: 'Agente de demonstração', emoji: '🤖',
      cat: 'detectado', system: 'Agente de exemplo', sistema: 'exemplo',
      desc: 'Um sistema mínimo que vem junto, na pasta exemplo-agente: sobe na porta 4401 e mostra uma página.',
      why: 'Serve de molde. Clique no computador dele para ver o escritório ligar, embutir e conversar com um sistema. Depois cadastre os seus.',
      look: { skin: '#c9854f', hair: '#140f0c', style: 'cacheado', shirt: '#38bdf8', pants: '#26304a', glasses: null, beard: null }
    },
    {
      key: 'sdr', name: 'Léo', role: 'Prospecção & SDR', emoji: '🎯', cat: 'detectado',
      system: 'Prospecção · Léo', sistema: 'prospeccao',
      desc: 'Encontra compradores e proprietários, qualifica, simula o crédito e entrega pronto para o time.',
      why: 'É o topo do funil: sem comprador novo e imóvel novo na carteira, o resto da equipe fica sem trabalho.',
      look: { skin: '#f0c29b', hair: '#241a13', style: 'fade', shirt: '#6366f1', pants: '#1b2030', glasses: null, beard: 'cavanhaque' }
    },
    {
      key: 'conteudo', name: 'Nico', role: 'Conteúdo & Redes Sociais', emoji: '📱', cat: 'detectado',
      system: 'Conteúdo · Nico', sistema: 'conteudo',
      desc: 'Planeja o calendário de posts dos imóveis e acompanha o formato que traz contato.',
      why: 'Constância nas redes custa tempo. Com o calendário em dia, todo imóvel aparece e você só aprova.',
      look: { skin: '#e0a878', hair: '#5a3a22', style: 'longo', shirt: '#f472b6', pants: '#26304a', glasses: null, beard: null }
    },
    {
      key: 'copy', name: 'Duda', role: 'Copywriter', emoji: '✍️', cat: 'detectado',
      system: 'Copy · Duda', sistema: 'copy',
      desc: 'Escreve e revisa os anúncios dos imóveis e reescreve os que não trazem contato.',
      why: 'Texto é o que converte. Anúncio com bairro, diferencial e convite para visita traz mais contato.',
      look: { skin: '#f7d7bd', hair: '#8b5a2b', style: 'curto', shirt: '#f59e0b', pants: '#1b2030', glasses: 'retangular', beard: null }
    },
    {
      key: 'dados', name: 'Cami', role: 'Dados & Relatórios', emoji: '🧮', cat: 'detectado',
      system: 'Dados · Cami', sistema: 'analise',
      desc: 'Cruza os números de todas as áreas, acha o gargalo do funil e cobra os dados que faltam.',
      why: 'Com vários agentes trabalhando, alguém precisa olhar o todo e dizer o que está funcionando.',
      look: { skin: '#f0c29b', hair: '#140f0c', style: 'longo', shirt: '#8b5cf6', pants: '#1b2030', glasses: 'redondo', beard: null }
    },
    {
      key: 'qa', name: 'Dan', role: 'QA de Sistemas', emoji: '🧪', cat: 'sugerido',
      desc: 'Roda build, typecheck e teste antes de qualquer deploy dos outros agentes.',
      why: 'Com vários agentes mexendo em código, alguém precisa ser o freio antes de subir para produção.',
      look: { skin: '#f7d7bd', hair: '#8e8e93', style: 'curto', shirt: '#0ea5e9', pants: '#26304a', glasses: 'redondo', beard: null }
    }
  ];

  /* ===========================================================
     ESTADO
     =========================================================== */
  let team = [];

  function defaults() {
    const base = BOSSES.map(b => Object.assign({}, b, { look: Object.assign({}, b.look) }));
    // começa com os seis agentes da Come Home já contratados
    for (const k of ['atendimento', 'comercial', 'marketing', 'juridico', 'financeiro', 'diretoria']) {
      const c = CATALOG.find(c => c.key === k);
      base.push(fromCatalog(c));
    }
    return base;
  }

  function fromCatalog(c) {
    return {
      id: 'ag-' + c.key,
      key: c.key,
      name: c.name,
      role: c.role,
      emoji: c.emoji,
      system: c.system || null,
      sistema: c.sistema || null,
      path: c.path || null,
      brief: c.desc,
      dept: 'servico',
      slotId: null,
      status: 'trabalhando',
      boss: false,
      locked: false,
      look: AVATAR.makeLook(c.key, c.look)
    };
  }

  /* ===========================================================
     PERSISTÊNCIA

     O disco manda. A equipe já morava só no localStorage do navegador
     e um dia voltou inteira ao padrão: nome que você deu, contratação,
     estação, horário — tudo perdido de uma vez, sem aviso. O navegador
     limpa storage quando quer. Agora o arquivo é data/equipe.json, no
     servidor, e o localStorage é só um espelho para quando ele estiver
     fora do ar.
     =========================================================== */
  const doLocal = () => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || 'null');
      return d && Array.isArray(d.team) && d.team.length ? d.team : null;
    } catch (e) { return null; }
  };

  async function load() {
    let vindoDoDisco = null;
    try {
      const d = await (await fetch('/api/equipe')).json();
      if (d && Array.isArray(d.team) && d.team.length) vindoDoDisco = d.team;
    } catch (e) { /* servidor fora: vale o que o navegador tiver */ }

    team = vindoDoDisco || doLocal() || defaults();
    recompor();              // equipe salva antes pode não ter os campos novos
    if (!vindoDoDisco) save();   // primeira vez ou migração: carimba no disco
  }

  /** reencaixa campos que chegaram depois de a equipe já ter sido salva,
      como o id do sistema que o agente opera */
  function recompor() {
    // equipe salva antes de a sócia existir no código: ela entra na Diretoria
    for (const b of BOSSES) {
      if (!team.some(a => a.id === b.id)) team.push(Object.assign({}, b, { look: Object.assign({}, b.look) }));
    }
    for (const a of team) {
      const c = CATALOG.find(c => c.key === a.key);
      if (c) {
        if (!a.sistema && c.sistema) a.sistema = c.sistema;
        if (c.path && a.path !== c.path) a.path = c.path;
      }
      const b = BOSSES.find(b => b.id === a.id);
      if (b && !a.sistema && b.sistema) a.sistema = b.sistema;
      // sem look o boneco não é desenhado: fica um funcionário invisível na
      // mesa. Reconstrói a partir da key, que é determinística — o mesmo
      // agente volta com a mesma cara de sempre.
      if (!a.look || !a.look.skin) {
        const base = (c && c.look) || (b && b.look) || {};
        a.look = AVATAR.makeLook(a.key || a.id, Object.assign({}, base));
      }
    }
  }

  let gravando = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ team, v: 1 })); }
    catch (e) { /* storage bloqueado: o disco ainda pega */ }
    // junta as chamadas seguidas num POST só — arrastar um agente dispara
    // save() várias vezes por segundo
    clearTimeout(gravando);
    gravando = setTimeout(() => {
      fetch('/api/equipe', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team, v: 1 })
      }).catch(() => { /* offline: fica o espelho do navegador */ });
    }, 300);
  }

  function reset() { team = defaults(); save(); }

  /* ---------- operações ---------- */
  function hire(key) {
    const c = CATALOG.find(c => c.key === key);
    if (!c || team.some(a => a.key === key)) return null;
    const a = fromCatalog(c);
    team.push(a); save();
    return a;
  }

  function hireCustom(data) {
    const key = 'custom-' + Date.now().toString(36);
    const a = {
      id: 'ag-' + key, key,
      name: data.name || 'Novo agente',
      role: data.role || 'Função a definir',
      emoji: data.emoji || '🤖',
      system: data.system || null, path: data.path || null,
      sistema: data.sistema || null, reuniao: data.reuniao !== false,
      brief: data.brief || '',
      dept: 'servico', slotId: null, status: 'trabalhando',
      boss: false, locked: false, custom: true,
      look: AVATAR.makeLook(key, data.look || {})
    };
    team.push(a); save();
    return a;
  }

  function fire(id) {
    const i = team.findIndex(a => a.id === id);
    if (i < 0 || team[i].locked) return false;
    team.splice(i, 1); save();
    return true;
  }

  const get = (id) => team.find(a => a.id === id);
  const all = () => team;
  const isHired = (key) => team.some(a => a.key === key);
  const count = (st) => team.filter(a => a.status === st).length;

  return { BOSSES, CATALOG, load, save, reset, hire, hireCustom, fire,
           get, all, isHired, count, fromCatalog };
})();
