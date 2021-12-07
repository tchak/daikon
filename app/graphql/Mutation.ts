import { Resolver, Mutation, Arg } from 'type-graphql';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import formatISO from 'date-fns/formatISO';

import {
  createField,
  createGraph,
  createRow,
  createVersion,
  createView,
  deleteField,
  deleteGraph,
  deleteRows,
  deleteVersion,
  deleteView,
  EdgeData,
  FieldData,
  GraphData,
  lockVersion,
  moveField,
  updateCell,
  NodeType,
  RowData,
  unlockVersion,
  updateView,
  updateField,
  updateViewField,
  VersionData,
  ViewData,
} from '~/models';

import { Graph, CreateGraphInput, DeleteGraphInput } from './Graph';
import {
  CreateFieldInput,
  DeleteFieldInput,
  Edge,
  Field,
  MoveFieldInput,
  SetFieldDescriptionInput,
  SetFieldHiddenInput,
  SetFieldNameInput,
  SetFieldNullableInput,
} from './Field';
import {
  Row,
  CreateRowInput,
  DeleteRowsInput,
  UpdateTextCellInput,
  UpdateFloatCellInput,
  UpdateIntCellInput,
  UpdateBooleanCellInput,
  UpdateDateTimeCellInput,
  UpdateDateCellInput,
} from './Row';
import {
  Version,
  CreateVersionInput,
  LockVersionInput,
  UnlockVersionInput,
  DeleteVersionInput,
} from './Version';
import {
  View,
  CreateViewInput,
  SetViewNameInput,
  DeleteViewInput,
} from './View';

@Resolver()
export class MutationResolver {
  @Mutation(() => Graph)
  createGraph(
    @Arg('input', () => CreateGraphInput) input: CreateGraphInput
  ): Promise<GraphData> {
    return pipe(createGraph(input.name), throwError())();
  }

  @Mutation(() => Version)
  createVersion(
    @Arg('input', () => CreateVersionInput) input: CreateVersionInput
  ): Promise<VersionData> {
    return pipe(createVersion(input), throwError())();
  }

  @Mutation(() => Version)
  lockVersion(
    @Arg('input', () => LockVersionInput) input: LockVersionInput
  ): Promise<VersionData> {
    return pipe(lockVersion(input), throwError())();
  }

  @Mutation(() => Version)
  unlockVersion(
    @Arg('input', () => UnlockVersionInput) input: UnlockVersionInput
  ): Promise<VersionData> {
    return pipe(unlockVersion(input), throwError())();
  }

  @Mutation(() => View)
  createView(
    @Arg('input', () => CreateViewInput) input: CreateViewInput
  ): Promise<ViewData> {
    return pipe(createView(input), throwError())();
  }

  @Mutation(() => Field)
  setViewName(
    @Arg('input', () => SetViewNameInput) input: SetViewNameInput
  ): Promise<ViewData> {
    return pipe(updateView(input), throwError())();
  }

  @Mutation(() => View)
  deleteView(
    @Arg('input', () => DeleteViewInput) input: DeleteViewInput
  ): Promise<ViewData> {
    return pipe(deleteView(input), throwError())();
  }

  @Mutation(() => Edge)
  createTextField(
    @Arg('input', () => CreateFieldInput) input: CreateFieldInput
  ): Promise<EdgeData> {
    return pipe(createField(NodeType.TEXT, input), throwError())();
  }

  @Mutation(() => Edge)
  createBooleanField(
    @Arg('input', () => CreateFieldInput) input: CreateFieldInput
  ): Promise<EdgeData> {
    return pipe(createField(NodeType.BOOLEAN, input), throwError())();
  }

  @Mutation(() => Edge)
  createNumberField(
    @Arg('input', () => CreateFieldInput) input: CreateFieldInput
  ): Promise<EdgeData> {
    return pipe(createField(NodeType.NUMBER, input), throwError())();
  }

  @Mutation(() => Edge)
  createDateField(
    @Arg('input', () => CreateFieldInput) input: CreateFieldInput
  ): Promise<EdgeData> {
    return pipe(createField(NodeType.DATE, input), throwError())();
  }

  @Mutation(() => Edge)
  createDateTimeField(
    @Arg('input', () => CreateFieldInput) input: CreateFieldInput
  ): Promise<EdgeData> {
    return pipe(createField(NodeType.DATE_TIME, input), throwError())();
  }

