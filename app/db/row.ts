import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

import { prismaQuery, PrismaTask } from '~/prisma.server';
import {
  ROW_ATTRIBUTES,
  findNodeInternalId,
  findVersionRootInternalId,
} from '.';

export type RowData = {
  id: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function createRow({
  versionId,
  parent,
}: {
  versionId: string;
  parent?: { fieldId: string; id: string };
}): PrismaTask<RowData> {
  return pipe(
    parent
      ? findNodeInternalId(versionId, parent.fieldId)
      : findVersionRootInternalId(versionId),
    TE.chain((parentFieldId) =>
      prismaQuery((prisma) =>
        prisma.row.create({
          data: { versionId, parentFieldId, parentId: parent?.id },
          select: ROW_ATTRIBUTES,
        })
      )
    )
  );
}

export function deleteRows({
  rowIds,
}: {
  rowIds: string[];
}): PrismaTask<RowData[]> {
  return prismaQuery((prisma) =>
    prisma.$transaction(async (prisma) => {
      const rows = await prisma.row.findMany({
        where: { id: { in: rowIds } },
        select: ROW_ATTRIBUTES,
      });
      await prisma.row.deleteMany({
        where: { id: { in: rowIds } },
      });
      return rows;
    })
  );
}
