import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

import { prismaQuery, PrismaTask } from '~/prisma.server';
import {
  ROW_ATTRIBUTES,
  findNodeInternalId,
  findVersionRootInternalId,
  RowData,
  CellData,
  NodeType,
  RawCellData,
  RawRowData,
} from '.';

export function resolveCellType(cell: CellData): string {
  switch (cell.type) {
    case NodeType.TEXT:
      return 'TextCell';
    case NodeType.BOOLEAN:
      return 'BooleanCell';
    case NodeType.NUMBER:
      if ((cell.options as { decimal?: boolean })['decimal']) {
        return 'FloatCell';
      }
      return 'IntCell';
    case NodeType.DATE:
      return 'DateCell';
    case NodeType.DATE_TIME:
      return 'DateTimeCell';
    default:
      throw new TypeError(`Unknown type ${cell.type}`);
  }
}

export function populateCells({
  data,
  parentField,
  ...row
}: RawRowData): RowData {
  return {
    ...row,
    cells: parentField
      ? parentField.lefts
          .filter(({ right }) => right.type != NodeType.BLOCK)
          .map(({ right }) => ({
            ...right,
            value: getValue(right, data),
          }))
      : [],
  };
}

function getValue(cell: RawCellData, data: RawRowData['data']) {
  const defaultValue = cell.type == NodeType.BOOLEAN ? false : null;
  return (data as Record<string, unknown>)[cell.id] ?? defaultValue;
}

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
    ),
    TE.map(populateCells)
  );
}

export function deleteRows({
  rowIds,
}: {
  rowIds: string[];
}): PrismaTask<RowData[]> {
  return pipe(
    prismaQuery((prisma) =>
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
    ),
    TE.map((rows) => rows.map(populateCells))
  );
}
