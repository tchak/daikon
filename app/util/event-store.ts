import invariant from 'tiny-invariant';
import { AsyncLocalStorage } from 'async_hooks';

export type EventsMap = {
  [name: string]: unknown;
};

export interface Event<Name, Data, Metadata> {
  eventId: string;
  eventType: Name;
  data: Data;
  metadata: Metadata;
}

export interface EventInit<Name, Data, Metadata> {
  type: Name;
  data: Data;
  metadata?: Partial<Metadata>;
}

export type EventHandler<Name, Data, Metadata> = (
  event: Event<Name, Data, Metadata>
) => Promise<void> | void;

export interface Broker<Events extends EventsMap, Metadata> {
  publish<Name extends keyof Events>(
    event: Event<Name, Events[Name], Metadata>
  ): Promise<void>;
  subscribe<Name extends keyof Events>(
    eventTypes: Name[],
    callback: EventHandler<Name, Events[Name], Metadata>
  ): () => void;
  subscribeToAll(
    callback: EventHandler<keyof Events, Events[keyof Events], Metadata>
  ): () => void;
}

export interface Repository<DB, Events extends EventsMap, Metadata> {
  db: DB;
  appendToStream<Name extends keyof Events>(
    events: Event<Name, Events[Name], Metadata>[],
    streamName: string
  ): Promise<void>;
  linkToStream(eventIds: string[], streamName: string): Promise<void>;
  deleteStream(streamName: string): Promise<void>;
  streamsOf(eventId: string): Promise<string[]>;
  read(
    spec: Specification<Events, Metadata>
  ): AsyncIterableIterator<Event<keyof Events, Events[keyof Events], Metadata>>;
  count(spec: Specification<Events, Metadata>): Promise<number>;
  eventInStream(eventId: string, streamName: string): Promise<boolean>;
  positionInStream(eventId: string, streamName: string): Promise<number | null>;
}

export class EventStore<DB, Events extends EventsMap, Metadata> {
  #repository: Repository<DB, Events, Metadata>;
  #broker: Broker<Events, Metadata>;
  #store = new AsyncLocalStorage<DB>();

  constructor(
    repository: Repository<DB, Events, Metadata>,
    broker: Broker<Events, Metadata>
  ) {
    this.#repository = repository;
    this.#broker = broker;
  }

  get db() {
    return this.#repository.db;
  }

  async publish<Name extends keyof Events>(
    events: Event<Name, Events[Name], Metadata>[],
    streamName: string
  ) {
    await this.#repository.appendToStream(events, streamName);
    await this.#store.run(this.#repository.db, () =>
      Promise.all(events.map((event) => this.#broker.publish(event)))
    );
  }

  async append<Name extends keyof Events>(
    events: Event<Name, Events[Name], Metadata>[],
    streamName: string
  ) {
    await this.#repository.appendToStream(events, streamName);
  }

  async link(eventIds: string[], streamName: string) {
    await this.#repository.linkToStream(eventIds, streamName);
  }

  read() {
    return new Specification<Events, Metadata>((spec) =>
      this.#repository.read(spec)
    );
  }

  async deleteStream(streamName: string) {
    await this.#repository.deleteStream(streamName);
  }

  subscribe<Name extends keyof Events>(
    eventTypes: Name[],
    cb: EventHandler<Name, Events[Name], Metadata>
  ) {
    return this.#broker.subscribe(eventTypes, cb);
  }

  subscribeToAll(
    cb: EventHandler<keyof Events, Events[keyof Events], Metadata>
  ) {
    return this.#broker.subscribeToAll(cb);
  }

  scope<ScopedEvents extends Partial<Events>>() {
    return this as any as EventStore<DB, ScopedEvents, Metadata>;
  }
}

export function createEventStore<DB, Events extends EventsMap, Metadata>(
  repository: Repository<DB, Events, Metadata>,
  broker: Broker<Events, Metadata>
) {
  return new EventStore<DB, Events, Metadata>(repository, broker);
}

export type Reader<Events extends EventsMap, Metadata> = (
  scope: Specification<Events, Metadata>
) => AsyncIterableIterator<Event<keyof Events, Events[keyof Events], Metadata>>;

export class Specification<Events extends EventsMap, Metadata> {
  #reader: Reader<Events, Metadata>;
  #streamName?: string;
  #eventTypes?: (keyof Events)[];
  #eventId?: string;
  #limit?: number;
  #offset?: number;

  get streamName() {
    return this.#streamName;
  }

  get eventTypes() {
    return this.#eventTypes;
  }

  get eventId() {
    return this.#eventId;
  }

  get limit() {
    return this.#limit;
  }

  get offset() {
    return this.#offset;
  }

  constructor(reader: Reader<Events, Metadata>) {
    this.#reader = reader;
  }

