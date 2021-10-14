import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
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
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type BlocField = Field & {
  readonly cardinality: Cardinality;
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type BooleanField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export enum Cardinality {
  Many = 'MANY',
  One = 'ONE'
}

export type Change = {
  readonly nodeId: Scalars['ID'];
};

export type CreateFieldChange = Change & {
  readonly nodeId: Scalars['ID'];
};

export type CreateFieldInput = {
  readonly description?: Maybe<Scalars['String']>;
  readonly leftId: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly position?: Maybe<Scalars['Int']>;
  readonly versionId: Scalars['ID'];
};

export type CreateGraphInput = {
  readonly name: Scalars['String'];
};

export type CreateVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type CreateViewInput = {
  readonly graphId: Scalars['ID'];
  readonly name: Scalars['String'];
};

export type DateField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type DateTimeField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
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

export type FieldRequiredChange = Change & {
  readonly from: Scalars['Boolean'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['Boolean'];
};

export type FileField = Field & {
  readonly cardinality: Cardinality;
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type Graph = {
  readonly color: Scalars['String'];
  readonly createdAt: Scalars['DateTime'];
  readonly id: Scalars['ID'];
  readonly root: RootField;
  readonly version: Version;
  readonly view: View;
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
  readonly createBlocField: Edge;
  readonly createBooleanField: Edge;
  readonly createDateField: Edge;
  readonly createDateTimeField: Edge;
  readonly createFileField: Edge;
  readonly createGraph: Graph;
  readonly createNumberField: Edge;
  readonly createTextField: Edge;
  readonly createVersion: Version;
  readonly createView: View;
  readonly deleteField: Field;
  readonly deleteGraph: Graph;
  readonly deleteVersion: Version;
  readonly deleteView: View;
  readonly lockVersion: Version;
  readonly moveField: Edge;
  readonly setFieldDescription: Field;
  readonly setFieldHidden: View;
  readonly setFieldName: Field;
  readonly setFieldNullable: Field;
  readonly unlockVersion: Version;
};


export type MutationCreateBlocFieldArgs = {
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


export type MutationUnlockVersionArgs = {
  input: UnlockVersionInput;
};

export type NumberField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
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

export type TextField = Field & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type UnlockVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type Version = {
  readonly createdAt: Scalars['DateTime'];
  readonly diff: ReadonlyArray<Change>;
  readonly edges: ReadonlyArray<Edge>;
  readonly id: Scalars['ID'];
  readonly lockedAt?: Maybe<Scalars['DateTime']>;
};


export type VersionDiffArgs = {
  versionId: Scalars['ID'];
};


export type VersionEdgesArgs = {
  leftId?: Maybe<Scalars['ID']>;
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
  leftId?: Maybe<Scalars['ID']>;
};

export type FindGraphsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindGraphsQuery = { readonly graphs: ReadonlyArray<{ readonly id: string, readonly color: string, readonly root: { readonly id: string, readonly name: string } }> };

export type FindGraphQueryVariables = Exact<{
  graphId: Scalars['ID'];
}>;


export type FindGraphQuery = { readonly graph?: { readonly id: string, readonly createdAt: any, readonly color: string, readonly root: { readonly id: string, readonly name: string }, readonly view: { readonly id: string, readonly name: string, readonly edges: ReadonlyArray<{ readonly id: string }> }, readonly version: { readonly id: string, readonly lockedAt?: any | null | undefined, readonly edges: ReadonlyArray<{ readonly id: string, readonly left: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string }, readonly right: { readonly __typename: 'BlocField', readonly id: string, readonly name: string } | { readonly __typename: 'BooleanField', readonly id: string, readonly name: string } | { readonly __typename: 'DateField', readonly id: string, readonly name: string } | { readonly __typename: 'DateTimeField', readonly id: string, readonly name: string } | { readonly __typename: 'FileField', readonly id: string, readonly name: string } | { readonly __typename: 'NumberField', readonly id: string, readonly name: string } | { readonly __typename: 'RootField', readonly id: string, readonly name: string } | { readonly __typename: 'TextField', readonly id: string, readonly name: string } }> } } | null | undefined };

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

export type CreateBlocFieldMutationVariables = Exact<{
  input: CreateFieldInput;
}>;


export type CreateBlocFieldMutation = { readonly createBlocField: { readonly id: string } };

export type SetFieldNameMutationVariables = Exact<{
  input: SetFieldNameInput;
}>;


export type SetFieldNameMutation = { readonly setFieldName: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } };

export type DeleteGraphMutationVariables = Exact<{
  input: DeleteGraphInput;
}>;


export type DeleteGraphMutation = { readonly deleteGraph: { readonly id: string } };

export type DeleteViewMutationVariables = Exact<{
  input: DeleteViewInput;
}>;


export type DeleteViewMutation = { readonly deleteView: { readonly id: string } };

export type DeleteFieldMutationVariables = Exact<{
  input: DeleteFieldInput;
}>;


export type DeleteFieldMutation = { readonly deleteField: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } };


export const FindGraphsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"findGraphs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"graphs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"root"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<FindGraphsQuery, FindGraphsQueryVariables>;
export const FindGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"findGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"graphId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"graph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"graphId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"graphId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"root"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"view"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lockedAt"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"left"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"right"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<FindGraphQuery, FindGraphQueryVariables>;
export const CreateGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGraphInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGraph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateGraphMutation, CreateGraphMutationVariables>;
export const CreateViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateViewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createView"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateViewMutation, CreateViewMutationVariables>;
export const CreateTextFieldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createTextField"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTextField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateTextFieldMutation, CreateTextFieldMutationVariables>;
export const CreateBlocFieldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createBlocField"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBlocField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBlocFieldMutation, CreateBlocFieldMutationVariables>;
export const SetFieldNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"setFieldName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetFieldNameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setFieldName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SetFieldNameMutation, SetFieldNameMutationVariables>;
export const DeleteGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteGraphInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGraph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteGraphMutation, DeleteGraphMutationVariables>;
export const DeleteViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteViewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteView"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteViewMutation, DeleteViewMutationVariables>;
export const DeleteFieldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteField"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteFieldMutation, DeleteFieldMutationVariables>;