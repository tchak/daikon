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
import { GraphQLDate } from 'graphql-scalars';

import { CellData, resolveCellType } from '~/models';

@ObjectType('Row')
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
  textValue!: string | null;
}

@ObjectType({ implements: CellType })
export class IntCell extends CellType {
  @Field(() => Int, { nullable: true })
  intValue!: number | null;
}

@ObjectType({ implements: CellType })
export class FloatCell extends CellType {
  @Field(() => Float, { nullable: true })
  floatValue!: number | null;
}

@ObjectType({ implements: CellType })
export class BooleanCell extends CellType {
  @Field(() => Boolean)
  booleanValue!: boolean;
}

@ObjectType({ implements: CellType })
export class DateTimeCell extends CellType {
  @Field(() => GraphQLISODateTime, { nullable: true })
  dateTimeValue!: Date | null;
}

@ObjectType({ implements: CellType })
export class DateCell extends CellType {
  @Field(() => GraphQLDate, { nullable: true })
  dateValue!: Date | null;
}

@InputType()
export class UpdateTextCellInput {
  @Field(() => ID)
  rowId!: string;

  @Field(() => ID)
  fieldId!: string;

  @Field(() => String)
  value!: string;
}

@InputType()
export class UpdateBooleanCellInput {
  @Field(() => ID)
  rowId!: string;

  @Field(() => ID)
  fieldId!: string;

  @Field(() => Boolean)
  value!: boolean;
}

@InputType()
export class UpdateIntCellInput {
  @Field(() => ID)
  rowId!: string;

  @Field(() => ID)
  fieldId!: string;

  @Field(() => Int)
  value!: number;
}

@InputType()
export class UpdateFloatCellInput {
  @Field(() => ID)
  rowId!: string;

  @Field(() => ID)
  fieldId!: string;

  @Field(() => Float)
  value!: number;
}

@InputType()
export class UpdateDateTimeCellInput {
  @Field(() => ID)
  rowId!: string;

  @Field(() => ID)
  fieldId!: string;

  @Field(() => GraphQLISODateTime)
  value!: Date;
}

@InputType()
export class UpdateDateCellInput {
  @Field(() => ID)
  rowId!: string;

  @Field(() => ID)
  fieldId!: string;

  @Field(() => GraphQLDate)
  value!: Date;
}
