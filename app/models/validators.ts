import {
  NodeType,
  NodeCardinality,
  Prisma,
  GraphView,
  GraphVersion,
  GraphNode,
  GraphEdge,
  Graph,
  Row,
} from '@prisma/client';

export { NodeType, NodeCardinality };

export type FieldData = Pick<
  GraphNode,
  | 'internalId'
  | 'id'
  | 'type'
  | 'name'
  | 'description'
  | 'nullable'
  | 'cardinality'
  | 'updatedAt'
>;

export type EdgeData = Pick<GraphEdge, 'id' | 'position'> & {
  left: FieldData;
  right: FieldData;
};

export type GraphData = Pick<Graph, 'id' | 'createdAt' | 'color'> & {
  root: Pick<GraphNode, 'id' | 'name' | 'description' | 'updatedAt'>;
};

export type CellData = {
  id: string;
  name: string;
  type: NodeType;
  options: unknown;
  textValue?: unknown;
  booleanValue?: unknown;
  intValue?: unknown;
  floatValue?: unknown;
};

export type RowData =
  | Pick<Row, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>
  | {
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

export type VersionData = Pick<GraphVersion, 'id' | 'createdAt' | 'lockedAt'>;

export type ViewData = Pick<
  GraphView,
  'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'
>;

export const GRAPH_ATTRIBUTES = Prisma.validator<Prisma.GraphSelect>()({
  id: true,
  createdAt: true,
  color: true,
});

export const ROOT_ATTRIBUTES = Prisma.validator<Prisma.GraphNodeSelect>()({
  id: true,
  name: true,
  description: true,
  updatedAt: true,
});

export const VERSION_ATTRIBUTES = Prisma.validator<Prisma.GraphVersionSelect>()(
  {
    id: true,
    createdAt: true,
    lockedAt: true,
  }
);

export const VIEW_ATTRIBUTES = Prisma.validator<Prisma.GraphViewSelect>()({
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  description: true,
});

export const NODE_ATTRIBUTES = Prisma.validator<Prisma.GraphNodeSelect>()({
  id: true,
  internalId: true,
  type: true,
  name: true,
  description: true,
  nullable: true,
  cardinality: true,
  updatedAt: true,
});

export const ROW_ATTRIBUTES = Prisma.validator<Prisma.RowSelect>()({
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
});
