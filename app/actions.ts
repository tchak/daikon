import { match } from 'ts-pattern';
import { z } from 'zod';
import { parse } from 'qs';

import {
  mutation,
  CreateBlockFieldDocument,
  CreateGraphDocument,
  CreateTextFieldDocument,
  CreateBooleanFieldDocument,
  CreateNumberFieldDocument,
  DeleteFieldDocument,
  DeleteGraphDocument,
  DeleteViewDocument,
  SetFieldNameDocument,
  SetFieldHiddenDocument,
  DeleteRowsDocument,
  CreateRowDocument,
  SetViewNameDocument,
  UpdateTextCellDocument,
  UpdateBooleanCellDocument,
  UpdateFloatCellDocument,
  UpdateIntCellDocument,
  FieldType,
} from '~/urql.server';

export enum ActionType {
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
  UpdateCell = 'UpdateCell',
}

const Action = z.object({
  actionType: z.nativeEnum(ActionType),
  type: z.nativeEnum(FieldType).optional(),
  decimal: z.boolean().optional(),
});
const CreateGraph = z.object({ name: z.string().nonempty() });
const DeleteGraph = z.object({ graphId: z.string().uuid() });
const DeleteView = z.object({ viewId: z.string().uuid() });
const CreateField = z.object({
  name: z.string().nonempty(),
  versionId: z.string().uuid(),
  leftId: z.string().uuid(),
});
const HideField = z.object({
  viewId: z.string().uuid(),
  nodeId: z.string().uuid(),
  hidden: z.string().transform((hidden) => hidden == 'true'),
});
const RenameField = z.object({
  versionId: z.string().uuid(),
  nodeId: z.string().uuid(),
  name: z.string().nonempty(),
});
const RenameView = z.object({
  viewId: z.string().uuid(),
  name: z.string().nonempty(),
});
const DeleteField = z.object({
  versionId: z.string().uuid(),
  nodeId: z.string().uuid(),
});
const CreateRow = z.object({
  versionId: z.string().uuid(),
  parent: z
    .object({
      id: z.string().uuid(),
      fieldId: z.string().uuid(),
    })
    .optional(),
});
const DeleteRows = z.object({ rowIds: z.array(z.string().uuid()) });
const UpdateTextCell = z.object({
  rowId: z.string().uuid(),
  fieldId: z.string().uuid(),
  value: z.string(),
});
const UpdateIntCell = z.object({
  rowId: z.string().uuid(),
  fieldId: z.string().uuid(),
  value: z.string().transform((value) => parseInt(value, 10)),
});
const UpdateFloatCell = z.object({
  rowId: z.string().uuid(),
  fieldId: z.string().uuid(),
  value: z.string().transform((value) => parseFloat(value)),
});
const UpdateBooleanCell = z.object({
  rowId: z.string().uuid(),
  fieldId: z.string().uuid(),
  value: z.string().transform((checked) => checked == 'true'),
});

export async function processAction(request: Request) {
  // const user = await authenticator.isAuthenticated(request, {
  //   failureRedirect: '/signin',
  // });
  const body = await parseBody(request);

  return match(Action.parse(body))
    .with({ actionType: ActionType.CreateGraph }, () =>
      mutation(CreateGraphDocument, CreateGraph, body)
    )
    .with({ actionType: ActionType.DeleteGraph }, () =>
      mutation(DeleteGraphDocument, DeleteGraph, body)
    )
    .with({ actionType: ActionType.DeleteView }, () =>
      mutation(DeleteViewDocument, DeleteView, body)
    )
    .with({ actionType: ActionType.CreateField, type: FieldType.Text }, () =>
      mutation(CreateTextFieldDocument, CreateField, body)
    )
    .with({ actionType: ActionType.CreateField, type: FieldType.Boolean }, () =>
      mutation(CreateBooleanFieldDocument, CreateField, body)
    )
    .with({ actionType: ActionType.CreateField, type: FieldType.Number }, () =>
      mutation(CreateNumberFieldDocument, CreateField, body)
    )
    .with({ actionType: ActionType.CreateField, type: FieldType.Block }, () =>
      mutation(CreateBlockFieldDocument, CreateField, body)
    )
    .with({ actionType: ActionType.RenameField }, () =>
      mutation(SetFieldNameDocument, RenameField, body)
    )
    .with({ actionType: ActionType.HideField }, () =>
      mutation(SetFieldHiddenDocument, HideField, body)
    )
    .with({ actionType: ActionType.DeleteField }, () =>
      mutation(DeleteFieldDocument, DeleteField, body)
    )
    .with({ actionType: ActionType.CreateRow }, () =>
      mutation(CreateRowDocument, CreateRow, body)
    )
    .with({ actionType: ActionType.DeleteRows }, () =>
      mutation(DeleteRowsDocument, DeleteRows, body)
    )
    .with({ actionType: ActionType.RenameView }, () =>
      mutation(SetViewNameDocument, RenameView, body)
    )
    .with({ actionType: ActionType.UpdateCell, type: FieldType.Text }, () =>
      mutation(UpdateTextCellDocument, UpdateTextCell, body)
    )
    .with({ actionType: ActionType.UpdateCell, type: FieldType.Boolean }, () =>
      mutation(UpdateBooleanCellDocument, UpdateBooleanCell, body)
    )
    .with(
      {
        actionType: ActionType.UpdateCell,
        type: FieldType.Number,
        decimal: true,
      },
      () => mutation(UpdateFloatCellDocument, UpdateFloatCell, body)
    )
    .with({ actionType: ActionType.UpdateCell, type: FieldType.Number }, () =>
      mutation(UpdateIntCellDocument, UpdateIntCell, body)
    )
    .otherwise((action) => {
      throw `Unknown action ${JSON.stringify(action, null, 2)}`;
    });
}

async function parseBody(request: Request) {
  const body = await request.text();
  return parse(body, { plainObjects: true, charsetSentinel: true });
}
