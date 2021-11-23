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

export type BlocNode = Node & {
  readonly cardinality: Cardinality;
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type BooleanNode = Node & {
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

export type CreateGraphInput = {
  readonly name: Scalars['String'];
};

export type CreateNodeChange = Change & {
  readonly nodeId: Scalars['ID'];
};

export type CreateNodeInput = {
  readonly description?: Maybe<Scalars['String']>;
  readonly leftId: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly position?: Maybe<Scalars['Int']>;
  readonly versionId: Scalars['ID'];
};

export type CreateVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type DateNode = Node & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type DateTimeNode = Node & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type DeleteGraphInput = {
  readonly graphId: Scalars['ID'];
};

export type DeleteNodeChange = Change & {
  readonly nodeId: Scalars['ID'];
};

export type DeleteNodeInput = {
  readonly nodeId: Scalars['ID'];
  readonly versionId: Scalars['ID'];
};

export type DeleteVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type Edge = {
  readonly id: Scalars['ID'];
  readonly left: Node;
  readonly position: Scalars['Int'];
  readonly right: Node;
};

export type FileNode = Node & {
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
  readonly root: RootNode;
  readonly version: Version;
  readonly versions: ReadonlyArray<VersionMeta>;
};

export type LockVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type Mutation = {
  readonly createBlocNode: Edge;
  readonly createBooleanNode: Edge;
  readonly createDateNode: Edge;
  readonly createDateTimeNode: Edge;
  readonly createFileNode: Edge;
  readonly createGraph: Graph;
  readonly createNumberNode: Edge;
  readonly createTextNode: Edge;
  readonly createVersion: VersionMeta;
  readonly deleteGraph: Graph;
  readonly deleteNode: Node;
  readonly deleteVersion: VersionMeta;
  readonly lockVersion: VersionMeta;
  readonly unlockVersion: VersionMeta;
  readonly updateNodeDescription: Node;
  readonly updateNodeName: Node;
  readonly updateNodePosition: Edge;
  readonly updateNodeRequired: Node;
};


export type MutationCreateBlocNodeArgs = {
  input: CreateNodeInput;
};


export type MutationCreateBooleanNodeArgs = {
  input: CreateNodeInput;
};


export type MutationCreateDateNodeArgs = {
  input: CreateNodeInput;
};


export type MutationCreateDateTimeNodeArgs = {
  input: CreateNodeInput;
};


export type MutationCreateFileNodeArgs = {
  input: CreateNodeInput;
};


export type MutationCreateGraphArgs = {
  input: CreateGraphInput;
};


export type MutationCreateNumberNodeArgs = {
  input: CreateNodeInput;
};


export type MutationCreateTextNodeArgs = {
  input: CreateNodeInput;
};


export type MutationCreateVersionArgs = {
  input: CreateVersionInput;
};


export type MutationDeleteGraphArgs = {
  input: DeleteGraphInput;
};


export type MutationDeleteNodeArgs = {
  input: DeleteNodeInput;
};


export type MutationDeleteVersionArgs = {
  input: DeleteVersionInput;
};


export type MutationLockVersionArgs = {
  input: LockVersionInput;
};


export type MutationUnlockVersionArgs = {
  input: UnlockVersionInput;
};


export type MutationUpdateNodeDescriptionArgs = {
  input: UpdateNodeDescriptionInput;
};


export type MutationUpdateNodeNameArgs = {
  input: UpdateNodeNameInput;
};


export type MutationUpdateNodePositionArgs = {
  input: UpdateNodePositionInput;
};


export type MutationUpdateNodeRequiredArgs = {
  input: UpdateNodeRequiredInput;
};

export type Node = {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly updatedAt: Scalars['DateTime'];
};

export type NodeDescriptionChange = Change & {
  readonly from: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['String'];
};

export type NodeNameChange = Change & {
  readonly from: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['String'];
};

export type NodeParentChange = Change & {
  readonly from: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['String'];
};

export type NodePositionChange = Change & {
  readonly from: Scalars['Int'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['Int'];
};

export type NodeRequiredChange = Change & {
  readonly from: Scalars['Boolean'];
  readonly nodeId: Scalars['ID'];
  readonly to: Scalars['Boolean'];
};

export type NumberNode = Node & {
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
};


export type QueryGraphArgs = {
  graphId: Scalars['ID'];
};


export type QueryVersionArgs = {
  versionId: Scalars['ID'];
};

export type RootNode = Node & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly updatedAt: Scalars['DateTime'];
};

export type TextNode = Node & {
  readonly description?: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly required: Scalars['Boolean'];
  readonly updatedAt: Scalars['DateTime'];
};

export type UnlockVersionInput = {
  readonly versionId: Scalars['ID'];
};

export type UpdateNodeDescriptionInput = {
  readonly description: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly versionId: Scalars['ID'];
};

export type UpdateNodeNameInput = {
  readonly name: Scalars['String'];
  readonly nodeId: Scalars['ID'];
  readonly versionId: Scalars['ID'];
};

export type UpdateNodePositionInput = {
  readonly leftId: Scalars['ID'];
  readonly nodeId: Scalars['ID'];
  readonly position: Scalars['Int'];
  readonly versionId: Scalars['ID'];
};

export type UpdateNodeRequiredInput = {
  readonly nodeId: Scalars['ID'];
  readonly required: Scalars['Boolean'];
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

export type VersionMeta = {
  readonly createdAt: Scalars['DateTime'];
  readonly id: Scalars['ID'];
  readonly lockedAt?: Maybe<Scalars['DateTime']>;
};

export type FindGraphsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindGraphsQuery = { readonly graphs: ReadonlyArray<{ readonly id: string, readonly color: string, readonly root: { readonly id: string, readonly name: string } }> };

export type FindGraphQueryVariables = Exact<{
  graphId: Scalars['ID'];
}>;


export type FindGraphQuery = { readonly graph?: { readonly id: string, readonly createdAt: any, readonly color: string, readonly root: { readonly id: string, readonly name: string }, readonly version: { readonly id: string, readonly lockedAt?: any | null | undefined, readonly edges: ReadonlyArray<{ readonly position: number, readonly left: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string }, readonly right: { readonly __typename: 'BlocNode', readonly id: string, readonly name: string } | { readonly __typename: 'BooleanNode', readonly id: string, readonly name: string } | { readonly __typename: 'DateNode', readonly id: string, readonly name: string } | { readonly __typename: 'DateTimeNode', readonly id: string, readonly name: string } | { readonly __typename: 'FileNode', readonly id: string, readonly name: string } | { readonly __typename: 'NumberNode', readonly id: string, readonly name: string } | { readonly __typename: 'RootNode', readonly id: string, readonly name: string } | { readonly __typename: 'TextNode', readonly id: string, readonly name: string } }> } } | null | undefined };

export type CreateTextNodeMutationVariables = Exact<{
  input: CreateNodeInput;
}>;


export type CreateTextNodeMutation = { readonly createTextNode: { readonly id: string } };

export type CreateBlocNodeMutationVariables = Exact<{
  input: CreateNodeInput;
}>;


export type CreateBlocNodeMutation = { readonly createBlocNode: { readonly id: string } };

export type DeleteNodeMutationVariables = Exact<{
  input: DeleteNodeInput;
}>;


export type DeleteNodeMutation = { readonly deleteNode: { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } | { readonly id: string } };

export type CreateGraphMutationVariables = Exact<{
  input: CreateGraphInput;
}>;


export type CreateGraphMutation = { readonly createGraph: { readonly id: string } };

export type DeleteGraphMutationVariables = Exact<{
  input: DeleteGraphInput;
}>;


export type DeleteGraphMutation = { readonly deleteGraph: { readonly id: string } };


export const FindGraphsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"findGraphs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"graphs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"root"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]} as unknown as DocumentNode<FindGraphsQuery, FindGraphsQueryVariables>;
export const FindGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"findGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"graphId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"graph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"graphId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"graphId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"root"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lockedAt"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"left"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"right"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<FindGraphQuery, FindGraphQueryVariables>;
export const CreateTextNodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createTextNode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateNodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTextNode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateTextNodeMutation, CreateTextNodeMutationVariables>;
export const CreateBlocNodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createBlocNode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateNodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBlocNode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateBlocNodeMutation, CreateBlocNodeMutationVariables>;
export const DeleteNodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteNode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteNodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteNode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteNodeMutation, DeleteNodeMutationVariables>;
export const CreateGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGraphInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGraph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateGraphMutation, CreateGraphMutationVariables>;
export const DeleteGraphDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteGraph"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteGraphInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGraph"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteGraphMutation, DeleteGraphMutationVariables>;