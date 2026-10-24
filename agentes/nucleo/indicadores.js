/* ===========================================================
   indicadores.js — os números de cada área e o que melhorar.

   calcular(d) recebe tudo (dados.tudo()) e devolve, por área:
     kpis       os números que a área acompanha, com tom bom/atencao/ruim
     melhorias  o que fazer agora, por prioridade (alta, media, baixa),
                cada uma com o fato e a ação sugerida
     tabelas    resumos pequenos (funil, canais, despesas...)
   A Diretoria junta tudo e soma o próprio plano de melhorias.
   =========================================================== */
const { AREAS } = require('./esquemas');

const MS_DIA = 86400000;
const COMISSAO_CORRETOR = 0.4;   // parte da comissão que vai para o corretor

const pad = n => String(n).padStart(2, '0');
const quando = s => !s ? null : new Date(s.length === 7 ? s + '-01T00:00' : s.length === 10 ? s + 'T00:00' : s);
const mesDe = s => s ? String(s).slice(0, 7) : null;
const soma = (l, f) => l.reduce((t, x) => t + (Number(f(x)) || 0), 0);
const media = l => l.length ? l.reduce((a, b) => a + b, 0) / l.length : null;
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
const brl = v => (v < 0 ? '−' : '') + 'R$ ' + Math.round(Math.abs(v)).toLocaleString('pt-BR');
const brlCurto = v => {
  const a = Math.abs(v), s = v < 0 ? '−' : '';
  if (a >= 1e6) return `${s}R$ ${(a / 1e6).toFixed(2).replace('.', ',')} mi`;
  if (a >= 1e4) return `${s}R$ ${Math.round(a / 1e3)} mil`;
  return brl(v);
};
const duracao = min => min < 60 ? `${Math.round(min)} min`
  : min < 1440 ? `${(min / 60).toFixed(1).replace('.', ',')} h` : `${Math.round(min / 1440)} dias`;
const lista = (nomes, max = 3) => nomes.slice(0, max).join(', ') + (nomes.length > max ? ` e mais ${nomes.length - max}` : '');
const ORDEM = { alta: 0, media: 1, baixa: 2 };

