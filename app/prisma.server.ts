import type { TaskEither } from 'fp-ts/TaskEither';
import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

const logThreshold = 30;

function getClient() {
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
  client.$on('query', (e) => {
    if (e.duration < logThreshold) return;

    const color =
      e.duration < 30
        ? 'green'
        : e.duration < 50
        ? 'blue'
        : e.duration < 80
        ? 'yellow'
        : e.duration < 100
        ? 'redBright'
        : 'red';
    const dur = chalk[color](`${e.duration}ms`);
    console.log(`prisma:query - ${dur} - ${e.query}`);
  });
  return client;
}

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  __prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;
const prisma = global.__prisma ?? getClient();

if (process.env.NODE_ENV == 'development') {
  global.__prisma = prisma;
}

export const PrismaError = 'PrismaError' as const;
export type PrismaError = typeof PrismaError;
export const NotFoundError = 'NotFoundError' as const;
export type NotFoundError = typeof NotFoundError;

export type PrismaTask<Data> = TaskEither<PrismaError | NotFoundError, Data>;

export const prismaQuery = <Data>(
  tx: (prisma: PrismaClient) => Promise<Data>
): PrismaTask<Data> =>
  pipe(
    TE.tryCatch(
      () => tx(prisma),
      (e) => {
        if ((e as { name: string }).name == 'NotFoundError') {
          return NotFoundError;
        }
        return PrismaError;
      }
    )
  );
