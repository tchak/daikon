import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/ReadonlyArray';
import * as Eq from 'io-ts/Eq';

import { PrismaTask, EventType, runQuery, runCommand } from '~/prisma.server';
import {
  NODE_ATTRIBUTES,
  VERSION_ATTRIBUTES,
  NodeType,
  ROW_ATTRIBUTES,
  RowData,
  ChangeOp,
  ChangeAttribute,
  ChangeData,
  VersionData,
  EdgeData,
} from './validators';
import { populateCells } from './row';

export function resolveChangeType(change: ChangeData): string {
  switch (change.op) {
    case ChangeOp.CREATE:
      return 'CreateFieldChange';
    case ChangeOp.DELETE:
      return 'DeleteFieldChange';
    case ChangeOp.UPDATE:
      switch (change.attribute) {
        case ChangeAttribute.NAME:
          return 'FieldNameChange';
        case ChangeAttribute.DESCRIPTION:
          return 'FieldDescriptionChange';
        case ChangeAttribute.NULLABLE:
          return 'FieldNullableChange';
        case ChangeAttribute.POSITION:
          return 'FieldPositionChange';
        case ChangeAttribute.PARENT:
          return 'FieldParentChange';
      }
  }
  throw new Error(`Unknown change type ${change.op}`);
}

export function findVersion(versionId: string): PrismaTask<VersionData> {
  return runQuery((prisma) =>
    prisma.graphVersion.findUnique({
      rejectOnNotFound: true,
      where: { id: versionId },
      select: VERSION_ATTRIBUTES,
    })
  );
}

export function findVersionEdges({
  versionId,
  leftId,
  type,
}: {
  versionId: string;
  leftId?: string;
  type?: NodeType;
}): PrismaTask<EdgeData[]> {
  return pipe(
    runQuery((prisma) =>
      prisma.graphEdge.findMany({
        where: leftId
          ? type
            ? { versionId, left: { id: leftId }, right: { type } }
            : { versionId, left: { id: leftId } }
          : type
          ? { versionId, right: { type } }
          : { versionId },
        select: {
          id: true,
          position: true,
          left: { select: NODE_ATTRIBUTES },
          right: { select: NODE_ATTRIBUTES },
        },
        orderBy: [{ left: { id: 'asc' } }, { position: 'asc' }],
      })
    )
  );
}

export function findVersionRows({
  versionId,
  parentFieldId,
  parentId,
}: {
  versionId: string;
  parentFieldId?: string;
  parentId?: string;
}): PrismaTask<RowData[]> {
  return pipe(
    runQuery((prisma) =>
      prisma.row.findMany({
        where: {
          versionId,
          parentId,
          parentField: parentFieldId
            ? { id: parentFieldId }
            : { rights: { some: { versionId } } },
        },
        select: ROW_ATTRIBUTES,
        orderBy: { createdAt: 'asc' },
      })
    ),
    TE.map((rows) => rows.map(populateCells))
  );
}

export function createVersion({
  versionId,
}: {
  versionId: string;
}): PrismaTask<VersionData> {
  return pipe(
    runQuery((prisma) =>
      prisma.graphVersion.findUnique({
        rejectOnNotFound: true,
        where: { id: versionId },
        select: {
          graphId: true,
          edges: {
            select: { leftId: true, rightId: true, position: true },
          },
        },
      })
    ),
    TE.chain(({ graphId, edges }) =>
      runQuery((prisma) =>
        prisma.graphVersion.create({
          data: { graphId, edges: { createMany: { data: edges } } },
          select: VERSION_ATTRIBUTES,
        })
      )
    )
  );
}

export function lockVersion({
  versionId,
}: {
  versionId: string;
}): PrismaTask<VersionData> {
  return runCommand(async (prisma) => {
    const version = await prisma.graphVersion.findFirst({
      rejectOnNotFound: true,
      where: { id: versionId, lockedAt: null },
      select: VERSION_ATTRIBUTES,
    });
    await prisma.graphVersion.update({
      where: { id: versionId },
      data: { lockedAt: new Date() },
    });
    await prisma.event.create({
      data: {
        type: EventType.VERSION_LOCKED,
        payload: { versionId },
      },
    });
    return version;
  });
}

export function unlockVersion({
  versionId,
}: {
  versionId: string;
}): PrismaTask<VersionData> {
  return runCommand(async (prisma) => {
    const version = await prisma.graphVersion.findFirst({
      rejectOnNotFound: true,
      where: { id: versionId, lockedAt: { not: null } },
      select: VERSION_ATTRIBUTES,
    });
    await prisma.graphVersion.update({
      where: { id: versionId },
      data: { lockedAt: null },
    });
    await prisma.event.create({
      data: {
        type: EventType.VERSION_UNLOCKED,
        payload: { versionId },
      },
    });
    return version;
  });
}

