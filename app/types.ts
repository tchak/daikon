import type { FindGraphQuery } from '~/urql.server';

export type Graph = NonNullable<FindGraphQuery['graph']>;
export type View = { id: string; name: string };
export type Edge = Graph['version']['edges'][0];
export type BlockEdge = Graph['version']['blockEdges'][0];
export type Field = Edge['right'] & { hidden: boolean };
export type Breadcrumb = {
  readonly name: string;
  readonly parent?: { readonly id: string | null; readonly fieldId: string };
};
