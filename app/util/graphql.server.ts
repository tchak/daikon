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

import * as Bucket from '~/models/bucket';
import * as Record from '~/models/record';
import type { User } from '~/models/user';

type Context = { user: User };

const nonNull = <T extends GraphQLType>(t: T) => new GraphQLNonNull(t);
const list = <T extends GraphQLType>(t: T) => new GraphQLList(t);
const nonNullList = <T extends GraphQLType>(t: T) => nonNull(list(nonNull(t)));

const FieldType = new GraphQLObjectType<
  Record.FindOneData['data'] & { id: string },
  Context
>({
  name: 'Field',
  fields: {
    id: { type: nonNull(ID) },
    type: { type: nonNull(Str) },
    value: {
      type: Str,
      resolve(value) {
        value ? String(value) : null;
      },
    },
    updatedAt: { type: nonNull(DateTime) },
  },
});

const RecordType = new GraphQLObjectType<Record.FindOneData, Context>({
  name: 'Record',
  fields: {
    id: { type: nonNull(ID) },
    data: {
      type: nonNullList(FieldType),
      resolve({ data }) {
        return Object.entries(data).map(([id, field]) => ({ id, ...field }));
      },
    },
    createdAt: { type: nonNull(DateTime) },
    updatedAt: { type: nonNull(DateTime) },
  },
});

const BucketFullType = new GraphQLObjectType<Bucket.FindOneData, Context>({
  name: 'BucketFull',
  fields: {
    id: { type: nonNull(ID) },
    name: { type: nonNull(Str) },
    color: { type: nonNull(Str) },
    createdAt: { type: nonNull(DateTime) },
    updatedAt: { type: nonNull(DateTime) },
    records: {
      type: nonNullList(RecordType),
      resolve({ id }, _, context) {
        return Record.findMany({ bucketId: id, userId: context.user.id });
      },
    },
  },
});

const BucketType = new GraphQLObjectType<Bucket.FindManyData[0], Context>({
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
        type: nonNull(BucketFullType),
        args: {
          bucketId: { type: nonNull(ID) },
        },
        resolve(_, { bucketId }, context) {
          return Bucket.findOne({ bucketId, userId: context.user.id });
        },
      },
      listBuckets: {
        type: nonNullList(BucketType),
        args: {
          order: { type: Str },
        },
        resolve(_, args, context) {
          return Bucket.findMany({ userId: context.user.id });
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
