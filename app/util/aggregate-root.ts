import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import invariant from 'tiny-invariant';

import { EventStore, Event, EventInit, EventsMap } from './event-store';
export * from './event-store';

const AggregateId = z.object({ id: z.string().uuid() });
const defaultAggregateId = <Entity>(entity: Entity) =>
  AggregateId.parse(entity).id;

export type ApplyEvent<Entity, Events extends EventsMap, Metadata> = (
  event: Event<keyof Events, Events[keyof Events], Metadata>,
  root: Entity | null
) => Entity | null;

export type AggregateRootOptions<Entity, Metadata> = {
  metadata: () => Metadata;
  aggregateId?: string | ((entity: Entity | null) => string);
};

export class AggregateRoot<Entity, Events extends EventsMap, Metadata> {
  #name: string;
  #applyEvent: ApplyEvent<Entity, Events, Metadata>;
  #metadata: AggregateRootOptions<Entity, Metadata>['metadata'];
  #aggregateId: NonNullable<
    AggregateRootOptions<Entity, Metadata>['aggregateId']
  >;
  #entity: Entity | null = null;
  #version = 0;
  #unpublishedEvents: Event<keyof Events, Events[keyof Events], Metadata>[] =
    [];

  constructor(
    name: string,
    applyEvent: ApplyEvent<Entity, Events, Metadata>,
    options: AggregateRootOptions<Entity, Metadata>
  ) {
    this.#name = name;
    this.#applyEvent = applyEvent;
    this.#metadata = options.metadata;
    this.#aggregateId = options.aggregateId ?? defaultAggregateId;
  }

  get entity(): Entity {
    invariant(this.#entity, `${this.#name} is not initialized`);
    return this.#entity;
  }

  get id() {
    if (typeof this.#aggregateId == 'string') {
      return this.#aggregateId;
    }
    return this.#aggregateId(this.#entity);
  }

  get name() {
    return this.#name;
  }

  get streamName() {
    return `${this.name}$${this.id}`;
  }

  get unpublishedEvents() {
    return this.#unpublishedEvents;
  }

  get version() {
    return this.#version;
  }

  set version(version: number) {
    this.#version = version;
    this.#unpublishedEvents = [];
  }

  applyEvent<Name extends keyof Events>(
    eventOrInit:
      | Event<Name, Events[Name], Metadata>
      | EventInit<Name, Events[Name], Metadata>
  ) {
    const event = isEvent(eventOrInit)
      ? eventOrInit
      : this.createEvent(eventOrInit);
    this.#entity = this.#applyEvent(event, this.#entity);
    this.#unpublishedEvents.push(event);
    return this;
  }

  private createEvent<Name extends keyof Events>(
    init: EventInit<Name, Events[Name], Metadata>
  ): Event<Name, Events[Name], Metadata> {
    return {
      eventId: uuid(),
      eventType: init.type,
      data: init.data,
      metadata: { ...this.#metadata(), ...init.metadata },
    };
  }
}

export function createAggregate<Entity, Events extends EventsMap, Metadata>(
  name: string,
  applyEvent: ApplyEvent<Entity, Events, Metadata>,
  options: AggregateRootOptions<Entity, Metadata>
): AggregateRoot<Entity, Events, Metadata> {
  return new AggregateRoot(name, applyEvent, options);
}

function isEvent<Name extends keyof Events, Events extends EventsMap, Metadata>(
  event:
    | Event<Name, Events[Name], Metadata>
    | EventInit<Name, Events[Name], Metadata>
): event is Event<Name, Events[Name], Metadata> {
  return 'eventId' in event && 'eventType' in event;
}

export async function loadAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>
): Promise<AggregateRoot<Entity, Events, Metadata>>;
export async function loadAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>,
  streamName: string
): Promise<AggregateRoot<Entity, Events, Metadata>>;
export async function loadAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>,
  streamName?: string
): Promise<AggregateRoot<Entity, Events, Metadata>> {
  await eventStore
    .read()
    .stream(streamName ?? aggregate.streamName)
    .reduce((aggregate, event) => aggregate.applyEvent(event), aggregate);
  aggregate.version = aggregate.unpublishedEvents.length - 1;
  return aggregate;
}

export async function storeAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>
): Promise<AggregateRoot<Entity, Events, Metadata>>;
export async function storeAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>,
  streamName: string
): Promise<AggregateRoot<Entity, Events, Metadata>>;
export async function storeAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>,
  streamName?: string
): Promise<AggregateRoot<Entity, Events, Metadata>> {
  await eventStore.publish(
    aggregate.unpublishedEvents,
    streamName ?? aggregate.streamName
  );
  //expected_version: aggregate.version)
  aggregate.version = aggregate.version + aggregate.unpublishedEvents.length;
  return aggregate;
}

export async function withAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>,
  callback: (
    aggregate: AggregateRoot<Entity, Events, Metadata>
  ) => Promise<void> | void
): Promise<AggregateRoot<Entity, Events, Metadata>>;
export async function withAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>,
  streamName: string,
  callback: (
    aggregate: AggregateRoot<Entity, Events, Metadata>
  ) => Promise<void> | void
): Promise<AggregateRoot<Entity, Events, Metadata>>;
export async function withAggregate<
  Entity,
  Context,
  Events extends EventsMap,
  Metadata
>(
  eventStore: EventStore<Context, Events, Metadata>,
  aggregate: AggregateRoot<Entity, Events, Metadata>,
  streamNameOrCallback:
    | string
    | ((
        aggregate: AggregateRoot<Entity, Events, Metadata>
      ) => Promise<void> | void),
  callback?: (
    aggregate: AggregateRoot<Entity, Events, Metadata>
  ) => Promise<void> | void
): Promise<AggregateRoot<Entity, Events, Metadata>> {
  if (typeof streamNameOrCallback == 'function') {
    await loadAggregate(eventStore, aggregate, aggregate.streamName);
    await streamNameOrCallback(aggregate);
    await storeAggregate(eventStore, aggregate, aggregate.streamName);
  } else {
    invariant(callback, 'Callback is required');
    await loadAggregate(eventStore, aggregate, streamNameOrCallback);
    await callback(aggregate);
    await storeAggregate(eventStore, aggregate, streamNameOrCallback);
  }
  return aggregate;
}
