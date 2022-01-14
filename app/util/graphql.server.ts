import 'reflect-metadata';
import { buildSchemaSync, Query, Resolver } from 'type-graphql';
import { createClient } from '@urql/core';
import { executeExchange } from '@urql/exchange-execute';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { Schema } from 'zod';

// export * from '~/graphql/queries';

// import {
//   QueryResolver,
//   GraphResolver,
//   VersionResolver,
//   ViewResolver,
//   MutationResolver,
// } from '~/graphql';

@Resolver()
export class QueryResolver {
  @Query(() => String)
  async hello(): Promise<string> {
    return 'Hello World';
  }
}

export const schema = buildSchemaSync({
  resolvers: [QueryResolver],
  emitSchemaFile: { path: 'schema.graphql' },
  dateScalarMode: 'isoDate',
});

function getClient() {
  return createClient({
    url: '/graphql',
    exchanges: [executeExchange({ schema })],
  });
}

export async function query<QueryResult, Variables>(
  document: DocumentNode<QueryResult, Variables>,
  variables?: Variables
): Promise<QueryResult> {
  const { data, error } = await getClient()
    .query(document, variables as unknown as object)
    .toPromise();

  if (data && !error) {
    return data;
  }
  throw error;
}

export async function mutation<MutationResult, Input, Def>(
  document: DocumentNode<MutationResult, { input: Input }>,
  schema: Schema<Input, Def, unknown>,
  params: unknown
): Promise<MutationResult> {
  const input = schema.parse(params);
  const { data, error } = await getClient()
    .mutation(document, { input })
    .toPromise();

  if (data && !error) {
    return data;
  }
  throw error;
}
