import { FindGraphQuery } from '~/urql.server';

export type Graph = NonNullable<FindGraphQuery['graph']>;
export type View = { id: string; name: string };
export type Edge = Graph['version']['edges'][0];
export type Field = Edge['right'] & { hidden: boolean };
