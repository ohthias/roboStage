import { CanvasElement, ViewportState } from '@/types/thinklab.types';

/**
 * Standard JSONB payload structure for persisting ExcaliFlow diagrams into SQL/PostgreSQL databases.
 * PostgreSQL supports querying nested jsonb fields using operators like:
 * - data->>'title'
 * - data->'viewport'->>'zoom'
 * - jsonb_array_length(data->'elements')
 * - data @> '{"meta": {"category": "flowchart"}}'
 */
export interface DiagramJsonbPayload {
  schema_version: '1.0';
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  meta: {
    app: 'ExcaliFlow';
    generator_version: string;
    total_elements: number;
    categories_present: string[];
  };
  viewport: {
    panX: number;
    panY: number;
    zoom: number;
  };
  grid_type: 'dots' | 'lines' | 'none';
  elements: CanvasElement[];
}

/**
 * Helper to build a clean, valid JSONB serializable payload
 */
export function createDiagramJsonbPayload(
  elements: CanvasElement[],
  viewport: ViewportState = { panX: 0, panY: 0, zoom: 1 },
  gridType: 'dots' | 'lines' | 'none' = 'dots',
  title = 'Diagrama ExcaliFlow',
  description = ''
): DiagramJsonbPayload {
  const typesPresent = Array.from(new Set(elements.map((e) => e.type)));

  return {
    schema_version: '1.0',
    title: title.trim() || 'Diagrama Sem Título',
    description: description.trim() || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meta: {
      app: 'ExcaliFlow',
      generator_version: '1.0.0',
      total_elements: elements.length,
      categories_present: typesPresent,
    },
    viewport: {
      panX: Math.round(viewport.panX * 100) / 100,
      panY: Math.round(viewport.panY * 100) / 100,
      zoom: Math.round(viewport.zoom * 1000) / 1000,
    },
    grid_type: gridType,
    elements: JSON.parse(JSON.stringify(elements)),
  };
}

/**
 * Validates whether an incoming unknown object matches the DiagramJsonbPayload structure
 */
export function validateDiagramJsonb(data: unknown): {
  valid: boolean;
  payload?: DiagramJsonbPayload;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'O payload não é um objeto JSON válido.' };
  }

  const obj = data as Record<string, unknown>;

  // Check if it's direct elements array
  if (Array.isArray(obj)) {
    return {
      valid: true,
      payload: createDiagramJsonbPayload(obj as CanvasElement[]),
    };
  }

  // Check standard jsonb wrapper
  if (Array.isArray(obj.elements)) {
    return {
      valid: true,
      payload: {
        schema_version: (obj.schema_version as '1.0') || '1.0',
        title: typeof obj.title === 'string' ? obj.title : 'Diagrama Restaurado',
        description: typeof obj.description === 'string' ? obj.description : undefined,
        created_at: typeof obj.created_at === 'string' ? obj.created_at : new Date().toISOString(),
        updated_at: typeof obj.updated_at === 'string' ? obj.updated_at : new Date().toISOString(),
        meta: (obj.meta as any) || {
          app: 'ExcaliFlow',
          generator_version: '1.0.0',
          total_elements: (obj.elements as any[]).length,
          categories_present: [],
        },
        viewport: (obj.viewport as any) || { panX: 0, panY: 0, zoom: 1 },
        grid_type: (obj.grid_type as any) || 'dots',
        elements: obj.elements as CanvasElement[],
      },
    };
  }

  return { valid: false, error: 'O objeto JSONB não contém a propriedade "elements" em formato de array.' };
}

/**
 * SQL Schema & Query Snippets for developer convenience
 */
export function generateSqlSnippets(tableName = 'diagrams') {
  return {
    ddl: `-- 1. Criação de tabela PostgreSQL com coluna JSONB nativa
CREATE TABLE IF NOT EXISTS ${tableName} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índice GIN para busca ultra-rápida dentro do JSONB
CREATE INDEX IF NOT EXISTS idx_${tableName}_data_gin 
ON ${tableName} USING gin (data);

-- 3. Índice em expressões específicas do JSONB
CREATE INDEX IF NOT EXISTS idx_${tableName}_elements_count 
ON ${tableName} (((data->'meta'->>'total_elements')::int));`,

    insert: `-- Inserção parametrizada (PostgreSQL / Supabase / Prisma / Drizzle)
INSERT INTO ${tableName} (title, data)
VALUES (
    'Fluxograma de Vendas',
    $1::jsonb
)
RETURNING id, title, created_at;`,

    query: `-- Exemplos de consultas analíticas e filtros com JSONB
-- Buscar diagramas com mais de 5 elementos
SELECT id, title, (data->'meta'->>'total_elements')::int AS qtd_elementos
FROM ${tableName}
WHERE (data->'meta'->>'total_elements')::int > 5;

-- Buscar diagramas que contenham setas ou nós de decisão
SELECT id, title, data->'elements'
FROM ${tableName}
WHERE data->'elements' @> '[{"type": "diamond"}]';`,
  };
}
