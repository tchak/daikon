import { prisma, Prisma } from '~/util/db.server';

type FindOne = {
  organizationId: string;
  userId: string;
  buckets?: {
    take?: number;
  };
};

export function findOne({ organizationId, userId, buckets }: FindOne) {
  return prisma.organization.findFirst({
    rejectOnNotFound: true,
    where: findByUser({ id: organizationId, userId }),
    select: {
      id: true,
      name: true,
      description: true,
      buckets: {
        take: buckets?.take ?? 10,
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, color: true },
        where: { deletedAt: null },
      },
    },
  });
}

export type FindOneData = Awaited<ReturnType<typeof findOne>>;

type FindMany = {
  userId: string;
};

export function findMany({ userId }: FindMany) {
  return prisma.organization.findMany({
    where: findByUser({ userId }),
    select: {
      id: true,
      name: true,
      buckets: {
        take: 10,
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, color: true },
        where: { deletedAt: null },
      },
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
  Prisma.validator<Prisma.OrganizationWhereInput>()({
    id,
    deletedAt: deleted ? { not: null } : null,
    memberships: { some: { userId, role } },
  });
