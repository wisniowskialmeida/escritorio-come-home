/* ===========================================================
   exemplo.js — dados de exemplo para o primeiro dia.

   Tudo aqui sai com `exemplo: true` e aparece marcado na tela. As datas
   são relativas a hoje, para o exemplo nunca parecer velho. Não há nada
   aleatório: os seis sistemas geram exatamente o mesmo conteúdo.
   =========================================================== */
const pad = n => String(n).padStart(2, '0');

function gerar(hoje = new Date()) {
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const em = dias => new Date(base.getTime() + dias * 86400000);
  const dia = d => { const x = em(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
  const hora = (d, h, m = 0) => `${dia(d)}T${pad(h)}:${pad(m)}`;
  const mes = (delta = 0) => { const x = new Date(base.getFullYear(), base.getMonth() + delta, 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; };
  const ex = o => Object.assign(o, { exemplo: true });

  const corretores = [
    { id: 'cor-marina', nome: 'Marina Alves', creci: '123456-F', ativo: true },
    { id: 'cor-paulo', nome: 'Paulo Souza', creci: '234567-F', ativo: true },
    { id: 'cor-julia', nome: 'Júlia Ramos', creci: '345678-F', ativo: true },
    { id: 'cor-andre', nome: 'André Lima', creci: '456789-F', ativo: true }
  ].map(ex);

  const imoveis = [
    { id: 'imo-101', codigo: 'CH-101', titulo: 'Apartamento 3 dormitórios com varanda gourmet', tipo: 'apartamento', bairro: 'Jardim Botânico', preco: 890000, captadoEm: dia(-40), captador: 'cor-julia', fotos: true, tour: true, portais: 'Site, Portais, Instagram', status: 'ativo' },
    { id: 'imo-102', codigo: 'CH-102', titulo: 'Casa térrea com quintal e edícula', tipo: 'casa', bairro: 'Vila Nova', preco: 650000, captadoEm: dia(-124), captador: 'cor-paulo', fotos: false, tour: false, portais: 'Portais', status: 'ativo' },
    { id: 'imo-103', codigo: 'CH-103', titulo: 'Studio mobiliado a 300 m do metrô', tipo: 'apartamento', bairro: 'Centro', preco: 320000, captadoEm: dia(-26), captador: 'cor-andre', fotos: true, tour: false, portais: 'Site, Portais', status: 'ativo' },
    { id: 'imo-104', codigo: 'CH-104', titulo: 'Cobertura duplex com piscina', tipo: 'cobertura', bairro: 'Bela Vista', preco: 1450000, captadoEm: dia(-78), captador: 'cor-marina', fotos: true, tour: true, portais: 'Site, Portais, Instagram', status: 'ativo' },
    { id: 'imo-105', codigo: 'CH-105', titulo: 'Terreno plano de 450 m²', tipo: 'terreno', bairro: 'Alto da Serra', preco: 280000, captadoEm: dia(-152), captador: 'cor-paulo', fotos: false, tour: false, portais: 'Placa', status: 'ativo' },
    { id: 'imo-106', codigo: 'CH-106', titulo: 'Apartamento 2 dormitórios reformado', tipo: 'apartamento', bairro: 'Jardim América', preco: 480000, captadoEm: dia(-63), captador: 'cor-marina', fotos: true, tour: false, portais: 'Site, Portais', status: 'ativo' },
    { id: 'imo-107', codigo: 'CH-107', titulo: 'Casa em condomínio com 4 suítes', tipo: 'casa', bairro: 'Portal do Sol', preco: 980000, captadoEm: dia(-96), captador: 'cor-paulo', fotos: true, tour: true, portais: 'Site, Portais, Instagram', status: 'ativo' },
    { id: 'imo-108', codigo: 'CH-108', titulo: 'Sala comercial de 40 m² com vaga', tipo: 'comercial', bairro: 'Centro', preco: 260000, captadoEm: dia(-11), captador: 'cor-andre', fotos: false, tour: false, portais: 'Site', status: 'ativo' }
  ].map(ex);

  // [id, nome, canal, imóvel, chegou(dia, h, m), minutos até responder (null = sem resposta), situação, corretor]
  const brutos = [
    ['k01', 'Renata Moraes', 'Indicação', 'imo-106', [-58, 10, 5], 12, 'encaminhado', 'cor-marina'],
    ['k02', 'Fernando Costa', 'Portais', 'imo-107', [-41, 14, 20], 35, 'encaminhado', 'cor-paulo'],
    ['k03', 'Luciana Prado', 'Instagram', 'imo-101', [-19, 9, 40], 20, 'encaminhado', 'cor-julia'],
    ['k04', 'Gustavo Nunes', 'Site', 'imo-104', [-16, 19, 10], 240, 'encaminhado', 'cor-marina'],
    ['k05', 'Patrícia Leal', 'Portais', 'imo-103', [-6, 11, 0], 95, 'encaminhado', 'cor-andre'],
    ['k06', 'Rodrigo Teixeira', 'Instagram', 'imo-102', [-45, 16, 30], 180, 'encaminhado', 'cor-paulo'],
    ['k07', 'Camila Freitas', 'Google', 'imo-101', [-24, 8, 50], 310, 'encaminhado', 'cor-andre'],
    ['k08', 'Eduardo Pires', 'Indicação', 'imo-108', [-12, 13, 15], 8, 'encaminhado', 'cor-julia'],
    ['k09', 'Bianca Rocha', 'Portais', 'imo-103', [-50, 10, 0], 60, 'encaminhado', 'cor-marina'],
    ['k10', 'Tiago Mendes', 'Instagram', 'imo-105', [-9, 21, 45], 600, 'descartado', null],
    ['k11', 'Aline Duarte', 'Google', 'imo-104', [-4, 15, 30], 150, 'em atendimento', null],
    ['k12', 'Marcos Vieira', 'Portais', 'imo-106', [-3, 10, 10], 45, 'em atendimento', 'cor-marina'],
    ['k13', 'Sofia Andrade', 'Instagram', 'imo-101', [-1, 18, 25], null, 'novo', null],
    ['k14', 'Henrique Barros', 'Site', 'imo-107', [0, 8, 15], null, 'novo', null],
    ['k15', 'Vanessa Lopes', 'Placa', 'imo-105', [-2, 9, 30], 25, 'descartado', null],
    ['k16', 'Ricardo Alves', 'Google', 'imo-108', [-1, 11, 0], 70, 'em atendimento', null]
  ];
  const contatos = brutos.map(([id, nome, canal, imovel, [d, h, m], resp, status, corretor], n) => {
    const chegou = hora(d, h, m);
    let respondido = null;
    if (resp !== null) {
      const t = new Date(em(d).getTime() + (h * 60 + m + resp) * 60000);
      respondido = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}T${pad(t.getHours())}:${pad(t.getMinutes())}`;
    }
    return ex({ id, nome, telefone: `(11) 9${8100 + n * 37}-${pad(10 + n * 3)}${pad(40 + n)}`, canal, imovel, chegou, respondido, status, corretor, obs: null });
  });

  const negocios = [
    { id: 'neg-01', contato: 'k01', imovel: 'imo-106', corretor: 'cor-marina', etapa: 'fechado', valor: 465000, atualizado: dia(-22), fechadoEm: dia(-22), motivoPerda: null },
    { id: 'neg-02', contato: 'k02', imovel: 'imo-107', corretor: 'cor-paulo', etapa: 'fechado', valor: 945000, atualizado: dia(-7), fechadoEm: dia(-7), motivoPerda: null },
    { id: 'neg-03', contato: 'k03', imovel: 'imo-101', corretor: 'cor-julia', etapa: 'proposta', valor: 850000, atualizado: dia(-5), fechadoEm: null, motivoPerda: null },
    { id: 'neg-04', contato: 'k04', imovel: 'imo-104', corretor: 'cor-marina', etapa: 'visita feita', valor: null, atualizado: dia(-11), fechadoEm: null, motivoPerda: null },
    { id: 'neg-05', contato: 'k05', imovel: 'imo-103', corretor: 'cor-andre', etapa: 'visita agendada', valor: null, atualizado: dia(-2), fechadoEm: null, motivoPerda: null },
    { id: 'neg-06', contato: 'k06', imovel: 'imo-102', corretor: 'cor-paulo', etapa: 'perdido', valor: 610000, atualizado: dia(-33), fechadoEm: null, motivoPerda: 'financiamento negado' },
    { id: 'neg-07', contato: 'k07', imovel: 'imo-101', corretor: 'cor-andre', etapa: 'perdido', valor: 820000, atualizado: dia(-14), fechadoEm: null, motivoPerda: 'financiamento negado' },
    { id: 'neg-08', contato: 'k08', imovel: 'imo-108', corretor: 'cor-julia', etapa: 'visita agendada', valor: null, atualizado: dia(-9), fechadoEm: null, motivoPerda: null },
    { id: 'neg-09', contato: 'k09', imovel: 'imo-103', corretor: 'cor-marina', etapa: 'perdido', valor: 290000, atualizado: dia(-38), fechadoEm: null, motivoPerda: 'preço' },
    { id: 'neg-10', contato: 'k12', imovel: 'imo-106', corretor: 'cor-marina', etapa: 'visita agendada', valor: null, atualizado: dia(-1), fechadoEm: null, motivoPerda: null }
  ].map(ex);

  const metas = [{ id: 'met-atual', mes: mes(0), vendas: 4, vgv: 2500000 }].map(ex);

  const investimentos = [
    ['Instagram', 1800], ['Portais', 2400], ['Google', 1500], ['Site', 300]
  ].flatMap(([canal, valor]) => [
    ex({ id: `inv-${canal}-0`.toLowerCase(), mes: mes(0), canal, valor }),
    ex({ id: `inv-${canal}-1`.toLowerCase(), mes: mes(-1), canal, valor })
  ]);

  const processos = [
    { id: 'pro-01', negocio: 'neg-01', matricula: true, certidoes: true, financiamento: 'aprovado', itbi: true, escritura: true, registro: false, prazoEscritura: dia(-6), obs: 'Aguardando o cartório devolver o registro.' },
    { id: 'pro-02', negocio: 'neg-02', matricula: true, certidoes: false, financiamento: 'em análise', itbi: false, escritura: false, registro: false, prazoEscritura: dia(5), obs: 'Falta a certidão de ações cíveis do vendedor.' }
  ].map(ex);

  const comissoes = [
    { id: 'com-01', negocio: 'neg-01', percentual: 6, recebidoEm: dia(-16), pagoCorretorEm: null }
  ].map(ex);

  const despesas = [
    ['aluguel', 'Aluguel e condomínio da sala', 6500], ['salários', 'Equipe administrativa', 18000],
    ['portais', 'Plano dos portais imobiliários', 2400], ['anúncios', 'Instagram, Google e site', 3600],
    ['sistemas', 'CRM, assinatura digital e telefonia', 650], ['contador', 'Escritório de contabilidade', 1200]
  ].flatMap(([categoria, descricao, valor], n) => [
    ex({ id: `des-${n}-0`, mes: mes(0), categoria, descricao, valor }),
    ex({ id: `des-${n}-1`, mes: mes(-1), categoria, descricao, valor: Math.round(valor * (categoria === 'anúncios' ? 0.8 : 1)) })
  ]);

  const melhorias = [
    { id: 'mel-01', titulo: 'Responder todo contato em até 15 minutos no horário comercial', area: 'Atendimento', impacto: 'alto', responsavel: 'Day', prazo: dia(7), status: 'fazendo', origem: 'Exemplo' },
    { id: 'mel-02', titulo: 'Parceria com correspondente bancário para pré-aprovar crédito antes da visita', area: 'Comercial', impacto: 'alto', responsavel: 'Vitor', prazo: dia(21), status: 'ideia', origem: 'Exemplo' }
  ].map(ex);

  return {
    atendimento: { contatos },
    comercial: { negocios, corretores, metas },
    marketing: { imoveis, investimentos },
    juridico: { processos },
    financeiro: { comissoes, despesas },
    diretoria: { melhorias }
  };
}

module.exports = { gerar };
