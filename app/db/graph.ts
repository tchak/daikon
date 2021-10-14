import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { prismaQuery, PrismaTask } from '~/prisma.server';
import {
  NodeType,
  VERSION_ATTRIBUTES,
  VIEW_ATTRIBUTES,
  ROOT_ATTRIBUTES,
  GRAPH_ATTRIBUTES,
} from '.';

export type GraphData = {
  id: string;
  createdAt: Date;
  color: string;
  root: {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
  };
};

export function findGraphs(): PrismaTask<GraphData[]> {
  return prismaQuery((prisma) =>
    prisma.graph.findMany({
      select: {
        ...GRAPH_ATTRIBUTES,
        root: { select: ROOT_ATTRIBUTES },
      },
      orderBy: { createdAt: 'asc' },
    })
  );
}

export function findGraph(graphId: string): PrismaTask<GraphData> {
  return prismaQuery((prisma) =>
    prisma.graph.findUnique({
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

export function createGraph(name: string): PrismaTask<GraphData> {
  return pipe(
    prismaQuery((prisma) =>
      prisma.graphVersion.create({
        data: {
          graph: {
            create: {
              root: { create: { name, type: NodeType.ROOT } },
              views: { create: { name: 'Grid View' } },
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
  return prismaQuery((prisma) =>
    prisma.graph.delete({
      where: { id: graphId },
      select: {
        ...GRAPH_ATTRIBUTES,
        root: { select: ROOT_ATTRIBUTES },
      },
    })
  );
}