function calcular(d, agora = new Date()) {
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const mesAtual = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}`;
  const mesAnterior = (() => { const x = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; })();
  const diasDesde = s => s ? Math.floor((hoje - quando(s)) / MS_DIA) : null;

  const porId = col => Object.fromEntries((d[col] || []).map(x => [x.id, x]));
  const contato = porId('contatos'), imovel = porId('imoveis'), negocio = porId('negocios'), corretor = porId('corretores');
  const cliente = n => (n && contato[n.contato] && contato[n.contato].nome) || 'cliente sem nome';
  const nomeCorretor = id => (corretor[id] && corretor[id].nome) || 'sem corretor';
  const codigo = id => (imovel[id] && imovel[id].codigo) || '—';

  const ns = d.negocios || [];
  const fechados = ns.filter(n => n.etapa === 'fechado');
  const vendidos = new Set(fechados.map(n => n.imovel));
  const recentes = (d.contatos || []).filter(c => c.chegou && agora - quando(c.chegou) <= 30 * MS_DIA);
  const contatosMes = (d.contatos || []).filter(c => mesDe(c.chegou) === mesAtual);
  const fechados90 = fechados.filter(n => diasDesde(n.fechadoEm || n.atualizado) <= 90);

  /* ---------------- Atendimento ---------------- */
  const atendimento = (() => {
    const cs = d.contatos || [];
    const tempo = c => (quando(c.respondido) - quando(c.chegou)) / 60000;
    const tempos = recentes.filter(c => c.respondido).map(tempo).filter(t => t >= 0);
    const tMedio = media(tempos);
    const em1h = pct(tempos.filter(t => t <= 60).length, tempos.length);
    const esperando = cs.filter(c => !c.respondido && c.status !== 'descartado');
    const atrasados = esperando.filter(c => agora - quando(c.chegou) > 2 * 3600000);
    const semCorretor = cs.filter(c => ['em atendimento', 'encaminhado'].includes(c.status) && !c.corretor);
    const descartados = recentes.filter(c => c.status === 'descartado').length;

    const melhorias = [];
    if (atrasados.length) melhorias.push({ nivel: 'alta',
      texto: `${plural(atrasados.length, 'contato esperando', 'contatos esperando')} resposta há mais de 2 horas: ${lista(atrasados.map(c => c.nome))}.`,
      acao: 'Responder agora. Quem pede informação de imóvel costuma falar com várias imobiliárias, e a primeira que responde sai na frente.' });
    if (tMedio !== null && tMedio > 30) melhorias.push({ nivel: tMedio > 60 ? 'alta' : 'media',
      texto: `O tempo médio de primeira resposta está em ${duracao(tMedio)} nos últimos 30 dias.`,
      acao: 'Meta de 15 minutos no horário comercial. Deixe respostas prontas por imóvel e um plantão para os contatos da noite.' });
    if (semCorretor.length) melhorias.push({ nivel: 'media',
      texto: `${plural(semCorretor.length, 'contato em atendimento está', 'contatos em atendimento estão')} sem corretor: ${lista(semCorretor.map(c => c.nome))}.`,
      acao: 'Definir um corretor para cada um hoje, por rodízio ou por região do imóvel.' });
    if (recentes.length >= 5 && pct(descartados, recentes.length) >= 20) melhorias.push({ nivel: 'baixa',
      texto: `${pct(descartados, recentes.length)}% dos contatos dos últimos 30 dias foram descartados.`,
      acao: 'Ver com o Marketing de quais canais vêm os descartes e ajustar o público dos anúncios.' });

    const canais = [...new Set(recentes.map(c => c.canal).filter(Boolean))];
    return {
      kpis: [
        { rotulo: 'Contatos no mês', valor: contatosMes.length, detalhe: `${recentes.length} nos últimos 30 dias` },
        { rotulo: 'Tempo médio de resposta', valor: tMedio === null ? '—' : duracao(tMedio), detalhe: 'últimos 30 dias · meta 15 min',
          tom: tMedio === null ? null : tMedio <= 15 ? 'bom' : tMedio <= 60 ? 'atencao' : 'ruim' },
        { rotulo: 'Respondidos em até 1 h', valor: tempos.length ? em1h + '%' : '—', detalhe: 'últimos 30 dias',
          tom: !tempos.length ? null : em1h >= 80 ? 'bom' : em1h >= 50 ? 'atencao' : 'ruim' },
        { rotulo: 'Esperando resposta', valor: esperando.length, detalhe: atrasados.length ? `${atrasados.length} há mais de 2 h` : 'nenhum atrasado',
          tom: atrasados.length ? 'ruim' : esperando.length ? 'atencao' : 'bom' }
      ],
      melhorias,
      tabelas: [{
        titulo: 'Contatos por canal · últimos 30 dias', colunas: ['Canal', 'Contatos', 'Resposta média'],
        linhas: canais.map(k => {
          const doCanal = recentes.filter(c => c.canal === k);
          const t = media(doCanal.filter(c => c.respondido).map(tempo));
          return [k, doCanal.length, t === null ? '—' : duracao(t)];
        }).sort((a, b) => b[1] - a[1])
      }]
    };
  })();

  /* ---------------- Comercial ---------------- */
  const comercial = (() => {
    const fechadosMes = fechados.filter(n => mesDe(n.fechadoEm) === mesAtual);
    const vgvMes = soma(fechadosMes, n => n.valor);
    const meta = (d.metas || []).find(m => m.mes === mesAtual);
    const ativos = ns.filter(n => !['fechado', 'perdido'].includes(n.etapa));
    const parados = ativos.filter(n => n.atualizado && diasDesde(n.atualizado) > 7);
    const propostas = ativos.filter(n => n.etapa === 'proposta' && diasDesde(n.atualizado) > 3);
    const encerrados = ns.filter(n => ['fechado', 'perdido'].includes(n.etapa) && diasDesde(n.fechadoEm || n.atualizado) <= 90);
    const taxa = pct(encerrados.filter(n => n.etapa === 'fechado').length, encerrados.length);
    const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const projecao = fechadosMes.length / agora.getDate() * diasNoMes;
    const perdas = ns.filter(n => n.etapa === 'perdido' && n.motivoPerda);
    const motivos = {};
    for (const n of perdas) motivos[n.motivoPerda] = (motivos[n.motivoPerda] || 0) + 1;
    const [topMotivo, topQtd] = Object.entries(motivos).sort((a, b) => b[1] - a[1])[0] || [];
    const ACAO_PERDA = {
      'financiamento negado': 'Simular o crédito antes da visita, com um correspondente bancário parceiro, para só levar quem já tem financiamento viável.',
      'preço': 'Rever o preço com os proprietários usando as vendas recentes do bairro.',
      'comprou com outra imobiliária': 'Medir o tempo de resposta e o retorno depois da visita: quem compra com outra costuma ter esfriado no caminho.',
      'imóvel não atendeu': 'Perguntar mais na qualificação (quartos, vaga, bairro, orçamento) antes de agendar a visita.'
    };

    const melhorias = [];
    if (propostas.length) melhorias.push({ nivel: 'alta',
      texto: `${plural(propostas.length, 'proposta está parada', 'propostas estão paradas')} há mais de 3 dias: ${lista(propostas.map(n => `${cliente(n)} (${codigo(n.imovel)})`))}.`,
      acao: 'Levar uma resposta do proprietário ou uma contraproposta ainda hoje. Proposta parada esfria rápido.' });
    if (parados.length) melhorias.push({ nivel: 'alta',
      texto: `${plural(parados.length, 'negociação está', 'negociações estão')} sem movimento há mais de 7 dias: ${lista(parados.map(cliente))}.`,
      acao: 'Ligar para cada cliente, registrar o próximo passo e a data na negociação.' });
    if (meta && meta.vendas && projecao < meta.vendas) melhorias.push({ nivel: projecao < meta.vendas * 0.7 ? 'alta' : 'media',
      texto: `No ritmo atual o mês fecha com ${projecao.toFixed(1).replace('.', ',')} vendas. A meta é ${meta.vendas}.`,
      acao: 'Concentrar a semana nas negociações em proposta e com visita feita, que estão mais perto do fechamento.' });
    if (!meta) melhorias.push({ nivel: 'media', texto: 'Não há meta cadastrada para este mês.', acao: 'Cadastrar em Metas do mês a quantidade de vendas e o VGV esperados.' });
    if (topMotivo && topQtd >= 2) melhorias.push({ nivel: 'media',
      texto: `"${topMotivo}" é o principal motivo de perda: ${topQtd} de ${perdas.length} negociações perdidas.`,
      acao: ACAO_PERDA[topMotivo] || 'Entender o padrão dessas perdas e treinar a equipe nesse ponto.' });
    const ociosos = (d.corretores || []).filter(c => c.ativo && !ativos.some(n => n.corretor === c.id));
    if (ociosos.length) melhorias.push({ nivel: 'baixa',
      texto: `${lista(ociosos.map(c => c.nome))} ${ociosos.length === 1 ? 'está' : 'estão'} sem nenhuma negociação em andamento.`,
      acao: 'Direcionar os próximos contatos para quem está com a carteira vazia.' });

    const ETAPAS = ['visita agendada', 'visita feita', 'proposta'];
    return {
      kpis: [
        { rotulo: 'Vendas no mês', valor: meta && meta.vendas ? `${fechadosMes.length} de ${meta.vendas}` : fechadosMes.length,
          detalhe: meta ? `projeção: ${projecao.toFixed(1).replace('.', ',')} até o fim do mês` : 'sem meta cadastrada',
          tom: meta && meta.vendas ? (projecao >= meta.vendas ? 'bom' : projecao >= meta.vendas * 0.7 ? 'atencao' : 'ruim') : null },
        { rotulo: 'VGV no mês', valor: brlCurto(vgvMes), detalhe: meta && meta.vgv ? `${pct(vgvMes, meta.vgv)}% da meta de ${brlCurto(meta.vgv)}` : 'valor geral vendido' },
        { rotulo: 'Negociações em andamento', valor: ativos.length, detalhe: parados.length ? `${parados.length} paradas há mais de 7 dias` : 'todas com movimento recente',
          tom: parados.length ? 'atencao' : 'bom' },
        { rotulo: 'Taxa de fechamento', valor: encerrados.length ? taxa + '%' : '—', detalhe: 'vendas ÷ negociações encerradas em 90 dias' }
      ],
      melhorias,
      tabelas: [
        { titulo: 'Funil agora', colunas: ['Etapa', 'Negociações'],
          linhas: ETAPAS.map(e => [e, ativos.filter(n => n.etapa === e).length]) },
        { titulo: 'Corretores no mês', colunas: ['Corretor', 'Vendas', 'VGV', 'Em andamento'],
          linhas: (d.corretores || []).filter(c => c.ativo).map(c => {
            const v = fechadosMes.filter(n => n.corretor === c.id);
            return [c.nome, v.length, brlCurto(soma(v, n => n.valor)), ativos.filter(n => n.corretor === c.id).length];
          }).sort((a, b) => b[1] - a[1] || b[3] - a[3]) }
      ]
    };
  })();

  /* ---------------- Marketing ---------------- */
  const marketing = (() => {
    const is = d.imoveis || [];
    const aVenda = is.filter(i => !vendidos.has(i.id));
    const anunciados = aVenda.filter(i => i.status !== 'pausado');
    const estoque = media(aVenda.map(i => diasDesde(i.captadoEm)).filter(x => x !== null));
    const comProposta = new Set(ns.filter(n => ['proposta', 'fechado'].includes(n.etapa)).map(n => n.imovel));
    const encalhados = aVenda.filter(i => diasDesde(i.captadoEm) > 90 && !comProposta.has(i.id));
    const semFotos = anunciados.filter(i => !i.fotos);
    const semTour = anunciados.filter(i => !i.tour && (i.preco || 0) >= 800000);
    const invMes = (d.investimentos || []).filter(x => x.mes === mesAtual);
    const totalInv = soma(invMes, x => x.valor);
    const canais = [...new Set([...invMes.map(x => x.canal), ...contatosMes.map(c => c.canal)].filter(Boolean))];
    const linhas = canais.map(k => {
      const inv = soma(invMes.filter(x => x.canal === k), x => x.valor);
      const cont = contatosMes.filter(c => c.canal === k).length;
      const vendas = fechados90.filter(n => contato[n.contato] && contato[n.contato].canal === k).length;
      return { canal: k, inv, cont, vendas };
    }).sort((a, b) => b.vendas - a.vendas || b.cont - a.cont);

    const melhorias = [];
    if (encalhados.length) melhorias.push({ nivel: 'alta',
      texto: `${plural(encalhados.length, 'imóvel está', 'imóveis estão')} há mais de 90 dias sem nenhuma proposta: ${lista(encalhados.map(i => `${i.codigo} (${diasDesde(i.captadoEm)} dias)`))}.`,
      acao: 'Rever o preço com o proprietário, refazer fotos e anúncio e dar destaque nos portais.' });
    if (semFotos.length) melhorias.push({ nivel: 'media',
      texto: `${plural(semFotos.length, 'anúncio está', 'anúncios estão')} sem fotos profissionais: ${lista(semFotos.map(i => i.codigo), 5)}.`,
      acao: 'Agendar o fotógrafo. A foto é a primeira coisa que o comprador vê no portal.' });
    for (const l of linhas) if (l.inv > 0 && l.cont > 0 && l.vendas === 0) melhorias.push({ nivel: 'media',
      texto: `${l.canal}: ${brl(l.inv)} investidos no mês, ${plural(l.cont, 'contato', 'contatos')} e nenhuma venda nos últimos 90 dias.`,
      acao: 'Revisar público e criativo do anúncio, ou mover parte da verba para o canal que mais vende.' });
    const melhor = linhas.find(l => l.vendas > 0);
    if (melhor) melhorias.push({ nivel: 'baixa',
      texto: `${melhor.canal} gerou ${melhor.vendas} das ${fechados90.length} vendas dos últimos 90 dias${melhor.inv ? '' : ', sem custo de anúncio'}.`,
      acao: melhor.canal === 'Indicação' ? 'Criar um programa de indicação com bônus para clientes e parceiros.' : 'Reforçar esse canal com mais imóveis em destaque.' });
    if (semTour.length) melhorias.push({ nivel: 'baixa',
      texto: `Imóveis de alto padrão sem tour virtual: ${lista(semTour.map(i => i.codigo), 5)}.`,
      acao: 'Gravar o tour: comprador de alto padrão filtra muito antes de visitar.' });

    return {
      kpis: [
        { rotulo: 'Imóveis à venda', valor: aVenda.length, detalhe: `${anunciados.length} com anúncio ativo` },
        { rotulo: 'Tempo médio em estoque', valor: estoque === null ? '—' : `${Math.round(estoque)} dias`,
          detalhe: encalhados.length ? `${encalhados.length} há mais de 90 dias sem proposta` : 'nenhum encalhado',
          tom: estoque === null ? null : estoque > 90 ? 'ruim' : estoque > 60 ? 'atencao' : 'bom' },
        { rotulo: 'Investimento no mês', valor: brlCurto(totalInv), detalhe: `${contatosMes.length} contatos no mês` },
        { rotulo: 'Custo por contato', valor: contatosMes.length ? brl(totalInv / contatosMes.length) : '—', detalhe: 'investimento ÷ contatos do mês' }
      ],
      melhorias,
      tabelas: [{ titulo: 'Canais no mês', colunas: ['Canal', 'Investimento', 'Contatos', 'Custo por contato', 'Vendas em 90 dias'],
        linhas: linhas.map(l => [l.canal, brl(l.inv), l.cont, l.cont ? brl(l.inv / l.cont) : '—', l.vendas]) }]
    };
  })();

  /* ---------------- Jurídico ---------------- */
  const juridico = (() => {
    const ps = d.processos || [];
    const comProcesso = new Set(ps.map(p => p.negocio));
    const semProcesso = fechados.filter(n => !comProcesso.has(n.id));
    const abertos = ps.filter(p => !p.registro);
    const DOCS = [['matricula', 'matrícula'], ['certidoes', 'certidões'], ['itbi', 'ITBI'], ['escritura', 'escritura'], ['registro', 'registro']];
    const falta = p => DOCS.filter(([k]) => !p[k]).map(([, r]) => r);
    const quem = p => cliente(negocio[p.negocio]);
    const diasAte = p => -diasDesde(p.prazoEscritura);
    const semEscritura = abertos.filter(p => !p.escritura && p.prazoEscritura);
    const vencidos = semEscritura.filter(p => diasAte(p) < 0);
    const logo = semEscritura.filter(p => diasAte(p) >= 0 && diasAte(p) <= 7);
    const negados = abertos.filter(p => p.financiamento === 'negado');
    const semRegistro = abertos.filter(p => p.escritura);
    const pendentes = soma(abertos, p => falta(p).length);

    const melhorias = [];
    if (semProcesso.length) melhorias.push({ nivel: 'alta',
      texto: `${plural(semProcesso.length, 'venda fechada está', 'vendas fechadas estão')} sem processo aberto: ${lista(semProcesso.map(cliente))}.`,
      acao: 'Abrir o processo hoje e pedir matrícula atualizada e certidões do vendedor.' });
    for (const p of vencidos) melhorias.push({ nivel: 'alta',
      texto: `A escritura de ${quem(p)} venceu há ${plural(-diasAte(p), 'dia', 'dias')}. Falta: ${falta(p).join(', ')}.`,
      acao: 'Ligar para as partes, fechar uma nova data e registrar o novo prazo por escrito.' });
    for (const p of logo) melhorias.push({ nivel: falta(p).length > 2 ? 'alta' : 'media',
      texto: `A escritura de ${quem(p)} vence em ${plural(diasAte(p), 'dia', 'dias')} e ainda falta: ${falta(p).filter(x => x !== 'registro').join(', ')}.`,
      acao: 'Cobrar os documentos hoje. Se não der tempo, renegociar o prazo antes de vencer.' });
    for (const p of negados) melhorias.push({ nivel: 'alta',
      texto: `O financiamento de ${quem(p)} foi negado.`,
      acao: 'Avisar o Comercial e o vendedor e buscar outro banco ou outra forma de pagamento.' });
    if (semRegistro.length) melhorias.push({ nivel: 'media',
      texto: `${plural(semRegistro.length, 'escritura assinada ainda não foi registrada', 'escrituras assinadas ainda não foram registradas')}: ${lista(semRegistro.map(quem))}.`,
      acao: 'Acompanhar o cartório. Sem o registro o comprador ainda não é dono do imóvel.' });

    return {
      kpis: [
        { rotulo: 'Processos em andamento', valor: abertos.length, detalhe: `${ps.length - abertos.length} concluídos` },
        { rotulo: 'Escrituras em 7 dias', valor: logo.length, detalhe: vencidos.length ? `${vencidos.length} já vencidas` : 'nenhuma vencida',
          tom: vencidos.length ? 'ruim' : logo.length ? 'atencao' : 'bom' },
        { rotulo: 'Vendas sem processo', valor: semProcesso.length, detalhe: 'vendas fechadas ainda sem acompanhamento', tom: semProcesso.length ? 'ruim' : 'bom' },
        { rotulo: 'Documentos pendentes', valor: pendentes, detalhe: 'somando todos os processos abertos' }
      ],
      melhorias,
      tabelas: [{ titulo: 'Processos abertos', colunas: ['Cliente', 'Imóvel', 'Pagamento', 'Falta', 'Prazo da escritura'],
        linhas: abertos.map(p => {
          const n = negocio[p.negocio] || {};
          const prazo = p.prazoEscritura ? (diasAte(p) < 0 ? `vencido há ${-diasAte(p)} d` : `em ${diasAte(p)} d`) : '—';
          return [quem(p), codigo(n.imovel), p.financiamento || '—', falta(p).join(', ') || 'nada', prazo];
        }) }]
    };
  })();

  /* ---------------- Financeiro ---------------- */
  const financeiro = (() => {
    const cs = d.comissoes || [];
    const valor = c => ((negocio[c.negocio] || {}).valor || 0) * (c.percentual || 0) / 100;
    const lancadas = new Set(cs.map(c => c.negocio));
    const semLancamento = fechados.filter(n => !lancadas.has(n.id));
    const aReceber = cs.filter(c => !c.recebidoEm);
    const atrasadas = aReceber.filter(c => diasDesde((negocio[c.negocio] || {}).fechadoEm) > 15);
    const recebidoMes = soma(cs.filter(c => mesDe(c.recebidoEm) === mesAtual), valor);
    const aPagar = soma(cs.filter(c => c.recebidoEm && !c.pagoCorretorEm), c => valor(c) * COMISSAO_CORRETOR);
    const desp = m => (d.despesas || []).filter(x => x.mes === m);
    const despMes = soma(desp(mesAtual), x => x.valor), despAnt = soma(desp(mesAnterior), x => x.valor);
    const resultado = recebidoMes * (1 - COMISSAO_CORRETOR) - despMes;
    const ticket = media(fechados.map(n => n.valor).filter(Boolean));
    const liquidoPorVenda = ticket ? ticket * 0.06 * (1 - COMISSAO_CORRETOR) : null;
    const equilibrio = liquidoPorVenda ? despMes / liquidoPorVenda : null;

    const melhorias = [];
    if (semLancamento.length) melhorias.push({ nivel: 'alta',
      texto: `${plural(semLancamento.length, 'venda fechada está', 'vendas fechadas estão')} sem comissão lançada: ${lista(semLancamento.map(n => `${cliente(n)} (${brlCurto(n.valor || 0)})`))}.`,
      acao: 'Lançar a comissão e emitir o recibo ou a nota para quem paga.' });
    for (const c of atrasadas) melhorias.push({ nivel: 'alta',
      texto: `A comissão de ${cliente(negocio[c.negocio])} (${brl(valor(c))}) não foi recebida ${diasDesde(negocio[c.negocio].fechadoEm)} dias depois do fechamento.`,
      acao: 'Cobrar e combinar por escrito a data do pagamento.' });
    if (aPagar > 0) melhorias.push({ nivel: 'media',
      texto: `${brl(aPagar)} de comissão já recebida ainda não foram repassados aos corretores.`,
      acao: 'Fazer o repasse. Corretor pago em dia fica e vende mais.' });
    if (despMes && resultado < 0) melhorias.push({ nivel: 'alta',
      texto: `O mês está no vermelho até agora: ${brl(resultado)}.`,
      acao: equilibrio ? `Com o ticket médio atual, são necessárias ${Math.ceil(equilibrio)} vendas por mês para cobrir as despesas.` : 'Rever as despesas fixas e acelerar o recebimento das comissões.' });
    if (despAnt && despMes > despAnt * 1.1) {
      const sobe = [...new Set(desp(mesAtual).map(x => x.categoria))]
        .map(k => [k, soma(desp(mesAtual).filter(x => x.categoria === k), x => x.valor) - soma(desp(mesAnterior).filter(x => x.categoria === k), x => x.valor)])
        .sort((a, b) => b[1] - a[1])[0];
      melhorias.push({ nivel: 'media',
        texto: `As despesas subiram ${pct(despMes - despAnt, despAnt)}% em relação ao mês passado${sobe && sobe[1] > 0 ? `, puxadas por ${sobe[0]} (+${brl(sobe[1])})` : ''}.`,
        acao: 'Confirmar se o aumento trouxe resultado; se não, voltar ao valor anterior.' });
    }
    if (equilibrio) melhorias.push({ nivel: 'baixa',
      texto: `Ponto de equilíbrio: ${equilibrio.toFixed(1).replace('.', ',')} vendas por mês com o ticket médio de ${brlCurto(ticket)}.`,
      acao: 'Usar esse número como piso da meta do Comercial.' });

    const cats = [...new Set(desp(mesAtual).map(x => x.categoria))];
    return {
      kpis: [
        { rotulo: 'Comissões a receber', valor: brlCurto(soma(aReceber, valor) + soma(semLancamento, n => (n.valor || 0) * 0.06)),
          detalhe: plural(aReceber.length + semLancamento.length, 'venda', 'vendas') + (semLancamento.length ? `, ${semLancamento.length} sem lançamento (estimado em 6%)` : ''),
          tom: atrasadas.length || semLancamento.length ? 'ruim' : aReceber.length ? 'atencao' : 'bom' },
        { rotulo: 'Recebido no mês', valor: brlCurto(recebidoMes), detalhe: 'comissões que entraram no caixa' },
        { rotulo: 'Despesas do mês', valor: brlCurto(despMes), detalhe: despAnt ? `${despMes >= despAnt ? '+' : '−'}${Math.abs(pct(despMes - despAnt, despAnt))}% contra o mês passado` : '' },
        { rotulo: 'Resultado do mês', valor: brlCurto(resultado), detalhe: 'comissões líquidas − despesas', tom: resultado >= 0 ? 'bom' : 'ruim' }
      ],
      melhorias,
      tabelas: [{ titulo: 'Despesas do mês por categoria', colunas: ['Categoria', 'Valor', 'Mês passado'],
        linhas: cats.map(k => [k, soma(desp(mesAtual).filter(x => x.categoria === k), x => x.valor), soma(desp(mesAnterior).filter(x => x.categoria === k), x => x.valor)])
          .sort((a, b) => b[1] - a[1]).map(([k, a, b]) => [k, brl(a), brl(b)]) }]
    };
  })();

  /* ---------------- Diretoria ---------------- */
  const areas = { atendimento, comercial, marketing, juridico, financeiro };
  for (const [k, a] of Object.entries(areas)) {
    a.melhorias.sort((x, y) => ORDEM[x.nivel] - ORDEM[y.nivel]);
    for (const m of a.melhorias) m.area = AREAS[k].nome;
  }

  const diretoria = (() => {
    const plano = d.melhorias || [];
    const atrasadas = plano.filter(m => m.status !== 'feito' && m.prazo && diasDesde(m.prazo) > 0);
    const proprias = atrasadas.map(m => ({ nivel: 'media', area: 'Diretoria',
      texto: `A melhoria "${m.titulo}" passou do prazo há ${plural(diasDesde(m.prazo), 'dia', 'dias')}.`,
      acao: `Conversar com ${m.responsavel || 'o responsável'} e rever o prazo ou o plano.` }));
    const todas = [...proprias, ...Object.values(areas).flatMap(a => a.melhorias)]
      .sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel]);
    const altas = todas.filter(m => m.nivel === 'alta').length;
    return {
      kpis: [
        comercial.kpis[0], comercial.kpis[1], financeiro.kpis[3],
        { rotulo: 'Pontos urgentes', valor: altas, detalhe: 'prioridade alta em todas as áreas', tom: altas ? 'ruim' : 'bom' },
        { rotulo: 'Melhorias em andamento', valor: plano.filter(m => m.status === 'fazendo').length,
          detalhe: `${plural(plano.filter(m => m.status === 'ideia').length, 'ideia', 'ideias')} · ${plural(plano.filter(m => m.status === 'feito').length, 'feita', 'feitas')}` }
      ],
      melhorias: todas,
      tabelas: [],
      resumo: Object.entries(areas).map(([k, a]) => ({
        area: k, nome: AREAS[k].nome, agente: AREAS[k].agente, cor: AREAS[k].cor, porta: AREAS[k].porta,
        kpis: a.kpis.slice(0, 2), altas: a.melhorias.filter(m => m.nivel === 'alta').length, total: a.melhorias.length
      }))
    };
  })();

  return { atendimento, comercial, marketing, juridico, financeiro, diretoria };
}

/** texto em Markdown para o agente ler (RELATORIO.md) e para o terminal */
function relatorio(area, ind, agora = new Date()) {
  const a = AREAS[area], r = ind[area];
  const linhas = [
    `# Relatório de ${a.nome} · Imobiliária Come Home`,
    '',
    `Gerado em ${agora.toLocaleString('pt-BR')}. Este arquivo é refeito pelo sistema a cada mudança; não edite.`,
    '',
    '## Números',
    ...r.kpis.map(k => `- **${k.rotulo}:** ${k.valor}${k.detalhe ? ` (${k.detalhe})` : ''}`),
    '',
    '## O que melhorar agora',
    ...(r.melhorias.length ? r.melhorias.map(m => `- [${m.nivel}]${m.area && area === 'diretoria' ? ` ${m.area}:` : ''} ${m.texto} → ${m.acao}`) : ['- Nada urgente.'])
  ];
  for (const t of r.tabelas || []) {
    linhas.push('', `## ${t.titulo}`, '', `| ${t.colunas.join(' | ')} |`, `| ${t.colunas.map(() => '---').join(' | ')} |`,
      ...t.linhas.map(l => `| ${l.join(' | ')} |`));
  }
  if (r.resumo) {
    linhas.push('', '## Áreas', ...r.resumo.map(s => `- **${s.nome}** (${s.agente}): ${s.kpis.map(k => `${k.rotulo} ${k.valor}`).join(' · ')} · ${s.altas} urgentes`));
  }
  return linhas.join('\n') + '\n';
}

module.exports = { calcular, relatorio };
