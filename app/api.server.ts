import 'dotenv/config';
import { createClient, fetchExchange } from '@urql/core';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

export * from '~/graphql-operations';

const API_URL = process.env['API_URL']!;
const API_TOKEN = process.env['API_TOKEN'];

export const client = createClient({
  url: API_URL,
  exchanges: [fetchExchange],
  preferGetMethod: true,
  fetchOptions: {
    // headers: {
    //   authorization: `Bearer ${API_TOKEN}`,
    // },
  },
});

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
