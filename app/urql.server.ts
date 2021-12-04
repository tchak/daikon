import { createClient, Client } from '@urql/core';
import { executeExchange } from '@urql/exchange-execute';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { Schema } from 'zod';

import { schema } from '~/graphql.server';
export * from '~/graphql/queries';

// add urql to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  __client: Client;
}

// Prevent multiple instances of URQL Client in development
declare const global: CustomNodeJsGlobal;
export const client =
  global.__client ??
  createClient({
    url: '/__graphql__',
    exchanges: [executeExchange({ schema })],
  });

if (process.env.NODE_ENV === 'development') {
  global.__client = client;
}

export async function query<QueryResult, Variables>(
  document: DocumentNode<QueryResult, Variables>,
  variables?: Variables
): Promise<QueryResult> {
  const { data, error } = await client
    .query(document, variables as unknown as object)
    .toPromise();

  if (data) {
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
  const { data, error } = await client
    .mutation(document, { input })
    .toPromise();

  if (data) {
    return data;
  }
  throw error;
}
