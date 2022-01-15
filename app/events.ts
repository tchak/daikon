import { z } from 'zod';
import { formatISO } from 'date-fns';

const Id = z.string().uuid();
const Email = z.string().email();
const Name = z.string().min(1);

const Role = z.enum(['Owner', 'Member', 'Editor', 'ReadOnly']);

export const Metadata = z.object({
  timestamp: z.string(),
  actor: z.enum(['anonymous', 'system']).or(z.string().uuid()),
});
export type Metadata = z.infer<typeof Metadata>;

export function metadata({ actor }: Partial<Omit<Metadata, 'timestamp'>>) {
  return (): Metadata => ({
    timestamp: formatISO(new Date()),
    actor: actor ?? 'anonymous',
  });
}

const Event = z.object({
  eventId: z.string().uuid(),
  metadata: Metadata,
});

export const UserCreated = Event.extend({
  eventType: z.literal('UserCreated'),
  data: z.object({
    userId: Id,
    email: Email,
  }),
});
export const UserDeleted = Event.extend({
  eventType: z.literal('UserDeleted'),
  data: z.object({
    userId: Id,
  }),
});
export const UserRestored = Event.extend({
  eventType: z.literal('UserRestored'),
  data: z.object({
    userId: Id,
  }),
});
export const UserDestroyed = Event.extend({
  eventType: z.literal('UserDestroyed'),
  data: z.object({
    userId: Id,
  }),
});

export const OrganizationCreated = Event.extend({
  eventType: z.literal('OrganizationCreated'),
  data: z.object({
    organizationId: Id,
    name: Name,
  }),
});
export const OrganizationDeleted = Event.extend({
  eventType: z.literal('OrganizationDeleted'),
  data: z.object({
    organizationId: Id,
  }),
});
export const OrganizationRestored = Event.extend({
  eventType: z.literal('OrganizationRestored'),
  data: z.object({
    organizationId: Id,
  }),
});
export const OrganizationDestroyed = Event.extend({
  eventType: z.literal('OrganizationDestroyed'),
  data: z.object({
    organizationId: Id,
  }),
});
export const OrganizationNameSet = Event.extend({
  eventType: z.literal('OrganizationNameSet'),
  data: z.object({
    organizationId: Id,
    name: Name,
  }),
});
export const UserAddedToOrganization = Event.extend({
  eventType: z.literal('UserAddedToOrganization'),
  data: z.object({
    organizationId: Id,
    userId: Id,
    role: Role,
  }),
});
export const UserRemovedFromOrganization = Event.extend({
  eventType: z.literal('UserRemovedFromOrganization'),
  data: z.object({
    organizationId: Id,
    userId: Id,
    role: Role,
  }),
});

export const UserEvent = z.union([
  UserCreated,
  UserDeleted,
  UserRestored,
  UserDestroyed,
  OrganizationCreated,
  UserAddedToOrganization,
  UserRemovedFromOrganization,
]);

export type UserEventsMap = {
  UserCreated: z.infer<typeof UserCreated>['data'];
  UserDeleted: z.infer<typeof UserDeleted>['data'];
  UserRestored: z.infer<typeof UserRestored>['data'];
  UserDestroyed: z.infer<typeof UserDestroyed>['data'];
  OrganizationCreated: z.infer<typeof OrganizationCreated>['data'];
  UserAddedToOrganization: z.infer<typeof UserAddedToOrganization>['data'];
  UserRemovedFromOrganization: z.infer<
    typeof UserRemovedFromOrganization
  >['data'];
};

export const OrganizationEvent = z.union([
  OrganizationCreated,
  OrganizationNameSet,
  OrganizationDeleted,
  OrganizationRestored,
  OrganizationDestroyed,
  UserAddedToOrganization,
  UserRemovedFromOrganization,
]);

export type OrganizationEventsMap = {
  OrganizationCreated: z.infer<typeof OrganizationCreated>['data'];
  OrganizationNameSet: z.infer<typeof OrganizationNameSet>['data'];
  OrganizationDeleted: z.infer<typeof OrganizationDeleted>['data'];
  OrganizationRestored: z.infer<typeof OrganizationRestored>['data'];
  OrganizationDestroyed: z.infer<typeof OrganizationDestroyed>['data'];
  UserAddedToOrganization: z.infer<typeof UserAddedToOrganization>['data'];
  UserRemovedFromOrganization: z.infer<
    typeof UserRemovedFromOrganization
  >['data'];
};

