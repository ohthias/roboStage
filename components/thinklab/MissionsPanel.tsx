'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { GripVertical, Search, Trophy, RefreshCw, Lock, X } from 'lucide-react';
import { getThinkLabMissionPacks } from '@/app/(protected)/dashboard/thinklab/mission-actions';
import { buildMissionCard, MissionPack, MissionSummary, sentenceCase } from '@/utils/thinklab/mission-cards';
import { GraphicAsset } from '@/types/thinklab.types';
import { IconBubble, cn } from './editor-ui';

interface MissionsPanelProps {
  onInsertAsset: (elements: GraphicAsset['elements'], assetName: string) => void;
  /** Cor de destaque dos cartões (hex). */
  accent?: string;
}

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; packs: MissionPack[] };

const normalize = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Aba "Missões": coleções liberadas pelas ligas em que o usuário participa ou
 * tem interesse. Cada missão vira um cartão (miniatura + título + pontuação).
 */
export function MissionsPanel({ onInsertAsset, accent = '#cf2a2a' }: MissionsPanelProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [seasonByLeague, setSeasonByLeague] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    getThinkLabMissionPacks()
      .then((packs) => !cancelled && setState({ status: 'ready', packs }))
      .catch(() => !cancelled && setState({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setState({ status: 'loading' });
    setReloadKey((n) => n + 1);
  };

  const q = useMemo(() => normalize(query.trim()), [query]);

  if (state.status === 'loading') {
    return (
      <div className="flex-1 p-4 space-y-3" aria-busy="true" aria-label="Carregando missões">
        <div className="skeleton h-8 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton size-9 rounded-full shrink-0" />
            <div className="skeleton h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex-1 grid place-items-center px-6 text-center">
        <div>
          <p className="text-sm font-medium">Não foi possível carregar as missões</p>
          <button onClick={retry} className="btn btn-sm btn-ghost mt-2 gap-1.5 font-normal">
            <RefreshCw className="size-4" /> Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  const { packs } = state;

  if (packs.length === 0) {
    return (
      <div className="flex-1 grid place-items-center px-6 text-center">
        <div>
          <IconBubble className="mx-auto mb-3">
            <Trophy className="size-4" />
          </IconBubble>
          <p className="text-sm font-medium">Nenhuma liga selecionada</p>
          <p className="text-xs text-base-content/55 mt-1 mb-3">
            Marque as ligas em que você participa ou tem interesse para liberar as missões delas aqui.
          </p>
          <Link href="/dashboard/leagues" className="btn btn-sm btn-primary font-normal">
            Escolher ligas
          </Link>
        </div>
      </div>
    );
  }

  const insertMission = (pack: MissionPack, seasonLabel: string, mission: MissionSummary) => {
    onInsertAsset(
      buildMissionCard(mission, { league: pack.leagueCode, season: seasonLabel }, accent),
      `${mission.code} · ${sentenceCase(mission.name)}`,
    );
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="px-4 pt-4 pb-2">
        <label className="input input-sm w-full bg-base-200 border-transparent shadow-none focus-within:border-primary/60 focus-within:outline-none">
          <Search className="size-3.5 opacity-50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
            placeholder="Buscar missões"
            className="grow"
            aria-label="Buscar missões"
          />
          {query && (
            <button onClick={() => setQuery('')} className="opacity-50 hover:opacity-100" aria-label="Limpar busca">
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        {packs.map((pack) => {
          const seasonKey = seasonByLeague[pack.leagueId] ?? pack.defaultSeason ?? pack.seasons[0]?.key;
          const season = pack.seasons.find((s) => s.key === seasonKey) ?? pack.seasons[0];
          const missions = (season?.missions ?? []).filter(
            (m) => !q || normalize(`${m.code} ${m.name} ${m.description}`).includes(q),
          );

          return (
            <section key={pack.leagueId} className="border-b border-base-300/70 last:border-b-0">
              <header className="px-4 pt-4 pb-2 flex items-start gap-2.5">
                <span className="badge badge-sm badge-neutral font-medium shrink-0 mt-0.5">{pack.leagueCode}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug truncate" title={pack.leagueName}>
                    {pack.leagueName}
                  </p>
                  <p className="text-xs text-base-content/50">
                    {pack.relation === 'participante' ? 'Você participa' : 'Você tem interesse'}
                  </p>
                </div>
              </header>

              {pack.status === 'soon' ? (
                <div className="mx-4 mb-4 flex items-start gap-2 rounded-field bg-base-200 px-3 py-2.5 text-xs text-base-content/60">
                  <Lock className="size-3.5 mt-0.5 shrink-0" />
                  <span>{pack.note ?? 'Missões em breve.'}</span>
                </div>
              ) : (
                <>
                  {pack.seasons.length > 1 && (
                    <div className="px-4 pb-2">
                      <select
                        className="select select-sm w-full bg-base-200 border-transparent shadow-none"
                        value={season?.key}
                        onChange={(e) => setSeasonByLeague((prev) => ({ ...prev, [pack.leagueId]: e.target.value }))}
                        aria-label={`Temporada de ${pack.leagueCode}`}
                      >
                        {pack.seasons.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {missions.length === 0 ? (
                    <p className="px-4 pb-4 text-xs text-base-content/50">Nenhuma missão encontrada.</p>
                  ) : (
                    <ul className="px-2 pb-3 space-y-0.5">
                      {missions.map((mission) => {
                        const label = `${mission.code} · ${sentenceCase(mission.name)}`;
                        return (
                          <li key={mission.code}>
                            <div
                              role="button"
                              tabIndex={0}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData(
                                  'application/json',
                                  JSON.stringify({
                                    isGraphicAsset: true,
                                    name: label,
                                    elements: buildMissionCard(
                                      mission,
                                      { league: pack.leagueCode, season: season.label },
                                      accent,
                                    ),
                                  }),
                                );
                                e.dataTransfer.effectAllowed = 'copy';
                              }}
                              onClick={() => insertMission(pack, season.label, mission)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  insertMission(pack, season.label, mission);
                                }
                              }}
                              title={`${mission.description || label} — clique para inserir ou arraste para o canvas`}
                              className="group flex items-center gap-3 rounded-field px-2 py-1.5 cursor-grab active:cursor-grabbing hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary"
                            >
                              <IconBubble
                                className={cn(
                                  'overflow-hidden group-hover:bg-base-100',
                                  mission.image && 'bg-base-100 border border-base-300',
                                )}
                              >
                                {mission.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={mission.image} alt="" loading="lazy" className="size-full object-cover" />
                                ) : (
                                  <span className="text-[11px] font-semibold">{mission.code}</span>
                                )}
                              </IconBubble>
                              <span className="flex-1 min-w-0">
                                <span className="block truncate text-sm">{sentenceCase(mission.name)}</span>
                                <span className="block text-xs text-base-content/50 tabular-nums">
                                  {mission.code} · até {mission.points} pts
                                </span>
                              </span>
                              <GripVertical className="size-4 shrink-0 text-base-content/30 group-hover:text-base-content/60" />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
            </section>
          );
        })}

        <p className="px-4 pt-3 text-xs text-base-content/50">
          As missões vêm das suas ligas.{' '}
          <Link href="/dashboard/leagues" className="link link-hover text-primary">
            Gerenciar ligas
          </Link>
        </p>
      </div>
    </div>
  );
}
