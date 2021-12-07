import {
  InputType,
  ObjectType,
  InterfaceType,
  Field,
  ID,
  Int,
  registerEnumType,
  GraphQLISODateTime,
} from 'type-graphql';

import { FieldData, resolveFieldType } from '~/models';

export enum CardinalityEnum {
  ONE = 'ONE',
  MANY = 'MANY',
}

export enum FieldTypeEnum {
  ROOT = 'ROOT',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  DATE_TIME = 'DATE_TIME',
  FILE = 'FILE',
  BLOCK = 'BLOCK',
}

registerEnumType(CardinalityEnum, { name: 'Cardinality' });
registerEnumType(FieldTypeEnum, { name: 'FieldType' });

@InterfaceType('Field', {
  resolveType(node: FieldData) {
    return resolveFieldType(node);
  },
})
export abstract class FieldType {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@ObjectType({ implements: FieldType })
export class RootField extends FieldType {}

@ObjectType({ implements: FieldType })
export class TextField extends FieldType {
  @Field(() => Boolean)
  nullable!: boolean;
}

@ObjectType({ implements: FieldType })
export class BooleanField extends FieldType {
  @Field(() => Boolean)
  nullable!: boolean;
}

@ObjectType({ implements: FieldType })
export class NumberField extends FieldType {
  @Field(() => Boolean)
  nullable!: boolean;
}

@ObjectType({ implements: FieldType })
export class DateField extends FieldType {
  @Field(() => Boolean)
  nullable!: boolean;
}

@ObjectType({ implements: FieldType })
export class DateTimeField extends FieldType {
  @Field(() => Boolean)
  nullable!: boolean;
}

@ObjectType({ implements: FieldType })
export class BlockField extends FieldType {
  @Field(() => CardinalityEnum)
  cardinality!: CardinalityEnum;

  @Field(() => Boolean)
  nullable!: boolean;
}

@ObjectType({ implements: FieldType })
export class FileField extends FieldType {
  @Field(() => CardinalityEnum)
  cardinality!: CardinalityEnum;

  @Field(() => Boolean)
  nullable!: boolean;
}

@ObjectType()
export class Edge {
  @Field(() => ID)
  id!: string;

  @Field(() => Int)
  position!: number;

  @Field(() => FieldType)
  left!: FieldType;

  @Field(() => FieldType)
  right!: FieldType;
}

@InputType()
export class CreateFieldInput {
  @Field(() => ID)
  versionId!: string;

  @Field(() => ID)
  leftId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  position?: number;
}

@InputType()
export class DeleteFieldInput {
  @Field(() => ID)
  versionId!: string;

  @Field(() => ID)
  nodeId!: string;
}

@InputType()
export class SetFieldNameInput {
  @Field(() => ID)
  versionId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field(() => String)
  name!: string;
}

@InputType()
export class SetFieldDescriptionInput {
  @Field(() => ID)
  versionId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field(() => String)
  description!: string;
}

@InputType()
export class SetFieldHiddenInput {
  @Field(() => ID)
  viewId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field(() => Boolean)
  hidden!: boolean;
}

@InputType()
export class SetFieldNullableInput {
  @Field(() => ID)
  versionId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field(() => Boolean)
  nullable!: boolean;
}

@InputType()
export class MoveFieldInput {
  @Field(() => ID)
  versionId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field(() => ID)
  leftId!: string;

  @Field(() => Int)
  position!: number;
}

export { FieldType as Field };
