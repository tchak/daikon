import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { PrismaTask, EventType, runQuery, runCommand } from '~/prisma.server';
import {
  NODE_ATTRIBUTES,
  VIEW_ATTRIBUTES,
  ViewData,
  EdgeData,
  NodeType,
} from './validators';

export function findView(viewId: string): PrismaTask<ViewData> {
  return runQuery((prisma) =>
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
  type,
}: {
  viewId: string;
  leftId?: string;
  type?: NodeType;
}): PrismaTask<EdgeData[]> {
  return pipe(
    runQuery(async (prisma) => {
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
              ? type
                ? {
                    left: { id: leftId },
                    right: { id: { notIn: view.hidden }, type },
                  }
                : {
                    left: { id: leftId },
                    right: { id: { notIn: view.hidden } },
                  }
              : type
              ? { right: { id: { notIn: view.hidden }, type } }
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
    }),
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
  return runCommand(async (prisma) => {
    const view = await prisma.graphView.create({
      data: {
        name,
        graphId,
      },
      select: VIEW_ATTRIBUTES,
    });
    await prisma.event.create({
      data: {
        type: EventType.VIEW_CREATED,
        payload: { graphId, name },
      },
    });
    return view;
  });
}

export function updateView({
  viewId,
  name,
}: {
  viewId: string;
  name: string;
}): PrismaTask<ViewData> {
  return pipe(
    runCommand(async (prisma) => {
      const view = await prisma.graphView.update({
        where: { id: viewId },
        data: { name },
        select: VIEW_ATTRIBUTES,
      });
      await prisma.event.create({
        data: {
          type: EventType.VIEW_NAME_CHANGED,
          payload: { viewId, name },
        },
      });
      return view;
    })
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
    runCommand(async (prisma) => {
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
  );
}

export function deleteView({
  viewId,
}: {
  viewId: string;
}): PrismaTask<ViewData> {
  return runCommand(async (prisma) => {
    const view = await prisma.graphView.delete({
      where: { id: viewId },
      select: VIEW_ATTRIBUTES,
    });
    await prisma.event.create({
      data: {
        type: EventType.VIEW_DELETED,
        payload: { viewId },
      },
    });
    return view;
  });
}
