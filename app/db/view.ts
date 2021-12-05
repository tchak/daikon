import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { prismaQuery, PrismaTask } from '~/prisma.server';
import { NODE_ATTRIBUTES, VIEW_ATTRIBUTES, ViewData, EdgeData } from '.';

export function findView(viewId: string): PrismaTask<ViewData> {
  return prismaQuery((prisma) =>
    prisma.graphView.findUnique({
      rejectOnNotFound: true,
      where: { id: viewId },
      select: VIEW_ATTRIBUTES,
    })
  );
}

export function findViewEdges({
  viewId,
  leftId,
}: {
  viewId: string;
  leftId?: string;
}): PrismaTask<EdgeData[]> {
  return pipe(
    prismaQuery((prisma) =>
      prisma.$transaction(async (prisma) => {
        const view = await prisma.graphView.findUnique({
          rejectOnNotFound: true,
          where: { id: viewId },
          select: { hidden: true, graphId: true },
        });
        return prisma.graphVersion.findFirst({
          rejectOnNotFound: true,
          where: { graphId: view.graphId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            edges: {
              where: leftId
                ? {
                    left: { id: leftId },
                    right: { id: { notIn: view.hidden } },
                  }
                : { right: { id: { notIn: view.hidden } } },
              select: {
                id: true,
                position: true,
                left: { select: NODE_ATTRIBUTES },
                right: { select: NODE_ATTRIBUTES },
              },
              orderBy: [{ left: { id: 'asc' } }, { position: 'asc' }],
            },
          },
        });
      })
    ),
    TE.map(({ edges }) => edges)
  );
}

export function createView({
  graphId,
  name,
}: {
  graphId: string;
  name: string;
}): PrismaTask<ViewData> {
  return prismaQuery((prisma) =>
    prisma.graphView.create({
      data: {
        name,
        graphId,
      },
      select: VIEW_ATTRIBUTES,
    })
  );
}

export function updateView({
  viewId,
  name,
}: {
  viewId: string;
  name: string;
}): PrismaTask<ViewData> {
  return pipe(
    prismaQuery((prisma) =>
      prisma.graphView.update({
        where: { id: viewId },
        data: { name },
        select: VIEW_ATTRIBUTES,
      })
    )
  );
}

export function updateViewField({
  viewId,
  nodeId,
  hidden,
}: {
  viewId: string;
  nodeId: string;
  hidden: boolean;
}): PrismaTask<ViewData> {
  return pipe(
    prismaQuery((prisma) =>
      prisma.$transaction(async (prisma) => {
        const view = await prisma.graphView.findUnique({
          rejectOnNotFound: true,
          where: { id: viewId },
          select: { hidden: true },
        });
        const hiddenSet = new Set(view.hidden);
        if (hidden) {
          hiddenSet.add(nodeId);
        } else {
          hiddenSet.delete(nodeId);
        }
        return prisma.graphView.update({
          where: { id: viewId },
          data: { hidden: [...hiddenSet] },
          select: VIEW_ATTRIBUTES,
        });
      })
    )
  );
}

export function deleteView({
  viewId,
}: {
  viewId: string;
}): PrismaTask<ViewData> {
  return prismaQuery((prisma) =>
    prisma.graphView.delete({
      where: { id: viewId },
      select: VIEW_ATTRIBUTES,
    })
  );
}
