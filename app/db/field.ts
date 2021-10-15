import { v4 as uuid } from 'uuid';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { prismaQuery, PrismaTask } from '~/prisma.server';
import { NODE_ATTRIBUTES, NodeType, NodeCardinality } from '.';

export type FieldData = {
  internalId: string;
  id: string;
  type: NodeType;
  name: string;
  description: null | string;
  required: boolean;
  updatedAt: Date;
  cardinality: NodeCardinality;
};

export type EdgeData = {
  id: string;
  position: number;
  left: FieldData;
  right: FieldData;
};

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
    case NodeType.BLOC:
      return 'BlocField';
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
    TE.bind('edge', () =>
      prismaQuery((prisma) =>
        prisma.graphEdge.findFirst({
          rejectOnNotFound: true,
          where: { versionId, left: { id: leftId } },
          orderBy: { position: 'desc' },
          select: { position: true },
        })
      )
    ),
    TE.chain(({ leftId, edge }) =>
      prismaQuery((prisma) =>
        prisma.graphEdge.create({
          data: {
            position: position ? position : edge.position + 1,
            version: {
              connect: { id: versionId },
            },
            left: {
              connect: { internalId: leftId },
            },
            right: {
              create: { type, name },
            },
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
      prismaQuery(async (prisma) => {
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
  Pick<FieldData, 'name' | 'description' | 'required'>
>): PrismaTask<FieldData> {
  return pipe(
    findPinnedNodeInternalId(versionId, nodeId),
    TE.alt(() => cloneNode(versionId, nodeId)),
    TE.chain((internalId) =>
      prismaQuery((prisma) =>
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
      prismaQuery((prisma) =>
        prisma.graphEdge.findFirst({
          rejectOnNotFound: true,
          where: { versionId, rightId },
          select: { id: true },
        })
      )
    ),
    TE.chain(({ leftId, edge }) =>
      prismaQuery((prisma) =>
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
      prismaQuery(async (prisma) => {
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
        return internalId;
      })
    )
  );
}

function findUnlockedNode(
  versionId: string,
  nodeId: string
): PrismaTask<FieldData> {
  return prismaQuery((prisma) =>
    prisma.graphNode.findFirst({
      rejectOnNotFound: true,
      where: {
        id: nodeId,
        type: { not: NodeType.ROOT },
        OR: [
          {
            graph: {
              versions: { some: { id: versionId, lockedAt: null } },
            },
          },
          {
            rights: {
              some: { version: { id: versionId, lockedAt: null } },
            },
          },
        ],
      },
      select: NODE_ATTRIBUTES,
    })
  );
}

function findNodeInternalId(
  versionId: string,
  nodeId: string
): PrismaTask<string> {
  return pipe(
    prismaQuery((prisma) =>
      prisma.graphNode.findFirst({
        rejectOnNotFound: true,
        where: {
          id: nodeId,
          OR: [
            {
              graph: {
                versions: { some: { id: versionId, lockedAt: null } },
              },
            },
            {
              rights: {
                some: { version: { id: versionId, lockedAt: null } },
              },
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

function findPinnedNodeInternalId(
  versionId: string,
  nodeId: string
): PrismaTask<string> {
  return pipe(
    prismaQuery((prisma) =>
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