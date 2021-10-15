import {
  mutation,
  CreateBlocFieldDocument,
  CreateGraphDocument,
  CreateTextFieldDocument,
  DeleteFieldDocument,
  DeleteGraphDocument,
  DeleteViewDocument,
  SetFieldNameDocument,
} from '~/urql.server';

export enum Action {
  CreateField = 'CreateField',
  CreateGraph = 'CreateGraph',
  DeleteField = 'DeleteField',
  DeleteGraph = 'DeleteGraph',
  DeleteRows = 'DeleteRows',
  DeleteView = 'DeleteView',
  HideField = 'HideField',
  RenameField = 'RenameField',
  RenameView = 'RenameView',
}

export async function processAction(request: Request) {
  const params = new URLSearchParams(await request.text());

  switch (params.get('_action')) {
    case Action.CreateGraph:
      return mutation(CreateGraphDocument, {
        input: {
          name: params.get('name')!,
        },
      });
    case Action.DeleteGraph:
      return mutation(DeleteGraphDocument, {
        input: {
          graphId: params.get('id')!,
        },
      });
    case Action.RenameField:
      return mutation(SetFieldNameDocument, {
        input: {
          versionId: params.get('versionId')!,
          nodeId: params.get('nodeId')!,
          name: params.get('name'),
        },
      });
    case Action.DeleteField:
      return mutation(DeleteFieldDocument, {
        input: {
          versionId: params.get('versionId')!,
          nodeId: params.get('nodeId')!,
        },
      });
    case Action.DeleteView:
      return mutation(DeleteViewDocument, {
        input: {
          viewId: params.get('viewId')!,
        },
      });
    case Action.CreateField:
      switch (params.get('type')) {
        case 'bloc':
          return mutation(CreateBlocFieldDocument, {
            input: {
              versionId: params.get('versionId')!,
              leftId: params.get('leftId')!,
              name: params.get('name')!,
            },
          });
        default:
          return mutation(CreateTextFieldDocument, {
            input: {
              versionId: params.get('versionId')!,
              leftId: params.get('leftId')!,
              name: params.get('name')!,
            },
          });
      }
  }
}
