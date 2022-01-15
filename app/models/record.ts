import { prisma, Prisma } from '~/util/db.server';
import { Data } from '~/aggregates/record.projection';

type FindOne = {
  bucketId: string;
  recordId: string;
  userId: string;
};

export async function findOne({ bucketId, recordId, userId }: FindOne) {
  const record = await prisma.record.findFirst({
    rejectOnNotFound: true,
    where: findByUser({ id: recordId, bucketId, userId }),
    select: { id: true, data: true, createdAt: true, updatedAt: true },
  });
  return { ...record, data: Data.parse(record.data) };
}

export type FindOneData = Awaited<ReturnType<typeof findOne>>;

type FindMany = {
  bucketId: string;
  userId: string;
};

export async function findMany({ bucketId, userId }: FindMany) {
  const records = await prisma.record.findMany({
    where: findByUser({ bucketId, userId }),
    select: { id: true, data: true, createdAt: true, updatedAt: true },
  });
  return records.map((record) => ({
    ...record,
    data: Data.parse(record.data),
  }));
}

export type FindManyData = Awaited<ReturnType<typeof findMany>>;

type FindByUser = {
  bucketId: string;
  userId: string;
  role?: string;
  id?: string;
  deleted?: boolean;
};

const findByUser = ({
  bucketId,
  userId,
  role = 'Owner',
  id,
  deleted,
}: FindByUser) =>
  Prisma.validator<Prisma.RecordWhereInput>()({
    id,
    deletedAt: deleted ? { not: null } : null,
    schema: {
      bucket: {
        id: bucketId,
        deletedAt: null,
        organization: {
          deletedAt: null,
          memberships: { some: { userId, role } },
        },
      },
    },
  });
