import {
  InputType,
  ObjectType,
  InterfaceType,
  Field as ObjectTypeField,
  ID,
  Int,
  registerEnumType,
  GraphQLISODateTime,
} from 'type-graphql';

import { FieldData, resolveFieldType } from '~/db';

export enum Cardinality {
  ONE = 'ONE',
  MANY = 'MANY',
}

registerEnumType(Cardinality, { name: 'Cardinality' });

@InterfaceType({
  resolveType(node: FieldData) {
    return resolveFieldType(node);
  },
})
export abstract class Field {
  @ObjectTypeField(() => ID)
  id!: string;

  @ObjectTypeField(() => String)
  name!: string;

  @ObjectTypeField(() => String, { nullable: true })
  description!: string | null;

  @ObjectTypeField(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@ObjectType({ implements: Field })
export class RootField extends Field {}

@ObjectType({ implements: Field })
export class TextField extends Field {
  @ObjectTypeField(() => Boolean)
  required!: boolean;
}

@ObjectType({ implements: Field })
export class BooleanField extends Field {
  @ObjectTypeField(() => Boolean)
  required!: boolean;
}

@ObjectType({ implements: Field })
export class NumberField extends Field {
  @ObjectTypeField(() => Boolean)
  required!: boolean;
}

@ObjectType({ implements: Field })
export class DateField extends Field {
  @ObjectTypeField(() => Boolean)
  required!: boolean;
}

@ObjectType({ implements: Field })
export class DateTimeField extends Field {
  @ObjectTypeField(() => Boolean)
  required!: boolean;
}

@ObjectType({ implements: Field })
export class BlocField extends Field {
  @ObjectTypeField(() => Cardinality)
  cardinality!: Cardinality;

  @ObjectTypeField(() => Boolean)
  required!: boolean;
}

@ObjectType({ implements: Field })
export class FileField extends Field {
  @ObjectTypeField(() => Cardinality)
  cardinality!: Cardinality;

  @ObjectTypeField(() => Boolean)
  required!: boolean;
}

@ObjectType()
export class Edge {
  @ObjectTypeField(() => ID)
  id!: string;

  @ObjectTypeField(() => Int)
  position!: number;

  @ObjectTypeField(() => Field)
  left!: Field;

  @ObjectTypeField(() => Field)
  right!: Field;
}

@ObjectType()
export class Row {
  @ObjectTypeField(() => ID)
  id!: string;

  @ObjectTypeField(() => GraphQLISODateTime)
  createdAt!: Date;

  @ObjectTypeField(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@InputType()
export class CreateFieldInput {
  @ObjectTypeField(() => ID)
  versionId!: string;

  @ObjectTypeField(() => ID)
  leftId!: string;

  @ObjectTypeField(() => String)
  name!: string;

  @ObjectTypeField(() => String, { nullable: true })
  description?: string;

  @ObjectTypeField(() => Int, { nullable: true })
  position?: number;
}

@InputType()
export class DeleteFieldInput {
  @ObjectTypeField(() => ID)
  versionId!: string;

  @ObjectTypeField(() => ID)
  nodeId!: string;
}

@InputType()
export class SetFieldNameInput {
  @ObjectTypeField(() => ID)
  versionId!: string;

  @ObjectTypeField(() => ID)
  nodeId!: string;

  @ObjectTypeField(() => String)
  name!: string;
}

@InputType()
export class SetFieldDescriptionInput {
  @ObjectTypeField(() => ID)
  versionId!: string;

  @ObjectTypeField(() => ID)
  nodeId!: string;

  @ObjectTypeField(() => String)
  description!: string;
}

@InputType()
export class SetFieldHiddenInput {
  @ObjectTypeField(() => ID)
  viewId!: string;

  @ObjectTypeField(() => ID)
  nodeId!: string;

  @ObjectTypeField(() => Boolean)
  hidden!: boolean;
}

@InputType()
export class SetFieldNullableInput {
  @ObjectTypeField(() => ID)
  versionId!: string;

  @ObjectTypeField(() => ID)
  nodeId!: string;

  @ObjectTypeField(() => Boolean)
  nullable!: boolean;
}

@InputType()
export class MoveFieldInput {
  @ObjectTypeField(() => ID)
  versionId!: string;

  @ObjectTypeField(() => ID)
  nodeId!: string;

  @ObjectTypeField(() => ID)
  leftId!: string;

  @ObjectTypeField(() => Int)
  position!: number;
}

@InputType()
export class CreateRowInput {
  @ObjectTypeField(() => ID)
  versionId!: string;
}

@InputType()
export class DeleteRowsInput {
  @ObjectTypeField(() => [ID])
  rowIds!: string[];
}
