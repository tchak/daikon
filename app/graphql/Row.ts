import {
  InputType,
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
  InterfaceType,
  Int,
  Float,
} from 'type-graphql';

import { CellData, resolveCellType } from '~/db';

@ObjectType()
export class Row {
  @Field(() => ID)
  id!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;

  @Field(() => [CellType])
  cells!: CellType[];
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

@InterfaceType('Cell', {
  resolveType(cell: CellData) {
    return resolveCellType(cell);
  },
})
export abstract class CellType {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;
}

@ObjectType({ implements: CellType })
export class TextCell extends CellType {
  @Field(() => String, { nullable: true })
  value!: string | null;
}

@ObjectType({ implements: CellType })
export class IntCell extends CellType {
  @Field(() => Int, { nullable: true })
  value!: number | null;
}

@ObjectType({ implements: CellType })
export class FloatCell extends CellType {
  @Field(() => Float, { nullable: true })
  value!: number | null;
}

@ObjectType({ implements: CellType })
export class BooleanCell extends CellType {
  @Field(() => Boolean)
  value!: boolean;
}

@ObjectType({ implements: CellType })
export class DateCell extends CellType {
  @Field(() => GraphQLISODateTime, { nullable: true })
  value!: Date | null;
}

@ObjectType({ implements: CellType })
export class DateTimeCell extends CellType {
  @Field(() => GraphQLISODateTime, { nullable: true })
  value!: Date | null;
}
