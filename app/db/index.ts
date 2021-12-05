import { NodeType, NodeCardinality, Prisma } from '@prisma/client';

export { NodeType, NodeCardinality };

export type FieldData = {
  internalId: string;
  id: string;
  type: NodeType;
  name: string;
  description: null | string;
  nullable: boolean;
  updatedAt: Date;
  cardinality: NodeCardinality;
};

export type EdgeData = {
  id: string;
  position: number;
  left: FieldData;
  right: FieldData;
};

export type GraphData = {
  id: string;
  createdAt: Date;
  color: string;
  root: {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
  };
};

export type CellData = {
  id: string;
  name: string;
  type: NodeType;
  options: unknown;
  value: unknown;
};

export type RowData = {
  id: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  cells: CellData[];
};

export type RawCellData = Pick<CellData, 'id' | 'name' | 'type'> & {
  options: Prisma.JsonValue;
};

export type RawRowData = Omit<RowData, 'cells'> & {
  data: Prisma.JsonValue;
  parentField: {
    lefts: {
      right: RawCellData;
    }[];
  } | null;
};

export enum ChangeOp {
  CREATE,
  DELETE,
  UPDATE,
}

export enum ChangeAttribute {
  NAME,
  DESCRIPTION,
  NULLABLE,
  CARDINALITY,
  POSITION,
  PARENT,
}

export type ChangeData = {
  nodeId: string;
  op: ChangeOp;
  attribute?: ChangeAttribute;
  from?: string | boolean | number | null;
  to?: string | boolean | number | null;
};

export type VersionData = {
  id: string;
  createdAt: Date;
  lockedAt: Date | null;
};

export type ViewData = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const GRAPH_ATTRIBUTES = {
  id: true,
  createdAt: true,
  color: true,
};

export const ROOT_ATTRIBUTES = {
  id: true,
  name: true,
  description: true,
  updatedAt: true,
};

export const VERSION_ATTRIBUTES = {
  id: true,
  createdAt: true,
  lockedAt: true,
};

export const VIEW_ATTRIBUTES = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  description: true,
};

export const NODE_ATTRIBUTES = {
  id: true,
  internalId: true,
  type: true,
  name: true,
  description: true,
  nullable: true,
  cardinality: true,
  updatedAt: true,
};

export const ROW_ATTRIBUTES = {
  id: true,
  createdAt: true,
  updatedAt: true,
  data: true,
  parentField: {
    select: {
      lefts: {
        select: {
          right: {
            select: { id: true, name: true, type: true, options: true },
          },
        },
      },
    },
  },
};

export * from './graph';
export * from './version';
export * from './field';
export * from './view';
export * from './row';
