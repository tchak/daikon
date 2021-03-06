import { prisma, Prisma } from '~/util/db.server';
import { Fields, ViewFields } from '~/aggregates/bucket.projection';
import { Data } from '~/aggregates/record.projection';
import type { ColorName } from '~/util/color';

type FindOne = {
  bucketId: string;
  userId: string;
  viewId?: string | null;
};

export async function findOne({ bucketId, userId, viewId }: FindOne) {
  const { schemas, ...bucket } = await prisma.bucket.findFirst({
    rejectOnNotFound: true,
    where: findByUser({ id: bucketId, userId }),
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      schemas: {
        take: 1,
        orderBy: { version: 'desc' },
        where: { lockedAt: null },
        select: { fields: true, version: true },
      },
      views: {
        take: 10,
        orderBy: { createdAt: 'asc' },
        where: { deletedAt: null },
        select: { id: true, name: true },
      },
    },
  });

  const schema = schemas[0];
  const fields = Fields.parse(schema.fields);
  const { fields: viewFields, ...view } = await prisma.view.findFirst({
    rejectOnNotFound: true,
    where: {
      bucketId: bucket.id,
      deletedAt: null,
      id: viewId ?? bucket.views[0].id,
    },
    select: { id: true, name: true, fields: true },
  });
  const parsedViewFields = ViewFields.parse(viewFields);

  const records = await prisma.record.findMany({
    where: { schema: { bucketId }, deletedAt: null },
    take: 1000,
    orderBy: { createdAt: 'asc' },
    select: { id: true, data: true },
  });

  return {
    ...bucket,
    color: bucket.color as ColorName,
    version: schema.version,
    view,
    fields: Object.values(fields)
      .filter((field) => !field.deletedAt)
      .map((field) => ({
        ...field,
        hidden: !!parsedViewFields[field.id]?.hidden,
      })),
    breadcrumbs: [{ name: bucket.name }],
    records: records.map((record) => ({
      ...record,
      data: Data.parse(record.data),
    })),
  };
}

export type FindOneData = Awaited<ReturnType<typeof findOne>>;

type FindMany = {
  userId: string;
};

export function findMany({ userId }: FindMany) {
  return prisma.bucket.findMany({
    where: findByUser({ userId }),
    select: {
      id: true,
      name: true,
      color: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export type FindManyData = Awaited<ReturnType<typeof findMany>>;

type FindByUser = {
  userId: string;
  role?: string;
  id?: string;
  deleted?: boolean;
};

const findByUser = ({ userId, role = 'Owner', id, deleted }: FindByUser) =>
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
