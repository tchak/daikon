import { prismaQuery, PrismaTask } from '~/prisma.server';
import { ROW_ATTRIBUTES } from '.';

export type RowData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export function createRow({
  versionId,
}: {
  versionId: string;
}): PrismaTask<RowData> {
  return prismaQuery((prisma) =>
    prisma.graphRow.create({ data: { versionId }, select: ROW_ATTRIBUTES })
  );
}

export function deleteRows({
  rowIds,
}: {
  rowIds: string[];
}): PrismaTask<RowData[]> {
  return prismaQuery((prisma) =>
    prisma.$transaction(async (prisma) => {
      const rows = await prisma.graphRow.findMany({
        where: { id: { in: rowIds } },
        select: ROW_ATTRIBUTES,
      });
      await prisma.graphRow.deleteMany({
        where: { id: { in: rowIds } },
      });
      return rows;
    })
  );
}
