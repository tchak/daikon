import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import parseISO from 'date-fns/parseISO';

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
            ...getValue(right, data),
          }))
      : [],
  };
}

function getValue(cell: RawCellData, data: RawRowData['data']) {
  const value = (data as Record<string, unknown>)[cell.id];
  const defaultValue = cell.type == NodeType.BOOLEAN ? false : null;
  switch (cell.type) {
    case NodeType.BOOLEAN:
      return { booleanValue: value ?? defaultValue };
    case NodeType.NUMBER:
      if ((cell.options as { decimal?: boolean })['decimal']) {
        return { floatValue: value ?? defaultValue };
      }
      return { intValue: value ?? defaultValue };
    case NodeType.DATE_TIME:
      return {
        dateTimeValue: value ? parseISO(value as string) : defaultValue,
      };
    case NodeType.DATE:
      return { dateValue: value ? parseISO(value as string) : defaultValue };
    default:
      return { textValue: value ?? defaultValue };
  }
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

export function updateCell({
  rowId,
  fieldId,
  value,
}: {
  rowId: string;
  fieldId: string;
  value: RawRowData['data'];
}): PrismaTask<RowData> {
  return pipe(
    prismaQuery((prisma) =>
      prisma.row.findUnique({
        rejectOnNotFound: true,
        where: { id: rowId },
        select: { data: true },
      })
    ),
    TE.chain(({ data }) =>
      prismaQuery((prisma) =>
        prisma.row.update({
          where: { id: rowId },
          data: { data: { ...(data as object), [fieldId]: value } },
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