export const BucketCreated = Event.extend({
  eventType: z.literal('BucketCreated'),
  data: z.object({
    organizationId: Id,
    bucketId: Id,
    name: Name,
    color: z.string(),
  }),
});
export const BucketDeleted = Event.extend({
  eventType: z.literal('BucketDeleted'),
  data: z.object({
    bucketId: Id,
  }),
});
export const BucketRestored = Event.extend({
  eventType: z.literal('BucketRestored'),
  data: z.object({
    bucketId: Id,
  }),
});
export const BucketDestroyed = Event.extend({
  eventType: z.literal('BucketDestroyed'),
  data: z.object({
    bucketId: Id,
  }),
});
export const BucketNameSet = Event.extend({
  eventType: z.literal('BucketNameSet'),
  data: z.object({
    bucketId: Id,
    name: Name,
  }),
});
export const BucketDescriptionSet = Event.extend({
  eventType: z.literal('BucketDescriptionSet'),
  data: z.object({
    bucketId: Id,
    description: z.string(),
  }),
});
export const BucketColorSet = Event.extend({
  eventType: z.literal('BucketColorSet'),
  data: z.object({
    bucketId: Id,
    color: z.string(),
  }),
});
export const BucketMovedToOrganizationSet = Event.extend({
  eventType: z.literal('BucketMovedToOrganizationSet'),
  data: z.object({
    bucketId: Id,
    organizationId: Id,
  }),
});
export const BucketSchemaLocked = Event.extend({
  eventType: z.literal('BucketSchemaLocked'),
  data: z.object({ bucketId: Id }),
});

const FieldPosition = z.number().int();
const OneFieldType = z.enum(['BOOLEAN', 'DATE', 'DATE_TIME']);
const ManyFieldType = z.enum(['TEXT', 'INT', 'FLOAT', 'RECORD']);
const FieldType = z.union([OneFieldType, ManyFieldType]);
const FieldCardinality = z.enum(['ONE', 'MANY']);
const ViewType = z.enum(['GRID']);

const FieldCreatedData = z.object({
  bucketId: Id,
  fieldId: Id,
  name: Name,
  position: FieldPosition.optional(),
  parentId: Id.optional(),
});
export const FieldCreated = Event.extend({
  eventType: z.literal('FieldCreated'),
  data: z.union([
    FieldCreatedData.extend({ type: OneFieldType }),
    FieldCreatedData.extend({
      type: ManyFieldType,
      cardinality: FieldCardinality.optional(),
    }),
  ]),
});
export const FieldDeleted = Event.extend({
  eventType: z.literal('FieldDeleted'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
  }),
});
export const FieldRestored = Event.extend({
  eventType: z.literal('FieldRestored'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
  }),
});
export const FieldDestroyed = Event.extend({
  eventType: z.literal('FieldDestroyed'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
  }),
});
export const FieldTypeSet = Event.extend({
  eventType: z.literal('FieldTypeSet'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
    type: FieldType,
  }),
});
export const FieldNameSet = Event.extend({
  eventType: z.literal('FieldNameSet'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
    name: Name,
  }),
});
export const FieldDescriptionSet = Event.extend({
  eventType: z.literal('FieldDescriptionSet'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
    description: z.string(),
  }),
});
export const FieldCardinalitySet = Event.extend({
  eventType: z.literal('FieldCardinalitySet'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
    cardinality: FieldCardinality,
  }),
});
export const FieldPositionSet = Event.extend({
  eventType: z.literal('FieldPositionSet'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
    position: FieldPosition,
  }),
});
export const FieldParentSet = Event.extend({
  eventType: z.literal('FieldParentSet'),
  data: z.object({
    bucketId: Id,
    fieldId: Id,
    parentId: Id.nullable(),
  }),
});

export const ViewCreated = Event.extend({
  eventType: z.literal('ViewCreated'),
  data: z.object({
    bucketId: Id,
    viewId: Id,
    name: Name,
    type: ViewType,
  }),
});
export const ViewNameSet = Event.extend({
  eventType: z.literal('ViewNameSet'),
  data: z.object({
    bucketId: Id,
    viewId: Id,
    name: Name,
  }),
});
export const ViewDescriptionSet = Event.extend({
  eventType: z.literal('ViewDescriptionSet'),
  data: z.object({
    bucketId: Id,
    viewId: Id,
    description: z.string(),
  }),
});
export const ViewDeleted = Event.extend({
  eventType: z.literal('ViewDeleted'),
  data: z.object({
    bucketId: Id,
    viewId: Id,
  }),
});
export const ViewRestored = Event.extend({
  eventType: z.literal('ViewRestored'),
  data: z.object({
    bucketId: Id,
    viewId: Id,
  }),
});
export const ViewDestroyed = Event.extend({
  eventType: z.literal('ViewDestroyed'),
  data: z.object({
    bucketId: Id,
    viewId: Id,
  }),
});
export const FieldHiddenSet = Event.extend({
  eventType: z.literal('FieldHiddenSet'),
  data: z.object({
    bucketId: Id,
    viewId: Id,
    fieldId: Id,
    hidden: z.boolean(),
  }),
});

export const BucketEvent = z.union([
  BucketCreated,
  BucketDeleted,
  BucketRestored,
  BucketDestroyed,
  BucketNameSet,
  BucketDescriptionSet,
  BucketColorSet,
  BucketSchemaLocked,
  FieldCreated,
  FieldNameSet,
  FieldDescriptionSet,
  FieldDeleted,
  FieldRestored,
  FieldDestroyed,
  ViewCreated,
  ViewNameSet,
  ViewDescriptionSet,
  ViewDeleted,
  ViewRestored,
  ViewDestroyed,
  FieldHiddenSet,
]);

