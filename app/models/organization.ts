import { prisma, Prisma } from '~/util/db.server';

export function findOne(id: string, userId: string) {
  return prisma.organization.findFirst({
    rejectOnNotFound: true,
    where: findByUser({ id, userId }),
  });
}

export function findMany(userId: string) {
  return prisma.organization.findMany({
    where: findByUser({ userId }),
    include: {
      buckets: {
        select: { id: true, name: true, color: true },
        where: { deletedAt: null },
      },
    },
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
  Prisma.validator<Prisma.OrganizationWhereInput>()({
    id,
    deletedAt: deleted ? { not: null } : null,
    memberships: { some: { userId, role } },
  });
