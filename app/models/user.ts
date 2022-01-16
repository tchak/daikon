import { prisma } from '~/util/db.server';

type FindByEmail = {
  email: string;
};

export function findByEmail({ email }: FindByEmail) {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, password: true },
  });
}

export type User = { id: string };
