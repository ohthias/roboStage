/**
 * Motor de pontuação do FLL Score.
 *
 * Convenção única em todo o app: toda resposta guardada em `responses`
 * é o ÍNDICE da opção escolhida (0, 1, 2...), nunca o valor em pontos.
 * Isso vale tanto para "switch" quanto para "range".
 *
 * Regras do modelo novo suportadas aqui:
 *  - `requires`: uma sub-missão só pontua se as condições referenciadas
 *    (por `id` de outra missão/sub-missão DA MESMA missão) forem satisfeitas.
 *  - `when_self`: uma regra de `requires` só é avaliada quando a própria
 *    opção escolhida (em switches de múltipla escolha) for aquele label.
 *    Usado para bônus exclusivos como "Localização da Doca" (M15-3).
 *  - `zero_whole_mission_if_false`: se essa sub-missão (um "portão") não
 *    estiver confirmada como verdadeira, a missão inteira (principal +
 *    todas as sub-missões) pontua 0. Usado em M04 (bioglow).
 *  - `manual_tracking_required`: não afeta o cálculo, é só um aviso de UI
 *    (o juiz precisa acompanhar ao vivo, não dá para inferir pelo tapete).
 *  - `bonus_exclusive`: também não afeta o cálculo (o próprio switch já
 *    impede escolher mais de uma opção ao mesmo tempo); é só um rótulo.
 */

/** Quantidade de opções válidas (não nulas) declaradas no `type` de um switch. */
function switchOptionsCount(type: Mission["type"]): number {
  return type.slice(1).filter((v) => v !== null).length;
}

/**
 * Converte o índice selecionado em pontos. Regra única para missão
 * principal ou sub-missão, switch ou range:
 *  - pontos em array        -> points[idx]
 *  - "range"                -> idx * points
 *  - "switch" binário       -> idx === 1 ? points : 0   (<=2 opções)
 *  - "switch" com 3+ opções -> points, para qualquer opção escolhida
 *    (ex.: bônus exclusivo com pontuação fixa, como M15-3)
 */
export function computePoints(
  type: Mission["type"],
  points: number | number[],
  idx: number | undefined,
): number {
  if (idx === undefined || idx === null || idx < 0) return 0;

  if (Array.isArray(points)) return Number(points[idx] ?? 0);

  const flat = Number(points) || 0;

  if (type[0] === "range") return flat * idx;

  return switchOptionsCount(type) > 2 ? flat : idx === 1 ? flat : 0;
}

type MissionResponses = { [index: number]: number };

/** Mapa local id -> posição (0 = principal, i+1 = sub-missão) dentro da MESMA missão. */
function buildRegistry(mission: Mission) {
  const registry = new Map<string, { index: number; type: Mission["type"] }>();
  registry.set(mission.id, { index: 0, type: mission.type });
  (mission["sub-mission"] || []).forEach((sub, i) => {
    if (sub.id) registry.set(sub.id, { index: i + 1, type: sub.type });
  });
  return registry;
}

/** Compara o índice de uma resposta com o valor esperado numa regra de `requires`. */
function matchesExpected(
  idx: number | undefined,
  expected: boolean | number | [number, number],
): boolean {
  if (idx === undefined || idx === null) return false;
  if (typeof expected === "boolean") return expected ? idx === 1 : idx === 0;
  if (Array.isArray(expected)) {
    const [min, max] = expected;
    return idx >= min && idx <= max;
  }
  return idx === Number(expected);
}

/** Uma regra só é avaliada se sua `condition` estiver ativa e, havendo `when_self`, ele bater com a própria escolha. */
function isRuleActive(
  rule: RequirementRule,
  selfIdx: number | undefined,
  selfType: Mission["type"],
): boolean {
  const [, flag] = rule.condition ?? ["if", true];
  if (flag === false) return false;

  if (rule.when_self !== undefined) {
    const options = selfType.slice(1).filter((v) => v !== null);
    const wantedIdx = options.indexOf(rule.when_self as string);
    if (wantedIdx === -1 || selfIdx !== wantedIdx) return false;
  }

  return true;
}

/** Todas as regras de `requires` que se aplicam (ativas) precisam estar satisfeitas. */
function requirementsMet(
  requires: RequirementRule[] | undefined,
  selfIdx: number | undefined,
  selfType: Mission["type"],
  missionResponses: MissionResponses,
  registry: Map<string, { index: number; type: Mission["type"] }>,
): boolean {
  if (!requires || requires.length === 0) return true;

  const active = requires.filter((rule) => isRuleActive(rule, selfIdx, selfType));
  if (active.length === 0) return true;

  return active.every((rule) => {
    const target = registry.get(rule.mission);
    if (!target) return false;
    return matchesExpected(missionResponses[target.index], rule.value);
  });
}

export interface MissionBreakdown {
  mainPoints: number;
  /** Pontos de cada sub-missão, na mesma ordem de `mission["sub-mission"]`. */
  subPoints: number[];
  total: number;
  /** true se algum portão (`zero_whole_mission_if_false`) zerou a missão inteira. */
  gated: boolean;
  /** índices (na lista de sub-missões) cujo `requires` não foi satisfeito. */
  unmet: number[];
}

/**
 * Calcula a pontuação completa de UMA missão (principal + sub-missões),
 * já aplicando `requires` e o portão `zero_whole_mission_if_false`.
 * Recebe apenas as respostas DAQUELA missão (responses[mission.id]).
 */
export function computeMissionBreakdown(
  mission: Mission,
  missionResponses: MissionResponses = {},
): MissionBreakdown {
  const registry = buildRegistry(mission);
  const subs = mission["sub-mission"] || [];

  let mainPoints = computePoints(mission.type, mission.points, missionResponses[0]);

  const unmet: number[] = [];
  let subPoints = subs.map((sub, i) => {
    const idx = missionResponses[i + 1];
    const ok = requirementsMet(sub.requires, idx, sub.type, missionResponses, registry);
    if (!ok && idx !== undefined) unmet.push(i);
    return ok ? computePoints(sub.type, sub.points, idx) : 0;
  });

  const gated = subs.some((sub, i) => {
    if (!sub.zero_whole_mission_if_false) return false;
    return missionResponses[i + 1] !== 1;
  });

  if (gated) {
    mainPoints = 0;
    subPoints = subPoints.map(() => 0);
  }

  const total = mainPoints + subPoints.reduce((a, b) => a + b, 0);
  return { mainPoints, subPoints, total, gated, unmet };
}

/** Soma a pontuação de todas as missões informadas (usado para o placar total). */
export function sumAllMissions(
  missions: Mission[],
  responses: { [missionId: string]: MissionResponses },
): number {
  return missions.reduce((total, mission) => {
    const { total: missionTotal } = computeMissionBreakdown(mission, responses[mission.id]);
    return total + missionTotal;
  }, 0);
}