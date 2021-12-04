import type { TaskEither } from 'fp-ts/TaskEither';
import { PrismaClient } from '@prisma/client';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

// add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  __prisma: PrismaClient;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;
const prisma = global.__prisma ?? new PrismaClient();

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
