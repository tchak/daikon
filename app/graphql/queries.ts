import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: any;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type BlockField = Field & {
  readonly cardinality: Cardinality;
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly nullable: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type BooleanCell = Cell & {
  readonly booleanValue: Scalars['Boolean'];
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type BooleanField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly nullable: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export enum Cardinality {
  Many = 'MANY',
  One = 'ONE'
}

export type Cell = {
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type Change = {
  readonly nodeId: Scalars['ID'];
};

export type CreateFieldChange = Change & {
  readonly nodeId: Scalars['ID'];
};

export type CreateFieldInput = {
  readonly description?: InputMaybe<Scalars['String']>;
  readonly leftId: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly position?: InputMaybe<Scalars['Int']>;
  readonly versionId: Scalars['ID'];
};

export type CreateGraphInput = {
  readonly name: Scalars['String'];
};

export type CreateRowInput = {
  readonly parent?: InputMaybe<ParentInput>;
  readonly versionId: Scalars['ID'];
};

export type CreateVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type CreateViewInput = {
  readonly graphId: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type DateCell = Cell & {
  readonly dateValue?: Maybe<Scalars['Date']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type DateField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly nullable: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type DateTimeCell = Cell & {
  readonly dateTimeValue?: Maybe<Scalars['DateTime']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type DateTimeField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly nullable: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type DeleteFieldChange = Change & {
  readonly nodeId: Scalars['ID'];
};

export type DeleteFieldInput = {
  readonly nodeId: Scalars['ID'];
  readonly versionId: Scalars['ID'];
};

export type DeleteGraphInput = {
  readonly graphId: Scalars['ID'];
};

export type DeleteRowsInput = {
  readonly rowIds: ReadonlyArray<Scalars['ID']>;
};

export type DeleteVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type DeleteViewInput = {
  readonly viewId: Scalars['ID'];
};

export type Edge = {
  readonly id: Scalars['ID'];
  readonly left: Field;
  readonly position: Scalars['Int'];
  readonly right: Field;
};

export type Field = {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly updatedAt: Scalars['DateTime'];
};

export type FieldDescriptionChange = Change & {
  readonly from: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['String'];
};

export type FieldNameChange = Change & {
  readonly from: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['String'];
};

export type FieldNullableChange = Change & {
  readonly from: Scalars['Boolean'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['Boolean'];
};

export type FieldParentChange = Change & {
  readonly from: Scalars['ID'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['ID'];
};

export type FieldPositionChange = Change & {
  readonly from: Scalars['Int'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['Int'];
};

export enum FieldType {
  Block = 'BLOCK',
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  DateTime = 'DATE_TIME',
  File = 'FILE',
  Number = 'NUMBER',
  Root = 'ROOT',
  Select = 'SELECT',
  Text = 'TEXT'
}

export type FileField = Field & {
  readonly cardinality: Cardinality;
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly nullable: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type FloatCell = Cell & {
  readonly floatValue?: Maybe<Scalars['Float']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type Graph = {
  readonly color: Scalars['String'];
  readonly createdAt: Scalars['DateTime'];
  readonly id: Scalars['ID'];
  readonly root: RootField;
  readonly rows: ReadonlyArray<Row>;
  readonly version: Version;
  readonly versions: ReadonlyArray<Version>;
  readonly view: View;
  readonly views: ReadonlyArray<View>;
};


export type GraphRowsArgs = {
  parentFieldId?: InputMaybe<Scalars['ID']>;
  parentId?: InputMaybe<Scalars['ID']>;
};

export type IntCell = Cell & {
  readonly id: Scalars['ID'];
  readonly intValue?: Maybe<Scalars['Int']>;
  readonly name: Scalars['String'];
};

export type LockVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type MoveFieldInput = {
  readonly leftId: Scalars['ID'];
  readonly nodeId: Scalars['ID'];
  readonly position: Scalars['Int'];
  readonly versionId: Scalars['ID'];
};

export type Mutation = {
  readonly createBlockField: Edge;
  readonly createBooleanField: Edge;
  readonly createDateField: Edge;
  readonly createDateTimeField: Edge;
  readonly createFileField: Edge;
  readonly createGraph: Graph;
  readonly createNumberField: Edge;
  readonly createRow: Row;
  readonly createTextField: Edge;
  readonly createVersion: Version;
  readonly createView: View;
  readonly deleteField: Field;
  readonly deleteGraph: Graph;
  readonly deleteRows: ReadonlyArray<Row>;
  readonly deleteVersion: Version;
  readonly deleteView: View;
  readonly lockVersion: Version;
  readonly moveField: Edge;
  readonly setFieldDescription: Field;
  readonly setFieldHidden: View;
  readonly setFieldName: Field;
  readonly setFieldNullable: Field;
  readonly setViewName: Field;
  readonly unlockVersion: Version;
  readonly updateBooleanCell: Row;
  readonly updateDateCell: Row;
  readonly updateDateTimeCell: Row;
  readonly updateFloatCell: Row;
  readonly updateIntCell: Row;
  readonly updateTextCell: Row;
};


export type MutationCreateBlockFieldArgs = {
  input: CreateFieldInput;
};


export type MutationCreateBooleanFieldArgs = {
  input: CreateFieldInput;
};


export type MutationCreateDateFieldArgs = {
  input: CreateFieldInput;
};


export type MutationCreateDateTimeFieldArgs = {
  input: CreateFieldInput;
};


export type MutationCreateFileFieldArgs = {
  input: CreateFieldInput;
};


export type MutationCreateGraphArgs = {
  input: CreateGraphInput;
};


export type MutationCreateNumberFieldArgs = {
  input: CreateFieldInput;
};


export type MutationCreateRowArgs = {
  input: CreateRowInput;
};


export type MutationCreateTextFieldArgs = {
  input: CreateFieldInput;
};


export type MutationCreateVersionArgs = {
  input: CreateVersionInput;
};


export type MutationCreateViewArgs = {
  input: CreateViewInput;
};


export type MutationDeleteFieldArgs = {
  input: DeleteFieldInput;
};


export type MutationDeleteGraphArgs = {
  input: DeleteGraphInput;
};


export type MutationDeleteRowsArgs = {
  input: DeleteRowsInput;
};


export type MutationDeleteVersionArgs = {
  input: DeleteVersionInput;
};


export type MutationDeleteViewArgs = {
  input: DeleteViewInput;
};


export type MutationLockVersionArgs = {
  input: LockVersionInput;
};


export type MutationMoveFieldArgs = {
  input: MoveFieldInput;
};


export type MutationSetFieldDescriptionArgs = {
  input: SetFieldDescriptionInput;
};


export type MutationSetFieldHiddenArgs = {
  input: SetFieldHiddenInput;
};


export type MutationSetFieldNameArgs = {
  input: SetFieldNameInput;
};


export type MutationSetFieldNullableArgs = {
  input: SetFieldNullableInput;
};


export type MutationSetViewNameArgs = {
  input: SetViewNameInput;
};


export type MutationUnlockVersionArgs = {
  input: UnlockVersionInput;
};


export type MutationUpdateBooleanCellArgs = {
  input: UpdateBooleanCellInput;
};


export type MutationUpdateDateCellArgs = {
  input: UpdateDateCellInput;
};


export type MutationUpdateDateTimeCellArgs = {
  input: UpdateDateTimeCellInput;
};


export type MutationUpdateFloatCellArgs = {
  input: UpdateFloatCellInput;
};


export type MutationUpdateIntCellArgs = {
  input: UpdateIntCellInput;
};


export type MutationUpdateTextCellArgs = {
  input: UpdateTextCellInput;
};

export type NumberField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly nullable: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type ParentInput = {
  readonly fieldId: Scalars['ID'];
  readonly id: Scalars['ID'];
};

export type Query = {
  readonly graph?: Maybe<Graph>;
  readonly graphs: ReadonlyArray<Graph>;
  readonly version?: Maybe<Version>;
  readonly view?: Maybe<View>;
};


export type QueryGraphArgs = {
  graphId: Scalars['ID'];
};


export type QueryVersionArgs = {
  versionId: Scalars['ID'];
};


export type QueryViewArgs = {
  viewId: Scalars['ID'];
};

export type RootField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly updatedAt: Scalars['DateTime'];
};

export type Row = {
  readonly cells: ReadonlyArray<Cell>;
  readonly createdAt: Scalars['DateTime'];
  readonly id: Scalars['ID'];
  readonly updatedAt: Scalars['DateTime'];
};

export type SetFieldDescriptionInput = {
  readonly description: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly versionId: Scalars['ID'];
};

export type SetFieldHiddenInput = {
  readonly hidden: Scalars['Boolean'];
  readonly nodeId: Scalars['ID'];
  readonly viewId: Scalars['ID'];
};

export type SetFieldNameInput = {
  readonly name: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly versionId: Scalars['ID'];
};

export type SetFieldNullableInput = {
  readonly nodeId: Scalars['ID'];
  readonly nullable: Scalars['Boolean'];
  readonly versionId: Scalars['ID'];
};

export type SetViewNameInput = {
  readonly name: Scalars['String'];
  readonly viewId: Scalars['ID'];
};

export type TextCell = Cell & {
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly textValue?: Maybe<Scalars['String']>;
};

export type TextField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly nullable: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type UnlockVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type UpdateBooleanCellInput = {
  readonly fieldId: Scalars['ID'];
  readonly rowId: Scalars['ID'];
  readonly value: Scalars['Boolean'];
};

export type UpdateDateCellInput = {
  readonly fieldId: Scalars['ID'];
  readonly rowId: Scalars['ID'];
  readonly value: Scalars['Date'];
};

export type UpdateDateTimeCellInput = {
  readonly fieldId: Scalars['ID'];
  readonly rowId: Scalars['ID'];
  readonly value: Scalars['DateTime'];
};

export type UpdateFloatCellInput = {
  readonly fieldId: Scalars['ID'];
  readonly rowId: Scalars['ID'];
  readonly value: Scalars['Float'];
};

export type UpdateIntCellInput = {
  readonly fieldId: Scalars['ID'];
  readonly rowId: Scalars['ID'];
  readonly value: Scalars['Int'];
};

export type UpdateTextCellInput = {
  readonly fieldId: Scalars['ID'];
  readonly rowId: Scalars['ID'];
  readonly value: Scalars['String'];
};

export type Version = {
  readonly createdAt: Scalars['DateTime'];
  readonly diff: ReadonlyArray<Change>;
  readonly edges: ReadonlyArray<Edge>;
  readonly id: Scalars['ID'];
  readonly lockedAt?: Maybe<Scalars['DateTime']>;
  readonly rows: ReadonlyArray<Row>;
};


export type VersionDiffArgs = {
  versionId: Scalars['ID'];
};


export type VersionEdgesArgs = {
  leftId?: InputMaybe<Scalars['ID']>;
  type?: InputMaybe<FieldType>;
};


export type VersionRowsArgs = {
  parentFieldId?: InputMaybe<Scalars['ID']>;
  parentId?: InputMaybe<Scalars['ID']>;
};

export type View = {
  readonly createdAt: Scalars['DateTime'];
  readonly description?: Maybe<Scalars['String']>;
  readonly edges: ReadonlyArray<Edge>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly updatedAt: Scalars['DateTime'];
};


export type ViewEdgesArgs = {
  leftId?: InputMaybe<Scalars['ID']>;
  type?: InputMaybe<FieldType>;
};

export type FindGraphsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindGraphsQuery = { readonly graphs: ReadonlyArray<{ readonly id: string, readonly color: string, readonly root: { readonly id: string, readonly name: string } }> };

export type FindGraphQueryVariables = Exact<{
  graphId: Scalars['ID'];
  parentFieldId?: InputMaybe<Scalars['ID']>;
  parentId?: InputMaybe<Scalars['ID']>;
}>;


export type FindGraphQuery = { readonly graph?: { readonly id: string, readonly createdAt: any, readonly color: string, readonly root: { readonly id: string, readonly name: string }, readonly view: { readonly id: string, readonly name: string, readonly edges: ReadonlyArray<{ readonly id: string }> }, readonly version: { readonly id: string, readonly lockedAt?: any | null | undefined, readonly edges: ReadonlyArray<{ readonly id: string, readonly left: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string }, readonly right: { readonly __typename: 'BlockField', readonly id: string, readonly name: string } | { readonly __typename: 'BooleanField', readonly id: string, readonly name: string } | { readonly __typename: 'DateField', readonly id: string, readonly name: string } | { readonly __typename: 'DateTimeField', readonly id: string, readonly name: string } | { readonly __typename: 'FileField', readonly id: string, readonly name: string } | { readonly __typename: 'NumberField', readonly id: string, readonly name: string } | { readonly __typename: 'RootField', readonly id: string, readonly name: string } | { readonly __typename: 'TextField', readonly id: string, readonly name: string } }>, readonly blockEdges: ReadonlyArray<{ readonly left: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string }, readonly right: { readonly id: string, readonly name: string } | { readonly id: string, readonly name: string } | { readonly id: string, readonly name: string } | { readonly id: string, readonly name: string } | { readonly id: string, readonly name: string } | { readonly id: string, readonly name: string } | { readonly id: string, readonly name: string } | { readonly id: string, readonly name: string } }> }, readonly rows: ReadonlyArray<{ readonly id: string, readonly cells: ReadonlyArray<{ readonly booleanValue: boolean, readonly id: string } | { readonly dateValue?: any | null | undefined, readonly id: string } | { readonly dateTimeValue?: any | null | undefined, readonly id: string } | { readonly floatValue?: number | null | undefined, readonly id: string } | { readonly intValue?: number | null | undefined, readonly id: string } | { readonly textValue?: string | null | undefined, readonly id: string }> }> } | null | undefined };

export type CreateGraphMutationVariables = Exact<{
  input: CreateGraphInput;
}>;


export type CreateGraphMutation = { readonly createGraph: { readonly id: string } };

export type CreateViewMutationVariables = Exact<{
  input: CreateViewInput;
}>;


export type CreateViewMutation = { readonly createView: { readonly id: string } };

export type CreateTextFieldMutationVariables = Exact<{
  input: CreateFieldInput;
}>;


export type CreateTextFieldMutation = { readonly createTextField: { readonly id: string } };

export type CreateBooleanFieldMutationVariables = Exact<{
  input: CreateFieldInput;
}>;


export type CreateBooleanFieldMutation = { readonly createBooleanField: { readonly id: string } };

export type CreateNumberFieldMutationVariables = Exact<{
  input: CreateFieldInput;
}>;


export type CreateNumberFieldMutation = { readonly createNumberField: { readonly id: string } };

export type CreateBlockFieldMutationVariables = Exact<{
  input: CreateFieldInput;
}>;


export type CreateBlockFieldMutation = { readonly createBlockField: { readonly id: string } };

export type SetFieldNameMutationVariables = Exact<{
  input: SetFieldNameInput;
}>;


export type SetFieldNameMutation = { readonly setFieldName: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } };

export type SetFieldHiddenMutationVariables = Exact<{
  input: SetFieldHiddenInput;
}>;


export type SetFieldHiddenMutation = { readonly setFieldHidden: { readonly id: string } };

export type DeleteGraphMutationVariables = Exact<{
  input: DeleteGraphInput;
}>;


export type DeleteGraphMutation = { readonly deleteGraph: { readonly id: string } };

export type SetViewNameMutationVariables = Exact<{
  input: SetViewNameInput;
}>;


export type SetViewNameMutation = { readonly setViewName: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } };

export type DeleteViewMutationVariables = Exact<{
  input: DeleteViewInput;
}>;


export type DeleteViewMutation = { readonly deleteView: { readonly id: string } };

export type DeleteFieldMutationVariables = Exact<{
  input: DeleteFieldInput;
}>;


export type DeleteFieldMutation = { readonly deleteField: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } };

export type CreateRowMutationVariables = Exact<{
  input: CreateRowInput;
}>;


export type CreateRowMutation = { readonly createRow: { readonly id: string } };

export type DeleteRowsMutationVariables = Exact<{
  input: DeleteRowsInput;
}>;


export type DeleteRowsMutation = { readonly deleteRows: ReadonlyArray<{ readonly id: string }> };

export type UpdateTextCellMutationVariables = Exact<{
  input: UpdateTextCellInput;
}>;


export type UpdateTextCellMutation = { readonly updateTextCell: { readonly id: string } };

export type UpdateBooleanCellMutationVariables = Exact<{
  input: UpdateBooleanCellInput;
}>;


export type UpdateBooleanCellMutation = { readonly updateBooleanCell: { readonly id: string } };

export type UpdateIntCellMutationVariables = Exact<{
  input: UpdateIntCellInput;
}>;


export type UpdateIntCellMutation = { readonly updateIntCell: { readonly id: string } };

export type UpdateFloatCellMutationVariables = Exact<{
  input: UpdateFloatCellInput;
}>;


export type UpdateFloatCellMutation = { readonly updateFloatCell: { readonly id: string } };


export const FindGraphsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"findGraphs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"graphs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"root"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<FindGraphsQuery, FindGraphsQueryVariables>;
export const FindGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"findGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"graphId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parentFieldId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"graph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"graphId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"graphId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"root"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"view"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"leftId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentFieldId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lockedAt"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"leftId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentFieldId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"left"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"right"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"blockEdges"},"name":{"kind":"Name","value":"edges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"BLOCK"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"left"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"right"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"parentFieldId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentFieldId"}}},{"kind":"Argument","name":{"kind":"Name","value":"parentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cells"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TextCell"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"textValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BooleanCell"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"booleanValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IntCell"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"intValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FloatCell"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"floatValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DateCell"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dateValue"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DateTimeCell"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dateTimeValue"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<FindGraphQuery, FindGraphQueryVariables>;
export const CreateGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGraphInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGraph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateGraphMutation, CreateGraphMutationVariables>;
export const CreateViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateViewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createView"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateViewMutation, CreateViewMutationVariables>;
export const CreateTextFieldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createTextField"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTextField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateTextFieldMutation, CreateTextFieldMutationVariables>;
export const CreateBooleanFieldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createBooleanField"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBooleanField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBooleanFieldMutation, CreateBooleanFieldMutationVariables>;
export const CreateNumberFieldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createNumberField"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createNumberField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateNumberFieldMutation, CreateNumberFieldMutationVariables>;
export const CreateBlockFieldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createBlockField"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBlockField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBlockFieldMutation, CreateBlockFieldMutationVariables>;
export const SetFieldNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"setFieldName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFieldNameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFieldName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SetFieldNameMutation, SetFieldNameMutationVariables>;
export const SetFieldHiddenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"setFieldHidden"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFieldHiddenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFieldHidden"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SetFieldHiddenMutation, SetFieldHiddenMutationVariables>;
export const DeleteGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteGraphInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGraph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteGraphMutation, DeleteGraphMutationVariables>;
export const SetViewNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"setViewName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetViewNameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setViewName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SetViewNameMutation, SetViewNameMutationVariables>;
export const DeleteViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteViewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteView"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteViewMutation, DeleteViewMutationVariables>;
export const DeleteFieldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteField"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteFieldMutation, DeleteFieldMutationVariables>;
export const CreateRowDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createRow"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRowInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRow"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateRowMutation, CreateRowMutationVariables>;
export const DeleteRowsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteRows"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteRowsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRows"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteRowsMutation, DeleteRowsMutationVariables>;
export const UpdateTextCellDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateTextCell"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTextCellInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTextCell"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateTextCellMutation, UpdateTextCellMutationVariables>;
export const UpdateBooleanCellDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateBooleanCell"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateBooleanCellInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBooleanCell"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateBooleanCellMutation, UpdateBooleanCellMutationVariables>;
export const UpdateIntCellDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateIntCell"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateIntCellInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateIntCell"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateIntCellMutation, UpdateIntCellMutationVariables>;
export const UpdateFloatCellDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateFloatCell"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFloatCellInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFloatCell"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateFloatCellMutation, UpdateFloatCellMutationVariables>;