  @Mutation(() => Edge)
  createBlockField(
    @Arg('input', () => CreateFieldInput) input: CreateFieldInput
  ): Promise<EdgeData> {
    return pipe(createField(NodeType.BLOCK, input), throwError())();
  }

  @Mutation(() => Edge)
  createFileField(
    @Arg('input', () => CreateFieldInput) input: CreateFieldInput
  ): Promise<EdgeData> {
    return pipe(createField(NodeType.FILE, input), throwError())();
  }

  @Mutation(() => Graph)
  deleteGraph(
    @Arg('input', () => DeleteGraphInput) input: DeleteGraphInput
  ): Promise<Graph> {
    return pipe(deleteGraph(input), throwError())();
  }

  @Mutation(() => Version)
  deleteVersion(
    @Arg('input', () => DeleteVersionInput) input: DeleteVersionInput
  ): Promise<Version> {
    return pipe(deleteVersion(input), throwError())();
  }

  @Mutation(() => Field)
  deleteField(
    @Arg('input', () => DeleteFieldInput) input: DeleteFieldInput
  ): Promise<FieldData> {
    return pipe(deleteField(input), throwError())();
  }

  @Mutation(() => Field)
  setFieldName(
    @Arg('input', () => SetFieldNameInput) input: SetFieldNameInput
  ): Promise<FieldData> {
    return pipe(updateField(input), throwError())();
  }

  @Mutation(() => Field)
  setFieldDescription(
    @Arg('input', () => SetFieldDescriptionInput)
    input: SetFieldDescriptionInput
  ): Promise<FieldData> {
    return pipe(updateField(input), throwError())();
  }

  @Mutation(() => Field)
  setFieldNullable(
    @Arg('input', () => SetFieldNullableInput)
    input: SetFieldNullableInput
  ): Promise<FieldData> {
    return pipe(updateField(input), throwError())();
  }

  @Mutation(() => Edge)
  moveField(
    @Arg('input', () => MoveFieldInput)
    input: MoveFieldInput
  ): Promise<EdgeData> {
    return pipe(moveField(input), throwError())();
  }

  @Mutation(() => View)
  setFieldHidden(
    @Arg('input', () => SetFieldHiddenInput)
    input: SetFieldHiddenInput
  ): Promise<ViewData> {
    return pipe(updateViewField(input), throwError())();
  }

  @Mutation(() => Row)
  createRow(
    @Arg('input', () => CreateRowInput)
    input: CreateRowInput
  ): Promise<RowData> {
    return pipe(createRow(input), throwError())();
  }

  @Mutation(() => [Row])
  deleteRows(
    @Arg('input', () => DeleteRowsInput)
    input: DeleteRowsInput
  ): Promise<RowData[]> {
    return pipe(deleteRows(input), throwError())();
  }

  @Mutation(() => Row)
  updateTextCell(
    @Arg('input', () => UpdateTextCellInput)
    input: UpdateTextCellInput
  ): Promise<RowData> {
    return pipe(updateCell(input), throwError())();
  }

  @Mutation(() => Row)
  updateBooleanCell(
    @Arg('input', () => UpdateBooleanCellInput)
    input: UpdateBooleanCellInput
  ): Promise<RowData> {
    return pipe(updateCell(input), throwError())();
  }

  @Mutation(() => Row)
  updateIntCell(
    @Arg('input', () => UpdateIntCellInput)
    input: UpdateIntCellInput
  ): Promise<RowData> {
    return pipe(updateCell(input), throwError())();
  }

  @Mutation(() => Row)
  updateFloatCell(
    @Arg('input', () => UpdateFloatCellInput)
    input: UpdateFloatCellInput
  ): Promise<RowData> {
    return pipe(updateCell(input), throwError())();
  }

  @Mutation(() => Row)
  updateDateTimeCell(
    @Arg('input', () => UpdateDateTimeCellInput)
    input: UpdateDateTimeCellInput
  ): Promise<RowData> {
    return pipe(
      updateCell({
        ...input,
        value: formatISO(input.value, { representation: 'complete' }),
      }),
      throwError()
    )();
  }

  @Mutation(() => Row)
  updateDateCell(
    @Arg('input', () => UpdateDateCellInput)
    input: UpdateDateCellInput
  ): Promise<RowData> {
    return pipe(
      updateCell({
        ...input,
        value: formatISO(input.value, { representation: 'date' }),
      }),
      throwError()
    )();
  }
}

const throwError = <E, A>() =>
  TE.getOrElse<E, A>((error) => {
    throw error;
  });
