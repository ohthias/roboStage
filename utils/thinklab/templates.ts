import { TemplateItem } from '../types';

export const ISHIKAWA_TEMPLATES: TemplateItem[] = [
  {
    id: '6m-manufacturing',
    title: 'Indústria & Produção (6M)',
    subtitle: 'Método, Máquina, Mão de Obra, Material, Medição, Meio Ambiente',
    categoryType: '6M',
    description: 'O clássico modelo de Ishikawa desenvolvido para controle de qualidade e redução de refugos em linhas de montagem.',
    iconName: 'Factory',
    markdown: `# Problema: Alto Índice de Peças Defeituosas na Linha 2

## Método
- Falta de procedimento operacional padrão (POP) atualizado [CR]
  - Operadores utilizam versões antigas em papel
- Velocidade da esteira acima do recomendado
  - Meta de produtividade irrealista
- Sequência de calibração inadequada

## Máquina
- Desgaste prematuro das ferramentas de corte [alta]
  - Falta de lubrificação periódica [CR]
  - Troca fora do prazo estipulado
- Vibração excessiva no torno CNC
  - Coxins de sustentação ressecados
- Sensores óticos com acúmulo de poeira

## Mão de Obra
- Falta de treinamento prático na nova máquina [alta]
  - Alto turnover no turno da noite
  - Treinamento apenas teórico sem simulação
- Fadiga dos operadores nos fins de semana
  - Dobra de turno não planejada

## Material
- Variação na dureza da liga de alumínio recebida [CR]
  - Troca recente de fornecedor sem qualificação
- Matéria-prima armazenada com umidade
- Lotes entregues sem laudo de conformidade

## Medição
- Paquímetros digitais descalibrados [média]
  - Certificado de calibração vencido há 3 meses
- Amostragem insuficiente no controle estatístico
  - Inspeção apenas no final do lote
- Falta de padrão visual de defeitos aceitáveis

## Meio Ambiente
- Alta temperatura interna no galpão [média]
  - Sistema de exaustão com defeito
- Iluminação deficiente nos postos de inspeção
- Ruído excessivo dificultando comunicação na linha`,
  },
  {
    id: 'software-devops',
    title: 'Software & Engenharia (4S / DevOps)',
    subtitle: 'Software, Servidores, Sistemas & Skills',
    categoryType: '4S',
    description: 'Diagnóstico detalhado de problemas de performance, bugs críticos, latência e quedas de serviço.',
    iconName: 'Code',
    markdown: `# Problema: Lentidão e Quedas da Aplicação Web em Produção

## Software & Código
- Consultas SQL N+1 não indexadas no banco [alta]
  - Falta de profiling antes do deploy [CR]
  - ORM gerando queries ineficientes
- Vazamento de memória no serviço de relatórios
  - Conexões WebSocket não finalizadas
- Cache Redis não implementado nas rotas mais acessadas

## Servidores & Infraestrutura
- Auto-scaling configurado com threshold muito alto [alta]
  - Réplicas demoram 4 minutos para inicializar [CR]
- Gargalo de I/O no disco do banco de dados
  - IOPS estourando a quota contratada na nuvem
- DNS com tempo de propagação instável

## Sistemas & Integrações
- Timeout em APIs de terceiros (Gateways de Pagamento) [média]
  - Falta de padrão Circuit Breaker
  - Retry exponencial ausente
- Fila de mensageria acumulando mensagens sem Dead Letter Queue

## Skills & Processos
- Deploy direto na sexta-feira à tarde sem homologação [alta]
  - Cultura de testes manuais em vez de CI/CD automatizado [CR]
- Falta de alertas preditivos no Datadog/Grafana
  - Limiares de alerta configurados incorretamente
- Documentação desatualizada do fluxo de fallback`,
  },
  {
    id: 'customer-churn',
    title: 'Atendimento & Retenção (4P)',
    subtitle: 'Processos, Pessoas, Produto & Praça',
    categoryType: '4P',
    description: 'Análise de causas para churn elevado, cancelamentos e perda de satisfação do cliente (CSAT/NPS).',
    iconName: 'Users',
    markdown: `# Problema: Aumento de 28% no Cancelamento de Assinaturas (Churn)

## Processos
- Tempo Médio de Resposta (TMA) acima de 48 horas [alta]
  - Triagem de tickets manual e desorganizada [CR]
  - Falta de fila prioritária para clientes Enterprise
- Processo de onboarding confuso para novos usuários
  - Sem acompanhamento nos primeiros 14 dias

## Pessoas & Time
- Equipe de suporte sobrecarregada com tarefas repetitivas
  - Falta de automação de respostas frequentes
  - Turnover de analistas de Customer Success [CR]
- Ausência de treinamento no novo módulo do sistema

## Produto & Usabilidade
- Bugs recorrentes após última grande atualização [alta]
  - Falta de testes de regressão antes do lançamento
- Interface confusa na exportação de relatórios
  - Botão de exportação oculto no menu secundário
- Falta de integrações nativas com CRMs populares

## Políticas & Preço
- Aumento de preços sem comunicação prévia de valor [média]
  - Ausência de planos intermediários para pequenas empresas [CR]
  - Cobrança de taxa extra por assento adicional`,
  },
  {
    id: 'ecommerce-conversion',
    title: 'E-commerce & Vendas',
    subtitle: 'Checkout, Pagamentos, Logística & Marketing',
    categoryType: 'Custom',
    description: 'Identifique gargalos que provocam abandono de carrinho e queda de conversão em lojas virtuais.',
    iconName: 'ShoppingBag',
    markdown: `# Problema: Abandono de 65% dos Carrinhos no Checkout

## Checkout & UX
- Formulário com mais de 12 campos obrigatórios [alta]
  - Exigência de cadastro prévio antes de ver o frete [CR]
- Falha na validação de CEP e preenchimento automático
- Botão "Finalizar Compra" sem contraste no mobile

## Meios de Pagamento
- Recusa injustificada de cartões de crédito pelo antifraude [alta]
  - Score de risco muito agressivo [CR]
- Falta de opção de pagamento via Pix com QR Code dinâmico
- Ausência de parcelamento sem juros

## Logística & Frete
- Valor do frete superior a 40% do valor do produto [alta]
  - Tabela de transportadoras desatualizada
- Prazo de entrega exibido de forma pessimista (15 dias úteis)
  - Centro de distribuição centralizado em apenas um estado

## Comunicação & Confiança
- Falta de selos de segurança visíveis na página
- Ausência de depoimentos e avaliações de outros compradores
- Falta de política de troca e devolução clara no rodapé`,
  },
  {
    id: 'healthcare-emergency',
    title: 'Saúde & Hospitalar (Qualidade)',
    subtitle: 'Protocolos, Equipe, Equipamentos & Insumos',
    categoryType: 'Custom',
    description: 'Gestão da qualidade em saúde: redução de tempo de espera e segurança do paciente.',
    iconName: 'Activity',
    markdown: `# Problema: Tempo Excessivo de Espera no Pronto-Atendimento

## Protocolos & Triagem
- Classificação de Risco (Manchester) com inconsistências [alta]
  - Falta de calibração periódica da equipe de enfermagem [CR]
- Demora na liberação de leitos de observação
  - Sistema de alta médica não integrado com limpeza

## Equipe de Saúde
- Número insuficiente de médicos plantonistas no horário de pico [alta]
  - Escala de plantão com absenteísmo frequente
- Comunicação deficiente entre enfermagem e laboratório

## Equipamentos & Exames
- Demora no laudo de exames de tomografia e raio-x [CR]
  - Sistema PACS com lentidão na transferência de imagens
- Aparelhos de eletrocardiograma sem bateria reserva

## Insumos & Farmácia
- Medicamentos de uso imediato indisponíveis na sala de emergência
  - Requisição manual para a farmácia central
- Ruptura de estoque de kits de punção venosa`,
  },
  {
    id: 'logistics-delivery',
    title: 'Logística & Entregas (Supply Chain)',
    subtitle: 'Roteirização, Frota, Depósito & Comunicação',
    categoryType: 'Custom',
    description: 'Mapeamento de atrasos, avarias e falhas na última milha (last mile).',
    iconName: 'Truck',
    markdown: `# Problema: Atraso de 35% nas Entregas na Última Milha (Last Mile)

## Roteirização & Planejamento
- Software de rotas gera percursos sem considerar horário de trânsito [alta]
  - Algoritmo não atualizado com restrições de rodízio [CR]
- Janelas de entrega definidas sem confirmação com cliente

## Frota & Veículos
- Manutenção corretiva frequente no meio das rotas [alta]
  - Idade média da frota acima de 12 anos
  - Falta de plano de manutenção preventiva semanal [CR]
- Pneus com calibragem inadequada gerando quebras

## Depósito & Separação
- Erros na separação de pedidos (picking) atrasando carregamento
  - Código de barras ilegível em caixas de terceiros
- Caminhões aguardando mais de 2 horas na doca de saída

## Comunicação com Destinatário
- Ausência de link de rastreamento em tempo real por WhatsApp
- Endereço incorreto cadastrado pelo cliente sem validação
- Falta de aviso prévio de chegada do motorista`,
  },
];
