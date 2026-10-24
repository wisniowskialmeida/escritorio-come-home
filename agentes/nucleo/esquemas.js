/* ===========================================================
   esquemas.js — o que cada agente da Come Home guarda.

   Cada área é dona de um arquivo em agentes/dados/<area>.json e só ela
   escreve nele; as outras apenas leem. Assim seis processos podem rodar
   ao mesmo tempo sem um sobrescrever o trabalho do outro.

   Tipos de campo: texto, textolongo, numero, dinheiro, data (AAAA-MM-DD),
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
  prospeccao: {
    nome: 'Prospecção', agente: 'Léo', porta: 4417, cor: '#6f7fe0', sala: 'Comercial',
    missao: 'Encontrar compradores e proprietários antes da concorrência, qualificar e entregar prontos para o time.'
  },
  conteudo: {
    nome: 'Conteúdo', agente: 'Nico', porta: 4418, cor: '#e06aa8', sala: 'Marketing',
    missao: 'Manter as redes da Come Home ativas toda semana, com os imóveis certos no formato que traz contato.'
  },
  copy: {
    nome: 'Copy', agente: 'Duda', porta: 4419, cor: '#f0a33a', sala: 'Marketing',
    missao: 'Escrever anúncios que fazem o comprador pedir a visita, e reescrever os que não funcionam.'
  },
  analise: {
    nome: 'Dados', agente: 'Cami', porta: 4420, cor: '#9a7be0', sala: 'Diretoria',
    missao: 'Cruzar os números de todas as áreas, achar o gargalo do funil e garantir que os dados estejam completos.'
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
  prospeccao: {
    prospects: {
      titulo: 'Prospects', singular: 'prospect', rotulo: i => i.nome,
      ordem: (a, b) => String(a.proximoContato || '9999').localeCompare(String(b.proximoContato || '9999')),
      campos: [
        { k: 'nome', t: 'texto', r: 'Nome', lista: true, obrigatorio: true },
        { k: 'telefone', t: 'texto', r: 'Telefone' },
        { k: 'perfil', t: 'opcao', r: 'Perfil', op: ['comprador', 'proprietário'], lista: true, padrao: 'comprador' },
        { k: 'origem', t: 'opcao', r: 'Origem', op: ['indicação', 'redes sociais', 'evento', 'porta a porta', 'lista de contatos', 'parceiro'], lista: true },
        { k: 'bairro', t: 'texto', r: 'Bairro (de interesse ou do imóvel)', lista: true },
        { k: 'orcamento', t: 'dinheiro', r: 'Orçamento ou valor do imóvel', lista: true },
        { k: 'credito', t: 'opcao', r: 'Crédito do comprador', op: ['', 'à vista', 'pré-aprovado', 'não simulado'] },
        { k: 'etapa', t: 'opcao', r: 'Etapa', op: ['novo', 'em contato', 'qualificado', 'enviado ao atendimento', 'imóvel captado', 'descartado'], lista: true, padrao: 'novo' },
        { k: 'ultimoContato', t: 'data', r: 'Último contato' },
        { k: 'proximoContato', t: 'data', r: 'Próximo contato', lista: true },
        { k: 'obs', t: 'texto', r: 'Observações' }
      ]
    }
  },
  conteudo: {
    posts: {
      titulo: 'Calendário de posts', singular: 'post',
      ordem: (a, b) => String(b.data).localeCompare(String(a.data)),
      campos: [
        { k: 'data', t: 'data', r: 'Data', lista: true, obrigatorio: true },
        { k: 'rede', t: 'opcao', r: 'Rede', op: ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'WhatsApp'], lista: true, padrao: 'Instagram' },
        { k: 'formato', t: 'opcao', r: 'Formato', op: ['reels', 'carrossel', 'story', 'foto', 'vídeo longo'], lista: true },
        { k: 'imovel', t: 'ref', r: 'Imóvel', ref: 'imoveis', lista: true },
        { k: 'tema', t: 'texto', r: 'Tema ou legenda curta', lista: true },
        { k: 'status', t: 'opcao', r: 'Situação', op: ['ideia', 'produzindo', 'agendado', 'publicado'], lista: true, padrao: 'ideia' },
        { k: 'alcance', t: 'numero', r: 'Alcance' },
        { k: 'contatos', t: 'numero', r: 'Contatos gerados', lista: true }
      ]
    }
  },
  copy: {
    textos: {
      titulo: 'Textos de anúncio', singular: 'texto',
      ordem: (a, b) => String(b.atualizado).localeCompare(String(a.atualizado)),
      campos: [
        { k: 'imovel', t: 'ref', r: 'Imóvel', ref: 'imoveis', lista: true, obrigatorio: true },
        { k: 'canal', t: 'opcao', r: 'Onde vai', op: ['portais', 'Instagram', 'site', 'WhatsApp', 'Google'], lista: true },
        { k: 'titulo', t: 'texto', r: 'Título', lista: true },
        { k: 'texto', t: 'textolongo', r: 'Texto do anúncio' },
        { k: 'status', t: 'opcao', r: 'Situação', op: ['rascunho', 'em revisão', 'aprovado', 'publicado'], lista: true, padrao: 'rascunho' },
        { k: 'contatos', t: 'numero', r: 'Contatos gerados', lista: true },
        { k: 'atualizado', t: 'data', r: 'Atualizado em', lista: true }
      ]
    }
  },
  // Dados não guarda nada próprio: lê e cruza o que as outras áreas cadastram
  analise: {},
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
