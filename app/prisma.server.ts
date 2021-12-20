import type { TaskEither } from 'fp-ts/TaskEither';
import { PrismaClient, Prisma, EventType } from '@prisma/client';
import chalk from 'chalk';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

export { EventType };

type PrismaError =
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientValidationError
  | Prisma.PrismaClientRustPanicError;
type NotFoundError = Error & { name: 'NotFoundError' };

export type PrismaTask<Data> = TaskEither<PrismaError | NotFoundError, Data>;
export type PrismaClientTransaction = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

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

export function isNotFoundError(e: Error): e is NotFoundError {
  return e.name == 'NotFoundError';
}

export function runQuery<Data>(
  query: (db: PrismaClient) => Promise<Data>
): PrismaTask<Data> {
  return pipe(
    TE.tryCatch(
      () => query(prisma),
      (error) => castError(error as Error)
    )
  );
}

export function runCommand<Data>(
  command: (db: PrismaClientTransaction) => Promise<Data>
): PrismaTask<Data> {
  return pipe(
    TE.tryCatch(
      () => prisma.$transaction(command),
      (error) => castError(error as Error)
    )
  );
}

function castError(error: Error): PrismaError | NotFoundError {
  if (isNotFoundError(error)) {
    const type = chalk['red'](`${error.message}`);
    console.log(`prisma:notfound - ${type}`);
    return error;
  }
  return error as PrismaError;
}
