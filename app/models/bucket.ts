import { prisma, Prisma } from '~/util/db.server';
import { Fields } from '~/aggregates/bucket.projection';
import type { ColorName } from '~/util/color';

export function findOne(id: string, userId: string) {
  return prisma.bucket.findFirst({
    rejectOnNotFound: true,
    where: findByUser({ id, userId }),
    include: { schemas: { orderBy: { version: 'desc' }, take: 1 } },
  });
}

export function findMany(userId: string) {
  return prisma.bucket.findMany({
    where: findByUser({ userId }),
  });
}

export async function getDashboard(id: string, userId: string) {
  const bucket = await findOne(id, userId);
  const fields = Fields.parse(bucket.schemas[0].fields);

  return {
    ...bucket,
    color: bucket.color as ColorName,
    fields: Object.values(fields).map((field) => ({ ...field, hidden: false })),
  };
}

const findByUser = ({
  userId,
  role = 'Owner',
  id,
  deleted,
}: {
  userId: string;
  role?: string;
  id?: string;
  deleted?: boolean;
}) =>
  Prisma.validator<Prisma.BucketWhereInput>()({
    id,
    deletedAt: deleted ? { not: null } : null,
    organization: {
      deletedAt: null,
      memberships: { some: { userId, role } },
    },
  });

// type Change = {
//   fieldId: string;
//   op: 'UPDATE';
//   attribute: string;
//   from: string;
//   to: string;
// };

// function compare(fields1: Fields, fields2: Fields): Change[] {
//   if (edgesEq.equals(edges1, edges2)) {
//     return [];
//   }
//   const fromEdges = indexBy(edges1, (edge) => edge.right.id);
//   const toEdges = indexBy(edges2, (edge) => edge.right.id);
//   const fromIds = Object.keys(fromEdges);
//   const toIds = Object.keys(toEdges);
//   const kept = intersection(fromIds, toIds);

//   const deleted = pipe(
//     fromIds,
//     A.filter((id) => !toIds.includes(id)),
//     A.map((id) => ({ nodeId: id, op: ChangeOp.DELETE }))
//   );
//   const created = pipe(
//     toIds,
//     A.filter((id) => !fromIds.includes(id)),
//     A.map((id) => ({ nodeId: id, op: ChangeOp.CREATE }))
//   );
//   const updated = pipe(
//     kept,
//     A.map((id: string) => [id, fromEdges[id], toEdges[id]] as const),
//     A.chain(([nodeId, from, to]) => compareEdge(nodeId, from, to))
//   );

//   return [...deleted, ...created, ...updated];
// }

// function compareField(field1: Field, field2: Field): Change[] {
//   const changes: Change[] = [];
//   const node1 = edge1.right;
//   const node2 = edge2.right;
//   if (node1.name != node2.name) {
//     changes.push({
//       nodeId,
//       op: ChangeOp.UPDATE,
//       attribute: ChangeAttribute.NAME,
//       from: node1.name,
//       to: node2.name,
//     });
//   }
//   if (node1.description != node2.description) {
//     changes.push({
//       nodeId,
//       op: ChangeOp.UPDATE,
//       attribute: ChangeAttribute.DESCRIPTION,
//       from: node1.description,
//       to: node2.description,
//     });
//   }
//   if (node1.nullable != node2.nullable) {
//     changes.push({
//       nodeId,
//       op: ChangeOp.UPDATE,
//       attribute: ChangeAttribute.NULLABLE,
//       from: node1.nullable,
//       to: node2.nullable,
//     });
//   }
//   if (edge1.position != edge2.position) {
//     changes.push({
//       nodeId,
//       op: ChangeOp.UPDATE,
//       attribute: ChangeAttribute.POSITION,
//       from: edge1.position,
//       to: edge2.position,
//     });
//   }
//   if (edge1.left.id != edge2.left.id) {
//     changes.push({
//       nodeId,
//       op: ChangeOp.UPDATE,
//       attribute: ChangeAttribute.PARENT,
//       from: edge1.left.id,
//       to: edge2.left.id,
//     });
//   }
//   return changes;
// }

// const intersection = <T>(a: Set<T>, b: Set<T>) =>
//   new Set<T>([...a].filter((x) => b.has(x)));

// const indexBy = <T>(
//   array: readonly T[],
//   f: (item: T) => string
// ): Record<string, T> =>
//   Object.fromEntries(array.map((item) => [f(item), item]));
