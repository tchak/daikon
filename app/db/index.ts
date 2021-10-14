export { NodeType, NodeCardinality } from '@prisma/client';

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
  required: true,
  cardinality: true,
  updatedAt: true,
};

export * from './graph';
export * from './version';
export * from './field';
export * from './view';
