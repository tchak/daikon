import { createClient } from '@urql/core';
import { executeExchange } from '@urql/exchange-execute';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { Schema } from 'zod';
import {
  GraphQLType,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID as ID,
  GraphQLString as Str,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { GraphQLDateTime as DateTime } from 'graphql-scalars';

import { findOne, findMany } from '~/models/bucket';

type Context = { userId: string };

const nonNull = <T extends GraphQLType>(t: T) => new GraphQLNonNull(t);
const list = <T extends GraphQLType>(t: T) => new GraphQLList(t);
const nonNullList = <T extends GraphQLType>(t: T) => nonNull(list(nonNull(t)));

const Bucket = new GraphQLObjectType<{ id: string; name: string }, Context>({
  name: 'Bucket',
  fields: {
    id: { type: nonNull(ID) },
    name: { type: nonNull(Str) },
    color: { type: nonNull(Str) },
    createdAt: { type: nonNull(DateTime) },
    updatedAt: { type: nonNull(DateTime) },
  },
});

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType<void, Context>({
    name: 'Query',
    fields: {
      getBucket: {
        type: nonNull(Bucket),
        args: {
          bucketId: { type: nonNull(ID) },
        },
        resolve(_, { bucketId }, context) {
          return findOne(bucketId, context.userId);
        },
      },
      listBuckets: {
        type: nonNullList(Bucket),
        args: {
          order: { type: Str },
        },
        resolve(_, args, context) {
          return findMany(context.userId);
        },
      },
    },
  }),
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
