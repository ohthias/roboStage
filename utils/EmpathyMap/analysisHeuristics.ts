import { AnalysisData, EmpathyMap, EmpathyNote } from '@/types/EmpathyMap.types';

export function generateHeuristicAnalysis(map: EmpathyMap): AnalysisData {
  const notes = map.notes;
  const persona = map.persona;

  const thinksNotes = notes.filter((n) => n.category === 'thinks');
  const feelsNotes = notes.filter((n) => n.category === 'feels');
  const saysNotes = notes.filter((n) => n.category === 'says');
  const doesNotes = notes.filter((n) => n.category === 'does');
  const painsNotes = notes.filter((n) => n.category === 'pains');
  const gainsNotes = notes.filter((n) => n.category === 'gains');

  // Sorted by votes
  const sortedPains = [...painsNotes].sort((a, b) => b.votes - a.votes);
  const sortedGains = [...gainsNotes].sort((a, b) => b.votes - a.votes);
  const sortedSays = [...saysNotes].sort((a, b) => b.votes - a.votes);
  const sortedDoes = [...doesNotes].sort((a, b) => b.votes - a.votes);

  const topPains = sortedPains.length > 0
    ? sortedPains.slice(0, 3).map((n) => n.text)
    : [
        'Fricções no processo de onboarding e menus com excesso de termos técnicos complexos.',
        'Insegurança sobre a privacidade e proteção de dados críticos durante as operações.',
        'Sensação de falta de tempo hábil para gerenciar tarefas manuais repetitivas.',
      ];

  const coreMotivations = sortedGains.length > 0
    ? sortedGains.slice(0, 3).map((n) => n.text)
    : [
        'Autonomia rápida para resolver demandas em menos de 1 minuto sem intermediação.',
        'Previsibilidade e transparência absoluta sobre resultados, taxas e prazos.',
        'Compartilhamento descomplicado com familiares ou equipe de trabalho.',
      ];

  // Identify contradictions between Says & Does or Thinks & Says
  const contradictions: { finding: string; uxInsight: string }[] = [];

  if (saysNotes.length > 0 && doesNotes.length > 0) {
    const topSay = sortedSays[0]?.text || '';
    const topDo = sortedDoes[0]?.text || '';
    contradictions.push({
      finding: `A persona verbaliza: ${topSay.replace(/^"|"$/g, '')}, enquanto no comportamento prático diário: ${topDo}`,
      uxInsight:
        'Existe uma distância perceptível entre a intenção declarada da persona e o comportamento executado sob pressão de tempo ou cansaço. A interface deve reduzir o atrito da ação ao mínimo absoluto.',
    });
  }

  if (thinksNotes.length > 0 && feelsNotes.length > 0) {
    contradictions.push({
      finding: `No racional ela pondera sobre controle e segurança, mas o estado emocional predominante é de ansiedade por sobrecarga informativa.`,
      uxInsight:
        'A solução não deve ser adicionar mais dados ou dashboards densos, mas sim entregar clareza filtrada e mensagens de tranquilização nos momentos de decisão.',
    });
  }

  // How Might We statements
  const howMightWe: string[] = [];
  const primaryPain = sortedPains[0]?.text || 'as barreiras de usabilidade';
  const primaryGain = sortedGains[0]?.text || 'uma experiência fluida e segura';

  howMightWe.push(
    `Como nós poderíamos transformar o receio de "${primaryPain.slice(0, 75)}..." em uma experiência de alta confiança e previsibilidade para ${persona.name}?`
  );
  howMightWe.push(
    `Como nós poderíamos viabilizar "${primaryGain.slice(0, 75)}..." com o mínimo de esforço cognitivo durante a rotina agitada do usuário?`
  );
  howMightWe.push(
    `Como nós poderíamos antecipar necessidades críticas antes que a persona sinta frustração ou sobrecarga de notificações irrelevantes?`
  );

  // Actionable Opportunities
  const actionableOpportunities = [
    {
      title: 'Simplificação de Jornada & Redução de Carga Cognitiva',
      impact: 'Alto' as const,
      description: `Centralizar ações críticas na tela inicial, eliminando passos redundantes e priorizando confirmações visuais imediatas para ${persona.name}.`,
    },
    {
      title: 'Automação Proativa com Alertas Humanizados',
      impact: 'Alto' as const,
      description: `Substituir notificações genéricas por insights preditivos baseados no histórico, oferecendo sugestões acionáveis em linguagem natural e empática.`,
    },
    {
      title: 'Fluxo Colaborativo & Compartilhamento Descomplicado',
      impact: 'Médio' as const,
      description: `Integrar ferramentas de exportação limpa e compartilhamento nativo para familiares ou parceiros, eliminando a necessidade de prints manuais.`,
    },
  ];

  const archetypeTitle = determineArchetype(map);
  const executiveSummary = `A análise de empatia de ${persona.name} (${persona.role}) evidencia uma persona com alto senso de responsabilidade, porém limitada por restrições severas de tempo e atenção. Suas verbalizações indicam uma busca contínua por simplicidade e autonomia, contrastando com atritos recorrentes gerados por processos burocráticos ou falta de transparência.

As dores mais críticas concentram-se em insegurança operacional e sobrecarga cognitiva, enquanto suas maiores aspirações giram em torno de previsibilidade, automação inteligente e tranquilidade mental. Para gerar impacto real de produto, o design deve priorizar jornadas transparentes, comunicação humanizada e eliminação de fricções manuais.`;

  return {
    executiveSummary,
    archetypeTitle,
    topPains,
    coreMotivations,
    contradictions,
    howMightWe,
    actionableOpportunities,
  };
}

function determineArchetype(map: EmpathyMap): string {
  const notes = map.notes;
  const painCount = notes.filter((n) => n.category === 'pains').length;
  const gainCount = notes.filter((n) => n.category === 'gains').length;

  if (painCount > gainCount + 2) {
    return 'O Realista Cauteloso em Busca de Alívio';
  } else if (gainCount > painCount + 2) {
    return 'O Explorador Otimista Focado em Eficiência';
  } else {
    return 'O Otimizador Consciente & Pragmatista';
  }
}
