import { prisma, Prisma } from '~/util/db.server';

export function findOne(id: string, userId: string) {
  return prisma.record.findFirst({
    rejectOnNotFound: true,
    where: findByUser({ id, userId }),
  });
}

export function findMany(userId: string) {
  return prisma.record.findMany({
    where: findByUser({ userId }),
  });
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
  Prisma.validator<Prisma.RecordWhereInput>()({
    id,
    deletedAt: deleted ? { not: null } : null,
    schema: {
      bucket: {
        deletedAt: null,
        organization: {
          deletedAt: null,
          memberships: { some: { userId, role } },
        },
      },
    },
  });
