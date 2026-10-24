/* ===========================================================
   esquemas.js — o que cada agente da Come Home guarda.

   Cada área é dona de um arquivo em agentes/dados/<area>.json e só ela
   escreve nele; as outras apenas leem. Assim seis processos podem rodar
   ao mesmo tempo sem um sobrescrever o trabalho do outro.

   Tipos de campo: texto, numero, dinheiro, data (AAAA-MM-DD),
   datahora (AAAA-MM-DDTHH:MM), mes (AAAA-MM), sim (verdadeiro/falso),
   opcao (uma da lista) e ref (aponta para um item de outra coleção).
   `lista: true` faz o campo aparecer na tabela; os demais só no formulário.
   =========================================================== */

const CANAIS = ['Instagram', 'Portais', 'Google', 'Site', 'Indicação', 'Placa'];

const AREAS = {
  atendimento: {
    nome: 'Atendimento', agente: 'Lia', porta: 4411, cor: '#cfa441', sala: 'Recepção',
    missao: 'Responder rápido todo contato que chega e entregar ao corretor certo.'
  },
  comercial: {
    nome: 'Comercial', agente: 'Bento', porta: 4412, cor: '#d9a531', sala: 'Comercial',
    missao: 'Transformar contatos em visitas, propostas e vendas, e bater a meta do mês.'
  },
  marketing: {
    nome: 'Marketing', agente: 'Nina', porta: 4413, cor: '#e2803a', sala: 'Marketing',
    missao: 'Anunciar bem cada imóvel e investir nos canais que trazem compradores de verdade.'
  },
  juridico: {
    nome: 'Jurídico', agente: 'Teo', porta: 4414, cor: '#7b7ad0', sala: 'Jurídico',
    missao: 'Levar cada venda fechada até a escritura e o registro sem atraso nem surpresa.'
  },
  financeiro: {
    nome: 'Financeiro', agente: 'Rui', porta: 4415, cor: '#3f8f5c', sala: 'Financeiro',
    missao: 'Receber toda comissão, pagar os corretores em dia e manter o caixa no azul.'
  },
  diretoria: {
    nome: 'Diretoria', agente: 'Clara', porta: 4416, cor: '#2f7a57', sala: 'Diretoria',
    missao: 'Juntar o que cada área vê e transformar em um plano de melhorias para o Vitor e a Day.'
  }
};

