import { v4 as uuid } from 'uuid';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import { PrismaTask, EventType, runQuery, runCommand } from '~/prisma.server';
import { NODE_ATTRIBUTES, NodeType, FieldData, EdgeData } from './validators';

export function resolveFieldType(node: FieldData): string {
  switch (node.type) {
    case NodeType.TEXT:
      return 'TextField';
    case NodeType.BOOLEAN:
      return 'BooleanField';
    case NodeType.NUMBER:
      return 'NumberField';
    case NodeType.DATE:
      return 'DateField';
    case NodeType.DATE_TIME:
      return 'DateTimeField';
    case NodeType.BLOCK:
      return 'BlockField';
    default:
      return 'RootField';
  }
}

export function createField(
  type: NodeType,
  {
    versionId,
    leftId,
    name,
    position,
  }: {
    versionId: string;
    name: string;
    leftId: string;
    position?: number;
  }
): PrismaTask<EdgeData> {
  return pipe(
    TE.Do,
    TE.bind('leftId', () => findNodeInternalId(versionId, leftId)),
    TE.bind('lastPosition', () =>
      pipe(
        runQuery((prisma) =>
          prisma.graphEdge.findFirst({
            rejectOnNotFound: true,
            where: { versionId, left: { id: leftId } },
            orderBy: { position: 'desc' },
            select: { position: true },
          })
        ),
        TE.match(
          () => E.right(1),
          (edge) => E.right(edge.position + 1)
        )
      )
    ),
    TE.chain(({ leftId, lastPosition }) =>
      runCommand((prisma) =>
        prisma.graphEdge.create({
          data: {
            position: position ? position : lastPosition,
            version: { connect: { id: versionId } },
            left: { connect: { internalId: leftId } },
            right: { create: { type, name } },
          },
          select: {
            id: true,
            position: true,
            left: { select: NODE_ATTRIBUTES },
            right: { select: NODE_ATTRIBUTES },
          },
        })
      )
    )
  );
}

export function deleteField({
  versionId,
  nodeId,
}: {
  versionId: string;
  nodeId: string;
}): PrismaTask<FieldData> {
  return pipe(
    TE.Do,
    TE.bind('node', () => findUnlockedNode(versionId, nodeId)),
    TE.bind('_', ({ node: { internalId } }) =>
      runCommand(async (prisma) => {
        await prisma.graphNode.deleteMany({
          where: {
            id: nodeId,
            AND: [
              { lefts: { every: { versionId } } },
              { rights: { every: { versionId } } },
            ],
          },
        });
        await prisma.graphEdge.deleteMany({
          where: {
            OR: [
              { rightId: internalId, versionId },
              { leftId: internalId, versionId },
            ],
          },
        });
        await prisma.event.create({
          data: {
            type: EventType.FIELD_DELETED,
            payload: { versionId, fieldId: nodeId },
          },
        });
      })
    ),
    TE.map(({ node }) => node)
  );
}

export function updateField({
  versionId,
  nodeId,
  ...node
}: {
  versionId: string;
  nodeId: string;
} & Partial<
  Pick<FieldData, 'name' | 'description' | 'nullable'>
>): PrismaTask<FieldData> {
  return pipe(
    findPinnedNodeInternalId(versionId, nodeId),
    TE.alt(() => cloneNode(versionId, nodeId)),
    TE.chain((internalId) =>
      runCommand((prisma) =>
        prisma.graphNode.update({
          where: { internalId },
          data: node,
          select: NODE_ATTRIBUTES,
        })
      )
    )
  );
}

export function moveField({
  versionId,
  nodeId,
  leftId,
  position,
}: {
  versionId: string;
  nodeId: string;
  leftId: string;
  position: number;
}): PrismaTask<EdgeData> {
  return pipe(
    TE.Do,
    TE.bind('leftId', () => findNodeInternalId(versionId, leftId)),
    TE.bind('rightId', () => findNodeInternalId(versionId, nodeId)),
    TE.bind('edge', ({ rightId }) =>
      runQuery((prisma) =>
        prisma.graphEdge.findFirst({
          rejectOnNotFound: true,
          where: { versionId, rightId },
          select: { id: true },
        })
      )
    ),
    TE.chain(({ leftId, edge }) =>
      runCommand((prisma) =>
        prisma.graphEdge.update({
          where: edge,
          data: { position, leftId },
          select: {
            id: true,
            position: true,
            left: { select: NODE_ATTRIBUTES },
            right: { select: NODE_ATTRIBUTES },
          },
        })
      )
    )
  );
}

function cloneNode(versionId: string, nodeId: string): PrismaTask<string> {
  return pipe(
    TE.Do,
    TE.bind('node', () => findUnlockedNode(versionId, nodeId)),
    TE.bind('internalId', () => TE.of(uuid())),
    TE.chain(({ internalId, node }) =>
      pipe(
        runCommand(async (prisma) => {
          await prisma.graphNode.create({
            data: { ...node, internalId },
            select: { internalId: true },
          });
          await prisma.graphEdge.updateMany({
            where: { right: { id: nodeId }, versionId },
            data: { rightId: internalId },
          });
          await prisma.graphEdge.updateMany({
            where: { left: { id: nodeId }, versionId },
            data: { leftId: internalId },
          });
        }),
        TE.map(() => internalId)
      )
    )
  );
}

function findUnlockedNode(
  versionId: string,
  nodeId: string
): PrismaTask<FieldData> {
  return runQuery((prisma) =>
    prisma.graphNode.findFirst({
      rejectOnNotFound: true,
      where: {
        id: nodeId,
        type: { not: NodeType.ROOT },
        OR: [
          {
            graph: { versions: { some: { id: versionId, lockedAt: null } } },
          },
          {
            rights: { some: { version: { id: versionId, lockedAt: null } } },
          },
        ],
      },
      select: NODE_ATTRIBUTES,
    })
  );
}

export function findNodeInternalId(
  versionId: string,
  nodeId: string
): PrismaTask<string> {
  return pipe(
    runQuery((prisma) =>
      prisma.graphNode.findFirst({
        rejectOnNotFound: true,
        where: {
          id: nodeId,
          OR: [
            {
              graph: { versions: { some: { id: versionId, lockedAt: null } } },
            },
            {
              rights: { some: { version: { id: versionId, lockedAt: null } } },
            },
          ],
        },
        select: { internalId: true },
        orderBy: { createdAt: 'desc' },
      })
    ),
    TE.map(({ internalId }) => internalId)
  );
}

export function findVersionRootInternalId(
  versionId: string
): PrismaTask<string> {
  return pipe(
    runQuery((prisma) =>
      prisma.graphNode.findFirst({
        rejectOnNotFound: true,
        where: { graph: { versions: { some: { id: versionId } } } },
        select: { internalId: true },
      })
    ),
    TE.map(({ internalId }) => internalId)
  );
}

function findPinnedNodeInternalId(
  versionId: string,
  nodeId: string
): PrismaTask<string> {
  return pipe(
    runQuery((prisma) =>
      prisma.graphNode.findFirst({
        rejectOnNotFound: true,
        where: {
          id: nodeId,
          type: { not: NodeType.ROOT },
          rights: { every: { version: { id: versionId, lockedAt: null } } },
        },
        select: { internalId: true },
      })
    ),
    TE.map(({ internalId }) => internalId)
  );
}
