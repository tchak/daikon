import 'reflect-metadata';
import { buildSchemaSync } from 'type-graphql';
import { GraphQLSchema } from 'graphql';

import {
  QueryResolver,
  GraphResolver,
  VersionResolver,
  ViewResolver,
  MutationResolver,
} from '~/graphql';

// add schema to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  __schema: GraphQLSchema;
}

// Prevent multiple instances of GraphQLSchema in development
declare const global: CustomNodeJsGlobal;
export const schema =
  global.__schema ??
  buildSchemaSync({
    resolvers: [
      GraphResolver,
      VersionResolver,
      ViewResolver,
      QueryResolver,
      MutationResolver,
    ],
    emitSchemaFile: { path: './app/graphql/schema.graphql' },
    dateScalarMode: 'isoDate',
  });

if (process.env.NODE_ENV === 'development') {
  global.__schema = schema;
}
