import { prisma } from '~/util/db.server';

export function findByEmail(email: string) {
  return prisma.user.findFirst({ where: { email, deletedAt: null } });
}
