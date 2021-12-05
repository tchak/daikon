import {
  InputType,
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
} from 'type-graphql';

@ObjectType()
export class Row {
  @Field(() => ID)
  id!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@InputType()
export class ParentInput {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  fieldId!: string;
}

@InputType()
export class CreateRowInput {
  @Field(() => ID)
  versionId!: string;

  @Field(() => ParentInput, { nullable: true })
  parent?: ParentInput;
}

@InputType()
export class DeleteRowsInput {
  @Field(() => [ID])
  rowIds!: string[];
}