export function deleteVersion({
  versionId,
}: {
  versionId: string;
}): PrismaTask<VersionData> {
  return runCommand(async (prisma) => {
    const version = await prisma.graphVersion.findFirst({
      rejectOnNotFound: true,
      where: { id: versionId, lockedAt: null },
      select: VERSION_ATTRIBUTES,
    });
    await prisma.graphVersion.delete({ where: { id: versionId } });
    await prisma.event.create({
      data: {
        type: EventType.VERSION_DELETED,
        payload: { versionId },
      },
    });
    return version;
  });
}

export function diff({
  leftVersionId,
  rightVersionId,
}: {
  leftVersionId: string;
  rightVersionId: string;
}): PrismaTask<ChangeData[]> {
  return pipe(
    runQuery((prisma) =>
      prisma.graphEdge.findMany({
        where: { id: { in: [leftVersionId, rightVersionId] } },
        select: {
          id: true,
          versionId: true,
          position: true,
          left: { select: NODE_ATTRIBUTES },
          right: { select: NODE_ATTRIBUTES },
        },
        orderBy: [{ left: { id: 'asc' } }, { position: 'asc' }],
      })
    ),
    TE.map((edges) =>
      pipe(
        edges,
        A.partition((edge) => edge.versionId == leftVersionId)
      )
    ),
    TE.map(({ left, right }) => compare(left, right))
  );
}

function compare(
  edges1: readonly EdgeData[],
  edges2: readonly EdgeData[]
): ChangeData[] {
  if (edgesEq.equals(edges1, edges2)) {
    return [];
  }
  const fromEdges = indexBy(edges1, (edge) => edge.right.id);
  const toEdges = indexBy(edges2, (edge) => edge.right.id);
  const fromIds = Object.keys(fromEdges);
  const toIds = Object.keys(toEdges);
  const kept = intersection(fromIds, toIds);

  const deleted = pipe(
    fromIds,
    A.filter((id) => !toIds.includes(id)),
    A.map((id) => ({ nodeId: id, op: ChangeOp.DELETE }))
  );
  const created = pipe(
    toIds,
    A.filter((id) => !fromIds.includes(id)),
    A.map((id) => ({ nodeId: id, op: ChangeOp.CREATE }))
  );
  const updated = pipe(
    kept,
    A.map((id: string) => [id, fromEdges[id], toEdges[id]] as const),
    A.chain(([nodeId, from, to]) => compareEdge(nodeId, from, to))
  );

  return [...deleted, ...created, ...updated];
}

function compareEdge(
  nodeId: string,
  edge1: EdgeData,
  edge2: EdgeData
): ChangeData[] {
  const changes: ChangeData[] = [];
  const node1 = edge1.right;
  const node2 = edge2.right;
  if (node1.name != node2.name) {
    changes.push({
      nodeId,
      op: ChangeOp.UPDATE,
      attribute: ChangeAttribute.NAME,
      from: node1.name,
      to: node2.name,
    });
  }
  if (node1.description != node2.description) {
    changes.push({
      nodeId,
      op: ChangeOp.UPDATE,
      attribute: ChangeAttribute.DESCRIPTION,
      from: node1.description,
      to: node2.description,
    });
  }
  if (node1.nullable != node2.nullable) {
    changes.push({
      nodeId,
      op: ChangeOp.UPDATE,
      attribute: ChangeAttribute.NULLABLE,
      from: node1.nullable,
      to: node2.nullable,
    });
  }
  if (edge1.position != edge2.position) {
    changes.push({
      nodeId,
      op: ChangeOp.UPDATE,
      attribute: ChangeAttribute.POSITION,
      from: edge1.position,
      to: edge2.position,
    });
  }
  if (edge1.left.id != edge2.left.id) {
    changes.push({
      nodeId,
      op: ChangeOp.UPDATE,
      attribute: ChangeAttribute.PARENT,
      from: edge1.left.id,
      to: edge2.left.id,
    });
  }
  return changes;
}

const indexBy = <T>(
  array: readonly T[],
  f: (item: T) => string
): Record<string, T> =>
  Object.fromEntries(array.map((item) => [f(item), item]));

const intersection = A.intersection(Eq.string);
const nodeEq = Eq.struct({
  id: Eq.string,
  type: Eq.string,
  name: Eq.string,
  description: Eq.nullable(Eq.string),
  nullable: Eq.boolean,
});
const edgeEq = Eq.struct({ position: Eq.number, left: nodeEq, right: nodeEq });
const edgesEq = Eq.readonly(Eq.array(edgeEq));