export type BucketEventsMap = {
  BucketCreated: z.infer<typeof BucketCreated>['data'];
  BucketDeleted: z.infer<typeof BucketDeleted>['data'];
  BucketRestored: z.infer<typeof BucketRestored>['data'];
  BucketDestroyed: z.infer<typeof BucketDestroyed>['data'];
  BucketNameSet: z.infer<typeof BucketNameSet>['data'];
  BucketDescriptionSet: z.infer<typeof BucketDescriptionSet>['data'];
  BucketColorSet: z.infer<typeof BucketColorSet>['data'];
  BucketSchemaLocked: z.infer<typeof BucketSchemaLocked>['data'];
  FieldCreated: z.infer<typeof FieldCreated>['data'];
  FieldNameSet: z.infer<typeof FieldNameSet>['data'];
  FieldDescriptionSet: z.infer<typeof FieldDescriptionSet>['data'];
  FieldDeleted: z.infer<typeof FieldDeleted>['data'];
  FieldRestored: z.infer<typeof FieldRestored>['data'];
  FieldDestroyed: z.infer<typeof FieldDestroyed>['data'];
  ViewCreated: z.infer<typeof ViewCreated>['data'];
  ViewNameSet: z.infer<typeof ViewNameSet>['data'];
  ViewDescriptionSet: z.infer<typeof ViewDescriptionSet>['data'];
  ViewDeleted: z.infer<typeof ViewDeleted>['data'];
  ViewRestored: z.infer<typeof ViewRestored>['data'];
  ViewDestroyed: z.infer<typeof ViewDestroyed>['data'];
  FieldHiddenSet: z.infer<typeof FieldHiddenSet>['data'];
};

export const RecordCreated = Event.extend({
  eventType: z.literal('RecordCreated'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    parentId: Id.nullable(),
  }),
});
export const RecordDeleted = Event.extend({
  eventType: z.literal('RecordDeleted'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
  }),
});
export const RecordRestored = Event.extend({
  eventType: z.literal('RecordRestored'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
  }),
});
export const RecordDestroyed = Event.extend({
  eventType: z.literal('RecordDestroyed'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
  }),
});

export const TextFieldValueSet = Event.extend({
  eventType: z.literal('TextFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.string().nullable(),
  }),
});
export const TextArrayFieldValueSet = Event.extend({
  eventType: z.literal('TextArrayFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.array(z.string()),
  }),
});
export const IntFieldValueSet = Event.extend({
  eventType: z.literal('IntFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.number().int().nullable(),
  }),
});
export const IntArrayFieldValueSet = Event.extend({
  eventType: z.literal('IntArrayFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.array(z.number().int()),
  }),
});
export const FloatFieldValueSet = Event.extend({
  eventType: z.literal('FloatFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.number().nullable(),
  }),
});
export const FloatArrayFieldValueSet = Event.extend({
  eventType: z.literal('FloatArrayFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.array(z.number()),
  }),
});
export const DateFieldValueSet = Event.extend({
  eventType: z.literal('DateFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.string().nullable(),
  }),
});
export const DateTimeFieldValueSet = Event.extend({
  eventType: z.literal('DateTimeFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.string().nullable(),
  }),
});
export const BooleanFieldValueSet = Event.extend({
  eventType: z.literal('BooleanFieldValueSet'),
  data: z.object({
    bucketId: Id,
    recordId: Id,
    fieldId: Id,
    value: z.boolean(),
  }),
});

export const RecordEvent = z.union([
  RecordCreated,
  RecordDeleted,
  RecordRestored,
  RecordDestroyed,
  TextFieldValueSet,
  BooleanFieldValueSet,
  DateFieldValueSet,
  DateTimeFieldValueSet,
  IntFieldValueSet,
  FloatFieldValueSet,
]);

export type RecordEventsMap = {
  RecordCreated: z.infer<typeof RecordCreated>['data'];
  RecordDeleted: z.infer<typeof RecordDeleted>['data'];
  RecordRestored: z.infer<typeof RecordRestored>['data'];
  RecordDestroyed: z.infer<typeof RecordDestroyed>['data'];
  TextFieldValueSet: z.infer<typeof TextFieldValueSet>['data'];
  BooleanFieldValueSet: z.infer<typeof BooleanFieldValueSet>['data'];
  DateFieldValueSet: z.infer<typeof DateFieldValueSet>['data'];
  DateTimeFieldValueSet: z.infer<typeof DateTimeFieldValueSet>['data'];
  IntFieldValueSet: z.infer<typeof IntFieldValueSet>['data'];
  FloatFieldValueSet: z.infer<typeof FloatFieldValueSet>['data'];
};
