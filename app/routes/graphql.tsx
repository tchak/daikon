/* eslint-disable react-hooks/rules-of-hooks */
import type { LoaderFunction, ActionFunction } from 'remix';
import { json, redirect } from 'remix';
import {
  shouldRenderGraphiQL,
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  Request as HelixRequest,
} from 'graphql-helix';
import { envelop, useLogger, useSchema, useTiming } from '@envelop/core';
import { useDepthLimit } from '@envelop/depth-limit';
import { GraphQLError } from 'graphql';

import { authenticator, User } from '~/util/auth.server';
import { schema } from '~/util/graphql.server';

const getEnveloped = envelop({
  plugins: [
    useSchema(schema),
    useLogger(),
    useTiming(),
    useDepthLimit({ maxDepth: 15 }),
  ],
});

async function remixToHelixRequest(request: Request): Promise<HelixRequest> {
  return {
    method: request.method,
    headers: request.headers,
    body:
      request.method.toLowerCase() == 'get'
        ? null
        : ((await request.json()) as object),
    query: Object.fromEntries(new URL(request.url).searchParams),
  };
}

async function processHelixRequest(request: HelixRequest, user: User | null) {
  if (shouldRenderGraphiQL(request)) {
    if (!user) {
      return redirect('/signin');
    }
    const html = renderGraphiQL({ endpoint: '/graphql' });
    return new Response(html, { headers: { 'content-type': 'text/html' } });
  } else {
    const { parse, validate, contextFactory, execute, schema } = getEnveloped({
      request,
      user,
    });
    const { operationName, query, variables } = getGraphQLParameters(request);
    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
      parse,
      validate,
      execute,
      contextFactory,
    });

    if (result.type == 'RESPONSE') {
      const headers = new Headers();
      for (const { name, value } of result.headers) {
        headers.append(name, value);
      }
      return json(result.payload, {
        status: result.status,
        headers,
      });
    } else {
      return json(
        {
          errors: [new GraphQLError(`Unsupported response`)],
        },
        { status: 400 }
      );
    }
  }
}

async function graphqlRequest(request: Request) {
  const user = await authenticator.isAuthenticated(request);
  return processHelixRequest(await remixToHelixRequest(request), user);
}

export const loader: LoaderFunction = ({ request }) => graphqlRequest(request);
export const action: ActionFunction = ({ request }) => graphqlRequest(request);
