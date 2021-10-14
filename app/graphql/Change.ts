import { ObjectType, InterfaceType, Field, ID, Int } from 'type-graphql';

import { ChangeData, resolveChangeType } from '~/db';

@InterfaceType({
  resolveType(change: ChangeData) {
    return resolveChangeType(change);
  },
})
export abstract class Change {
  @Field(() => ID)
  nodeId!: string;
}

@ObjectType({ implements: Change })
export class CreateFieldChange extends Change {}

@ObjectType({ implements: Change })
export class DeleteFieldChange extends Change {}

@ObjectType({ implements: Change })
export class FieldNameChange extends Change {
  @Field(() => String)
  from!: string;

  @Field(() => String)
  to!: string;
}

@ObjectType({ implements: Change })
export class FieldDescriptionChange extends Change {
  @Field(() => String)
  from!: string;

  @Field(() => String)
  to!: string;
}

@ObjectType({ implements: Change })
export class FieldRequiredChange extends Change {
  @Field(() => Boolean)
  from!: boolean;

  @Field(() => Boolean)
  to!: boolean;
}

@ObjectType({ implements: Change })
export class FieldPositionChange extends Change {
  @Field(() => Int)
  from!: number;

  @Field(() => Int)
  to!: number;
}

@ObjectType({ implements: Change })
export class FieldParentChange extends Change {
  @Field(() => ID)
  from!: string;

  @Field(() => ID)
  to!: string;
}
