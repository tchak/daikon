import {
  InputType,
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
} from 'type-graphql';

@ObjectType()
export class Version {
  @Field(() => ID)
  id!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
  })
  lockedAt!: Date | null;
}

@InputType()
export class CreateVersionInput {
  @Field(() => ID)
  versionId!: string;
}

@InputType()
export class LockVersionInput {
  @Field(() => ID)
  versionId!: string;
}

@InputType()
export class UnlockVersionInput {
  @Field(() => ID)
  versionId!: string;
}

@InputType()
export class DeleteVersionInput {
  @Field(() => ID)
  versionId!: string;
}
