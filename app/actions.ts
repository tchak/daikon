import { pipe } from 'fp-ts/function';
import * as D from 'io-ts/Decoder';
import { UUID, BooleanFromString } from 'io-ts-types-experimental/Decoder';
import * as E from 'fp-ts/Either';

import {
  mutation,
  CreateBlocFieldDocument,
  CreateGraphDocument,
  CreateTextFieldDocument,
  DeleteFieldDocument,
  DeleteGraphDocument,
  DeleteViewDocument,
  SetFieldNameDocument,
  SetFieldHiddenDocument,
  DeleteRowsDocument,
  CreateRowDocument,
} from '~/urql.server';

export enum Action {
  CreateField = 'CreateField',
  CreateGraph = 'CreateGraph',
  DeleteField = 'DeleteField',
  DeleteGraph = 'DeleteGraph',
  DeleteView = 'DeleteView',
  HideField = 'HideField',
  RenameField = 'RenameField',
  RenameView = 'RenameView',
  CreateRow = 'CreateRow',
  DeleteRows = 'DeleteRows',
}

export async function processAction(request: Request) {
  const params = await parseBody(request);

  return pipe(
    actionD.decode(params),
    E.match(
      () => ({ error: 'Action unknown' }),
      ({ _action }) => {
        switch (_action) {
          case Action.CreateGraph:
            return parseInput(createGraphD, (input) =>
              mutation(CreateGraphDocument, { input })
            )(params);
          case Action.DeleteGraph:
            return parseInput(deleteGraphD, (input) =>
              mutation(DeleteGraphDocument, { input })
            )(params);
          case Action.DeleteView:
            return parseInput(deleteViewD, (input) =>
              mutation(DeleteViewDocument, { input })
            )(params);
          case Action.CreateField:
            return parseInput(createFieldD, ({ type, ...input }) => {
              if (type == 'text') {
                return mutation(CreateTextFieldDocument, { input });
              }
              return mutation(CreateBlocFieldDocument, { input });
            })(params);
          case Action.HideField:
            return parseInput(hideFieldD, (input) =>
              mutation(SetFieldHiddenDocument, { input })
            )(params);
          case Action.RenameField:
            return parseInput(renameFieldD, (input) =>
              mutation(SetFieldNameDocument, { input })
            )(params);
          case Action.DeleteField:
            return parseInput(deleteFieldD, (input) =>
              mutation(DeleteFieldDocument, { input })
            )(params);
          case Action.CreateRow:
            return parseInput(createRowD, (input) =>
              mutation(CreateRowDocument, { input })
            )(params);
          case Action.DeleteRows:
            return parseInput(deleteRowsD, (input) =>
              mutation(DeleteRowsDocument, { input })
            )(params);
          default:
            return { error: 'Action unknown' };
        }
      }
    )
  );
}

const actionD = D.struct({ _action: D.string });
const createGraphD = D.struct({ name: D.string });
const deleteGraphD = D.struct({ graphId: UUID });
const deleteViewD = D.struct({ viewId: UUID });

const createFieldD = D.struct({
  type: D.literal('text', 'bloc'),
  name: D.string,
  versionId: UUID,
  leftId: UUID,
});
const hideFieldD = D.struct({
  viewId: UUID,
  nodeId: UUID,
  hidden: BooleanFromString,
});
const renameFieldD = D.struct({
  versionId: UUID,
  nodeId: UUID,
  name: D.string,
});
const deleteFieldD = D.struct({ versionId: UUID, nodeId: UUID });

const createRowD = D.struct({ versionId: UUID });
const deleteRowsD = D.struct({ rowIds: D.array(UUID) });

function parseInput<T, G>(
  decoder: D.Decoder<unknown, T>,
  fn: (input: T) => G | { error: string }
): (params: unknown) => G | { error: string } {
  return (params) =>
    pipe(
      decoder.decode(params),
      E.match(() => ({ error: 'Invalid input' }), fn)
    );
}

async function parseBody(request: Request) {
  const params = new URLSearchParams(await request.text());
  const body = new Map<string, string | string[]>();
  for (const [key, value] of params) {
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (body.has(arrayKey)) {
        (body.get(arrayKey) as string[]).push(value);
      } else {
        body.set(arrayKey, [value]);
      }
    } else {
      body.set(key, value);
    }
  }
  return Object.fromEntries(body);
}
