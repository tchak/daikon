import 'dotenv/config';
import { createClient, Client } from '@urql/core';
import { executeExchange } from '@urql/exchange-execute';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

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

export async function query<Result, Variables>(
  document: DocumentNode<Result, Variables>,
  variables?: Variables
): Promise<Result> {
  const { data, error } = await client
    .query(document, variables as any)
    .toPromise();

  if (data) {
    return data;
  }
  throw error;
}

export async function mutation<Result, Variables>(
  document: DocumentNode<Result, Variables>,
  variables?: Variables
): Promise<Result> {
  const { data, error } = await client
    .mutation(document, variables as any)
    .toPromise();

  if (data) {
    return data;
  }
  throw error;
}
