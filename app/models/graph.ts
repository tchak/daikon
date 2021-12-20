import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { runQuery, runCommand, PrismaTask } from '~/prisma.server';
import {
  NodeType,
  VERSION_ATTRIBUTES,
  VIEW_ATTRIBUTES,
  ROOT_ATTRIBUTES,
  GRAPH_ATTRIBUTES,
  ROW_ATTRIBUTES,
  GraphData,
  ViewData,
  VersionData,
  RowData,
} from './validators';
import { populateCells } from './row';

export function findGraphs(): PrismaTask<GraphData[]> {
  return runQuery((db) =>
    db.graph.findMany({
      select: {
        ...GRAPH_ATTRIBUTES,
        root: { select: ROOT_ATTRIBUTES },
      },
      orderBy: { createdAt: 'asc' },
    })
  );
}

export function findGraph(graphId: string): PrismaTask<GraphData> {
  return runQuery((db) =>
    db.graph.findUnique({
      rejectOnNotFound: true,
      where: { id: graphId },
      select: {
        ...GRAPH_ATTRIBUTES,
        root: { select: ROOT_ATTRIBUTES },
        versions: {
          select: VERSION_ATTRIBUTES,
          orderBy: { createdAt: 'asc' },
        },
        views: {
          select: VIEW_ATTRIBUTES,
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  );
}

export function findGraphVersion(graphId: string): PrismaTask<VersionData> {
  return runQuery((db) =>
    db.graphVersion.findFirst({
      rejectOnNotFound: true,
      where: { graphId },
      orderBy: { createdAt: 'desc' },
      select: VERSION_ATTRIBUTES,
    })
  );
}

export function findGraphVersions(graphId: string): PrismaTask<VersionData[]> {
  return runQuery((db) =>
    db.graphVersion.findMany({
      where: { graphId },
      orderBy: { createdAt: 'asc' },
      select: VERSION_ATTRIBUTES,
    })
  );
}

export function findGraphView(graphId: string): PrismaTask<ViewData> {
  return runQuery((db) =>
    db.graphView.findFirst({
      rejectOnNotFound: true,
      where: { graphId },
      orderBy: { createdAt: 'asc' },
      select: VIEW_ATTRIBUTES,
    })
  );
}

export function findGraphViews(graphId: string): PrismaTask<ViewData[]> {
  return runQuery((db) =>
    db.graphView.findMany({
      where: { graphId },
      orderBy: { createdAt: 'asc' },
      select: VIEW_ATTRIBUTES,
    })
  );
}

export function findGraphRows({
  graphId,
  parentFieldId,
  parentId,
}: {
  graphId: string;
  parentFieldId?: string;
  parentId?: string;
}): PrismaTask<RowData[]> {
  return pipe(
    runQuery((db) =>
      db.row.findMany({
        where: {
          version: { graphId },
          parentId,
          parentField: parentFieldId
            ? { id: parentFieldId }
            : { graph: { id: graphId } },
        },
        select: ROW_ATTRIBUTES,
        orderBy: { createdAt: 'asc' },
      })
    ),
    TE.map((rows) => rows.map(populateCells))
  );
}

export function createGraph(name: string): PrismaTask<GraphData> {
  return pipe(
    runCommand((db) =>
      db.graphVersion.create({
        data: {
          graph: {
            create: {
              root: { create: { name, type: NodeType.ROOT } },
              views: { create: { name: 'Table View' } },
            },
          },
        },
        select: {
          id: true,
          graph: {
            select: {
              ...GRAPH_ATTRIBUTES,
              root: { select: ROOT_ATTRIBUTES },
            },
          },
        },
      })
    ),
    TE.map(({ graph }) => graph)
  );
}

export function deleteGraph({
  graphId,
}: {
  graphId: string;
}): PrismaTask<GraphData> {
  return runCommand((db) =>
    db.graph.delete({
      where: { id: graphId },
      select: {
        ...GRAPH_ATTRIBUTES,
        root: { select: ROOT_ATTRIBUTES },
      },
    })
  );
}