const COLECOES = {
  atendimento: {
    contatos: {
      titulo: 'Contatos', singular: 'contato', rotulo: i => i.nome,
      ordem: (a, b) => String(b.chegou).localeCompare(String(a.chegou)),
      campos: [
        { k: 'nome', t: 'texto', r: 'Nome', lista: true, obrigatorio: true },
        { k: 'telefone', t: 'texto', r: 'Telefone' },
        { k: 'canal', t: 'opcao', r: 'Canal', op: CANAIS, lista: true },
        { k: 'imovel', t: 'ref', r: 'Imóvel de interesse', ref: 'imoveis', lista: true },
        { k: 'chegou', t: 'datahora', r: 'Chegou em', lista: true },
        { k: 'respondido', t: 'datahora', r: 'Respondido em', lista: true },
        { k: 'status', t: 'opcao', r: 'Situação', op: ['novo', 'em atendimento', 'encaminhado', 'descartado'], lista: true },
        { k: 'corretor', t: 'ref', r: 'Corretor', ref: 'corretores' },
        { k: 'obs', t: 'texto', r: 'Observações' }
      ]
    }
  },
  comercial: {
    negocios: {
      titulo: 'Negociações', singular: 'negociação', f: true,
      ordem: (a, b) => String(b.atualizado).localeCompare(String(a.atualizado)),
      campos: [
        { k: 'contato', t: 'ref', r: 'Cliente', ref: 'contatos', lista: true, obrigatorio: true },
        { k: 'imovel', t: 'ref', r: 'Imóvel', ref: 'imoveis', lista: true },
        { k: 'corretor', t: 'ref', r: 'Corretor', ref: 'corretores', lista: true },
        { k: 'etapa', t: 'opcao', r: 'Etapa', op: ['visita agendada', 'visita feita', 'proposta', 'fechado', 'perdido'], lista: true },
        { k: 'valor', t: 'dinheiro', r: 'Valor (proposta ou venda)', lista: true },
        { k: 'atualizado', t: 'data', r: 'Último movimento', lista: true },
        { k: 'fechadoEm', t: 'data', r: 'Fechado em' },
        { k: 'motivoPerda', t: 'opcao', r: 'Motivo da perda', op: ['', 'preço', 'financiamento negado', 'desistiu', 'comprou com outra imobiliária', 'imóvel não atendeu', 'outro'] }
      ]
    },
    corretores: {
      titulo: 'Corretores', singular: 'corretor', rotulo: i => i.nome,
      campos: [
        { k: 'nome', t: 'texto', r: 'Nome', lista: true, obrigatorio: true },
        { k: 'creci', t: 'texto', r: 'CRECI', lista: true },
        { k: 'ativo', t: 'sim', r: 'Ativo', lista: true, padrao: true }
      ]
    },
    metas: {
      titulo: 'Metas do mês', singular: 'meta', f: true,
      ordem: (a, b) => String(b.mes).localeCompare(String(a.mes)),
      campos: [
        { k: 'mes', t: 'mes', r: 'Mês', lista: true, obrigatorio: true },
        { k: 'vendas', t: 'numero', r: 'Vendas', lista: true },
        { k: 'vgv', t: 'dinheiro', r: 'VGV (valor vendido)', lista: true }
      ]
    }
  },
  marketing: {
    imoveis: {
      titulo: 'Imóveis à venda', singular: 'imóvel', rotulo: i => `${i.codigo} · ${i.titulo}`,
      ordem: (a, b) => String(a.codigo).localeCompare(String(b.codigo)),
      campos: [
        { k: 'codigo', t: 'texto', r: 'Código', lista: true, obrigatorio: true },
        { k: 'titulo', t: 'texto', r: 'Título do anúncio', lista: true },
        { k: 'tipo', t: 'opcao', r: 'Tipo', op: ['apartamento', 'casa', 'cobertura', 'terreno', 'comercial'] },
        { k: 'bairro', t: 'texto', r: 'Bairro', lista: true },
        { k: 'preco', t: 'dinheiro', r: 'Preço', lista: true },
        { k: 'captadoEm', t: 'data', r: 'Captado em', lista: true },
        { k: 'captador', t: 'ref', r: 'Captador', ref: 'corretores' },
        { k: 'fotos', t: 'sim', r: 'Fotos profissionais', lista: true },
        { k: 'tour', t: 'sim', r: 'Tour virtual' },
        { k: 'portais', t: 'texto', r: 'Onde está anunciado' },
        { k: 'status', t: 'opcao', r: 'Anúncio', op: ['ativo', 'pausado'], padrao: 'ativo' }
      ]
    },
    investimentos: {
      titulo: 'Investimento em anúncios', singular: 'investimento',
      ordem: (a, b) => String(b.mes).localeCompare(String(a.mes)),
      campos: [
        { k: 'mes', t: 'mes', r: 'Mês', lista: true, obrigatorio: true },
        { k: 'canal', t: 'opcao', r: 'Canal', op: CANAIS, lista: true },
        { k: 'valor', t: 'dinheiro', r: 'Valor', lista: true }
      ]
    }
  },
  juridico: {
    processos: {
      titulo: 'Processos de venda', singular: 'processo',
      ordem: (a, b) => String(a.prazoEscritura).localeCompare(String(b.prazoEscritura)),
      campos: [
        { k: 'negocio', t: 'ref', r: 'Venda', ref: 'negocios', lista: true, obrigatorio: true },
        { k: 'matricula', t: 'sim', r: 'Matrícula atualizada', lista: true },
        { k: 'certidoes', t: 'sim', r: 'Certidões', lista: true },
        { k: 'financiamento', t: 'opcao', r: 'Pagamento', op: ['à vista', 'em análise', 'aprovado', 'negado'], lista: true },
        { k: 'itbi', t: 'sim', r: 'ITBI pago', lista: true },
        { k: 'escritura', t: 'sim', r: 'Escritura assinada', lista: true },
        { k: 'registro', t: 'sim', r: 'Registro no cartório', lista: true },
        { k: 'prazoEscritura', t: 'data', r: 'Prazo da escritura', lista: true },
        { k: 'obs', t: 'texto', r: 'Observações' }
      ]
    }
  },
  financeiro: {
    comissoes: {
      titulo: 'Comissões', singular: 'comissão', f: true,
      campos: [
        { k: 'negocio', t: 'ref', r: 'Venda', ref: 'negocios', lista: true, obrigatorio: true },
        { k: 'percentual', t: 'numero', r: 'Comissão (%)', lista: true, padrao: 6 },
        { k: 'recebidoEm', t: 'data', r: 'Recebida em', lista: true },
        { k: 'pagoCorretorEm', t: 'data', r: 'Corretor pago em', lista: true }
      ]
    },
    despesas: {
      titulo: 'Despesas', singular: 'despesa', f: true,
      ordem: (a, b) => String(b.mes).localeCompare(String(a.mes)) || (b.valor || 0) - (a.valor || 0),
      campos: [
        { k: 'mes', t: 'mes', r: 'Mês', lista: true, obrigatorio: true },
        { k: 'categoria', t: 'opcao', r: 'Categoria', op: ['aluguel', 'salários', 'portais', 'anúncios', 'sistemas', 'contador', 'outros'], lista: true },
        { k: 'descricao', t: 'texto', r: 'Descrição', lista: true },
        { k: 'valor', t: 'dinheiro', r: 'Valor', lista: true }
      ]
    }
  },
  diretoria: {
    melhorias: {
      titulo: 'Plano de melhorias', singular: 'melhoria', f: true,
      ordem: (a, b) => ['fazendo', 'ideia', 'feito'].indexOf(a.status) - ['fazendo', 'ideia', 'feito'].indexOf(b.status) ||
                       String(a.prazo).localeCompare(String(b.prazo)),
      campos: [
        { k: 'titulo', t: 'texto', r: 'Melhoria', lista: true, obrigatorio: true },
        { k: 'area', t: 'opcao', r: 'Área', op: Object.values(AREAS).map(a => a.nome), lista: true },
        { k: 'impacto', t: 'opcao', r: 'Impacto', op: ['alto', 'médio', 'baixo'], lista: true },
        { k: 'responsavel', t: 'texto', r: 'Responsável', lista: true },
        { k: 'prazo', t: 'data', r: 'Prazo', lista: true },
        { k: 'status', t: 'opcao', r: 'Situação', op: ['ideia', 'fazendo', 'feito'], lista: true, padrao: 'ideia' },
        { k: 'origem', t: 'texto', r: 'De onde veio' }
      ]
    }
  }
};

/** em que área mora cada coleção (para resolver as referências) */
const DONO = {};
for (const [area, cols] of Object.entries(COLECOES)) for (const c of Object.keys(cols)) DONO[c] = area;

const vazio = area => Object.fromEntries(Object.keys(COLECOES[area]).map(c => [c, []]));

module.exports = { AREAS, COLECOES, CANAIS, DONO, vazio };
