import {
  InputType,
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
} from 'type-graphql';

import { RootField } from './Field';

@ObjectType()
export class Graph {
  @Field(() => ID)
  id!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => String)
  color!: string;

  @Field(() => RootField)
  root!: RootField;
}

@InputType()
export class CreateGraphInput {
  @Field(() => String)
  name!: string;
}

@InputType()
export class DeleteGraphInput {
  @Field(() => ID)
  graphId!: string;
}
