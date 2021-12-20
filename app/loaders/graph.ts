import type { LoaderFunction } from 'remix';
import { redirect } from 'remix';
import { query, FindGraphDocument } from '~/graphql.server';
import { Edge, BlockEdge, Field, Breadcrumb } from '~/types';

export type LoaderData = {
  name: string;
  color: string;
  versionId: string;
  leftId: string;
  parentId?: string;
  view: { id: string; name: string };
  fields: ReadonlyArray<Field & { hidden: boolean }>;
  rows: ReadonlyArray<{
    id: string;
    [key: string]: unknown;
  }>;
  breadcrumbs: ReadonlyArray<Breadcrumb>;
};

function getFields(
  edges: readonly Edge[],
  leftId: string,
  inViewEdges: Set<string>
): readonly Field[] {
  return edges
    .filter(({ left }) => left.id == leftId)
    .map(({ id, right }) => ({ ...right, hidden: !inViewEdges.has(id) }));
}

function getBreadcrumbs(
  edges: readonly BlockEdge[],
  leftId: string,
  parentId?: string
): readonly Breadcrumb[] {
  const edge = edges.find((edge) => edge.right.id == leftId);
  if (edge) {
    return [
      ...getBreadcrumbs(edges, edge.left.id, parentId),
      {
        name: edge.right.name,
        parent: { id: parentId ?? null, fieldId: edge.right.id },
      },
    ];
  }
  return [];
}

function getRows(
  rows: ReadonlyArray<{
    id: string;
    cells: ReadonlyArray<{
      id: string;
      textValue?: string | null;
      booleanValue?: boolean;
      intValue?: number | null;
      floatValue?: number | null;
      dateTimeValue?: Date | null;
      dateValue?: Date | null;
    }>;
  }>
) {
  return rows.map(({ id, cells }) => ({
    id,
    ...Object.fromEntries(
      cells.map((cell) => {
        if ('textValue' in cell) {
          return [cell.id, cell.textValue];
        } else if ('booleanValue' in cell) {
          return [cell.id, cell.booleanValue];
        } else if ('intValue' in cell) {
          return [cell.id, cell.intValue];
        } else if ('floatValue' in cell) {
          return [cell.id, cell.floatValue];
        } else if ('dateTimeValue' in cell) {
          return [cell.id, cell.dateTimeValue];
        } else if ('dateValue' in cell) {
          return [cell.id, cell.dateValue];
        }
        return [cell.id, null];
      })
    ),
  }));
}

async function getGraph({
  graphId,
  parentId,
  parentFieldId,
}: {
  graphId: string;
  parentFieldId?: string;
  parentId?: string;
}): Promise<LoaderData | null> {
  const { graph } = await query(FindGraphDocument, {
    graphId,
    parentFieldId,
    parentId,
  });

  if (graph) {
    const leftId = parentFieldId ?? graph.root.id;
    const inViewEdges = new Set(graph.view.edges.map(({ id }) => id));
    const fields = getFields(graph.version.edges, leftId, inViewEdges);
    const breadcrumbs = getBreadcrumbs(
      graph.version.blockEdges,
      leftId,
      parentId
    );

    return {
      name: graph.root.name,
      color: graph.color,
      versionId: graph.version.id,
      leftId,
      parentId,
      view: graph.view,
      fields,
      rows: getRows(graph.rows),
      breadcrumbs: [{ name: graph.root.name }, ...breadcrumbs],
    };
  }
  return null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const parent = (url.searchParams.get('p') ?? '').trim();
  const [parentFieldId, parentId] = parent ? parent.split(':') : [];

  const data = await getGraph({
    graphId: String(params.id),
    parentFieldId,
    parentId,
  });

  if (data) {
    return data;
  }

  return redirect('/');
};
