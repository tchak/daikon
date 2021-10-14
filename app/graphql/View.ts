import {
  InputType,
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
} from 'type-graphql';

@ObjectType()
export class View {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@InputType()
export class CreateViewInput {
  @Field(() => ID)
  graphId!: string;

  @Field(() => String)
  name!: string;
}

@InputType()
export class DeleteViewInput {
  @Field(() => ID)
  viewId!: string;
}