  stream(streamName: string): Specification<Events, Metadata> {
    this.#streamName = streamName;
    return this;
  }

  ofType(
    eventTypes: keyof Events | (keyof Events)[]
  ): Specification<Events, Metadata> {
    this.#eventTypes = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
    return this;
  }

  withId(eventId: string): Specification<Events, Metadata> {
    this.#eventId = eventId;
    return this;
  }

  withLimit(limit: number) {
    this.#limit = limit;
  }

  withOffset(offset: number) {
    this.#offset = offset;
  }

  async forEach(
    callback: (
      event: Event<keyof Events, Events[keyof Events], Metadata>
    ) => void
  ): Promise<void> {
    for await (const event of this.events()) {
      callback(event);
    }
  }

  async map<T>(
    callback: (event: Event<keyof Events, Events[keyof Events], Metadata>) => T
  ): Promise<T[]> {
    const events: T[] = [];
    for await (const event of this.events()) {
      events.push(callback(event));
    }
    return events;
  }

  async reduce<T>(
    callback: (
      result: T,
      event: Event<keyof Events, Events[keyof Events], Metadata>
    ) => T,
    init: T
  ): Promise<T> {
    let result: T = init;
    for await (const event of this.events()) {
      result = callback(result, event);
    }
    return result;
  }

  async toArray() {
    const events: Event<keyof Events, Events[keyof Events], Metadata>[] = [];
    for await (const event of this.events()) {
      events.push(event);
    }
    return events;
  }

  events(): AsyncIterableIterator<
    Event<keyof Events, Events[keyof Events], Metadata>
  > {
    return this.#reader(this);
  }
}

export class InMemoryBroker<Events extends EventsMap, Metadata>
  implements Broker<Events, Metadata>
{
  #handlers: Partial<{
    [Name in keyof Events]: EventHandler<Name, Events[Name], Metadata>[];
  }> = {};
  #allHandlers: EventHandler<keyof Events, Events[keyof Events], Metadata>[] =
    [];

  async publish<Name extends keyof Events>(
    event: Event<Name, Events[Name], Metadata>
  ): Promise<void> {
    const callbacks = this.#handlers[event.eventType];
    if (callbacks) {
      await Promise.all(callbacks.map((cb) => Promise.resolve(cb(event))));
    }
    await Promise.all(
      this.#allHandlers.map((cb) => Promise.resolve(cb(event)))
    );
  }

  subscribe<Name extends keyof Events>(
    eventTypes: Name[],
    cb: EventHandler<Name, Events[Name], Metadata>
  ): () => void {
    for (const eventType of eventTypes) {
      const callbacks = this.#handlers[eventType];
      if (!callbacks) {
        this.#handlers[eventType] = [];
      }
      this.#handlers[eventType]?.push(cb);
    }

    return () => {
      for (const eventType of eventTypes) {
        const callbacks = this.#handlers[eventType];
        if (callbacks) {
          this.#handlers[eventType] = callbacks.filter((_cb) => _cb != cb);
        }
      }
    };
  }

  subscribeToAll(
    cb: EventHandler<keyof Events, Events[keyof Events], Metadata>
  ): () => void {
    this.#allHandlers.push(cb);
    return () => {
      this.#allHandlers = this.#allHandlers.filter((_cb) => _cb != cb);
    };
  }
}

export type ProjectionEventHandler<State, Name, Data, Metadata> = (
  state: State,
  event: Event<Name, Data, Metadata>
) => State;

class Projection<State, Events extends EventsMap, Metadata> {
  #streamName?: string;
  #init?: () => State;
  #handlers: Partial<{
    [Name in keyof Events]: ProjectionEventHandler<
      State,
      Name,
      Events[Name],
      Metadata
    >;
  }> = {};

  constructor(streamName: string, init: () => State) {
    this.#streamName = streamName;
    this.#init = init;
  }

  when<Name extends keyof Events>(
    eventTypes: Name | Name[],
    handler: ProjectionEventHandler<State, Name, Events[Name], Metadata>
  ) {
    if (Array.isArray(eventTypes)) {
      for (const eventType of eventTypes) {
        this.#handlers[eventType] = handler;
      }
    } else {
      this.#handlers[eventTypes] = handler;
    }
    return this;
  }

  run<DB>(eventStore: EventStore<DB, Events, Metadata>): Promise<State> {
    invariant(this.#streamName, '');
    invariant(this.#init, '');
    return eventStore
      .read()
      .stream(this.#streamName)
      .ofType(Object.keys(this.#handlers))
      .reduce(
        (state, event) =>
          this.#handlers[event.eventType]?.(state, event) ?? state,
        this.#init()
      );
  }
}

export function createProjection<State, Events extends EventsMap, Metadata>(
  streamName: string,
  init: () => State
) {
  return new Projection<State, Events, Metadata>(streamName, init);
}
