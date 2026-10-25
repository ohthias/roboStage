// ---------------------------------------------------------------------------
// Acumula os frames Anatix em estruturas prontas para gráficos, mapas e
// tabelas. É mutável de propósito (centenas de frames/s); a UI lê um
// "snapshot" com throttle via `version`.
// ---------------------------------------------------------------------------

import type {
  AnatixFrame,
  AnatixMetricSummary,
  AnatixSessionSummary,
} from "@/types/anatix.types";

const MAX_POINTS = 4000;
const MAX_EVENTS = 500;
const MAX_TRANSITIONS = 500;
const MAX_LOOP = 1200;
const MAX_CONSOLE = 300;

export interface MetricSeries {
  t: number[];
  v: number[];
  stats: AnatixMetricSummary & { sum: number };
}

export interface ConsoleLine {
  at: number; // Date.now() no navegador
  t: number | null; // millis do robô (para ANX_LOG)
  text: string;
  source: "log" | "serial" | "system";
}

export class AnatixStore {
  version = 0;
  hello: Extract<AnatixFrame, { k: "H" }> | null = null;
  metrics = new Map<string, MetricSeries>();
  events: Extract<AnatixFrame, { k: "E" }>[] = [];
  eventCounts = new Map<string, number>();
  states = new Map<string, { state: string; since: number }>();
  transitions: Extract<AnatixFrame, { k: "S" }>[] = [];
  sections = new Map<string, Extract<AnatixFrame, { k: "T" }>>();
  loop: Extract<AnatixFrame, { k: "L" }>[] = [];
  console: ConsoleLine[] = [];
  frameCount = 0;
  invalidFrames = 0;
  firstT: number | null = null;
  lastT: number | null = null;

  reset() {
    const v = this.version + 1;
    Object.assign(this, new AnatixStore());
    this.version = v;
  }

  private push<T>(list: T[], item: T, max: number) {
    list.push(item);
    if (list.length > max) list.splice(0, list.length - max);
  }

  addConsole(text: string, source: ConsoleLine["source"], t: number | null = null) {
    this.push(this.console, { at: Date.now(), t, text, source }, MAX_CONSOLE);
    this.version++;
  }

  addInvalid() {
    this.invalidFrames++;
    this.version++;
  }

  add(frame: AnatixFrame) {
    this.frameCount++;
    this.version++;
    if (frame.k !== "H" && Number.isFinite(frame.t)) {
      // Robô reiniciou (millis voltou): recomeça a linha do tempo.
      if (this.lastT !== null && frame.t + 1000 < this.lastT) {
        this.addConsole("millis() voltou — o robô reiniciou.", "system");
      }
      if (this.firstT === null) this.firstT = frame.t;
      this.lastT = frame.t;
    }

    switch (frame.k) {
      case "H":
        this.hello = frame;
        break;
      case "V": {
        if (frame.value === null || !Number.isFinite(frame.value)) break;
        let s = this.metrics.get(frame.name);
        if (!s) {
          s = {
            t: [],
            v: [],
            stats: { min: frame.value, max: frame.value, avg: 0, count: 0, last: frame.value, sum: 0 },
          };
          this.metrics.set(frame.name, s);
        }
        s.t.push(frame.t);
        s.v.push(frame.value);
        if (s.t.length > MAX_POINTS) {
          s.t.splice(0, s.t.length - MAX_POINTS);
          s.v.splice(0, s.v.length - MAX_POINTS);
        }
        const st = s.stats;
        st.count++;
        st.sum += frame.value;
        st.avg = st.sum / st.count;
        st.last = frame.value;
        if (frame.value < st.min) st.min = frame.value;
        if (frame.value > st.max) st.max = frame.value;
        break;
      }
      case "E":
        this.push(this.events, frame, MAX_EVENTS);
        this.eventCounts.set(frame.name, (this.eventCounts.get(frame.name) ?? 0) + 1);
        break;
      case "S": {
        const prev = this.states.get(frame.machine);
        if (prev?.state !== frame.state) {
          this.states.set(frame.machine, { state: frame.state, since: frame.t });
          this.push(this.transitions, frame, MAX_TRANSITIONS);
        }
        break;
      }
      case "T":
        this.sections.set(frame.section, frame);
        break;
      case "L":
        this.push(this.loop, frame, MAX_LOOP);
        break;
      case "M":
        this.addConsole(frame.text, "log", frame.t);
        break;
    }
  }

  get droppedByRobot() {
    return this.loop.at(-1)?.dropped ?? 0;
  }

  summary(): AnatixSessionSummary {
    const metrics: AnatixSessionSummary["metrics"] = {};
    for (const [name, s] of this.metrics) {
      const { min, max, avg, count, last } = s.stats;
      metrics[name] = { min, max, avg, count, last };
    }
    const sections: AnatixSessionSummary["sections"] = {};
    for (const [name, f] of this.sections) {
      sections[name] = { runs: f.runs, avgUs: f.avgUs, maxUs: f.maxUs };
    }
    const last = this.loop.at(-1);
    return {
      metrics,
      states: Object.fromEntries([...this.states].map(([m, s]) => [m, s.state])),
      sections,
      events: Object.fromEntries(this.eventCounts),
      loop: last
        ? { lps: last.lps, avgUs: last.avgUs, maxUs: last.maxUs, freeRam: last.freeRam }
        : undefined,
    };
  }
}
