import { z } from 'zod';

import { DB } from './db.server';
import {
  createEventStore,
  Event,
  EventsMap,
  Repository,
  Specification,
  InMemoryBroker,
} from './event-store';

type Literal = boolean | null | number | string;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonLiteral = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const json: z.ZodSchema<Json> = z.lazy(() =>
  z.union([jsonLiteral, z.array(json), z.record(json)])
);

const DBEvent = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),
  metadata: z.record(json),
  data: z.record(json),
});

export class PrismaRepository<Events extends EventsMap, Metadata>
  implements Repository<DB, Events, Metadata>
{
  #db: DB;
  constructor(db: DB) {
    this.#db = db;
  }

  get db() {
    return this.#db;
  }

  async appendToStream<Name extends keyof Events>(
    events: Event<Name, Events[Name], Metadata>[],
    streamName?: string
  ): Promise<void> {
    await this.#db.event.createMany({
      data: events.map((event) => DBEvent.parse(event)),
    });
    if (streamName) {
      await linkToStream(
        this.#db,
        events.map(({ eventId }) => eventId),
        streamName,
        false
      );
    }
  }

  linkToStream(eventIds: string[], streamName: string): Promise<void> {
    return linkToStream(this.#db, eventIds, streamName);
  }

  read(
    spec: Specification<Events, Metadata>
  ): AsyncIterableIterator<
    Event<keyof Events, Events[keyof Events], Metadata>
  > {
    return readEventsIterator(this.#db, spec);
  }

  count(spec: Specification<Events, Metadata>): Promise<number> {
    return countEvents(this.#db, spec);
  }

  async eventInStream(eventId: string, streamName: string): Promise<boolean> {
    const event = await this.#db.eventInStream.findFirst({
      where: { stream: streamName, eventId },
      select: { id: true },
    });
    return !!event;
  }

  async positionInStream(
    eventId: string,
    streamName: string
  ): Promise<number | null> {
    const position = await this.#db.eventInStream.findFirst({
      where: { stream: streamName, eventId },
      select: { position: true },
    });
    return position?.position ?? null;
  }

  async deleteStream(streamName: string): Promise<void> {
    await this.#db.eventInStream.deleteMany({ where: { stream: streamName } });
  }

  async streamsOf(eventId: string): Promise<string[]> {
    const streams = await this.#db.eventInStream.findMany({
      distinct: 'stream',
      where: { eventId },
      select: { stream: true },
    });
    return streams.map(({ stream }) => stream);
  }
}

export function createPrismaEventStore<Events extends EventsMap, Metadata>(
  db: DB
) {
  return createEventStore(
    new PrismaRepository<Events, Metadata>(db),
    new InMemoryBroker<Events, Metadata>()
  );
}

async function getLastPositionInStream(
  db: DB,
  streamName: string
): Promise<number> {
  const stream = await db.eventInStream.findFirst({
    orderBy: { position: 'desc' },
    where: { stream: streamName },
    select: { position: true },
  });
  return stream?.position ?? 0;
}

async function linkToStream(
  db: DB,
  eventIds: string[],
  streamName: string,
  checkUniqueness = true
): Promise<void> {
  const events = new Set(eventIds);
  if (checkUniqueness) {
    const eventIdsInStream = await db.eventInStream.findMany({
      where: { stream: streamName, eventId: { in: eventIds } },
      select: { eventId: true },
    });
    for (const { eventId } of eventIdsInStream) {
      events.delete(eventId);
    }
  }
  const position = await getLastPositionInStream(db, streamName);
  await db.eventInStream.createMany({
    data: [...events].map((eventId: string, index: number) => ({
      eventId,
      stream: streamName,
      position: position + index + 1,
    })),
  });
}

function whereEventTypes<Name>(
  eventTypes?: Name[]
): string | { in: string[] } | undefined {
  return eventTypes
    ? eventTypes.length == 1
      ? String(eventTypes[0])
      : { in: eventTypes.map((eventType) => String(eventType)) }
    : undefined;
}

const PAGE_SIZE = 1000;

function readEventsIterator<Events extends EventsMap, Metadata>(
  db: DB,
  spec: Specification<Events, Metadata>
): AsyncIterableIterator<Event<keyof Events, Events[keyof Events], Metadata>> {
  let take = spec.offset ?? 0;
  let current = -1;
  let loadedPage: Event<keyof Events, Events[keyof Events], Metadata>[];

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {
      if (spec.limit && spec.limit == take + current + 1) {
        return { done: true, value: null };
      }
      current += 1;

      if (!loadedPage) {
        loadedPage = await readEvents(
          db,
          spec.streamName,
          spec.eventTypes,
          spec.limit ? Math.min(PAGE_SIZE, spec.limit) : PAGE_SIZE,
          take
        );
        if (loadedPage.length == 0) {
          return { done: true, value: null };
        }
      }
      if (loadedPage[current]) {
        return { value: loadedPage[current] };
      } else {
        take += PAGE_SIZE;
        loadedPage = await readEvents(
          db,
          spec.streamName,
          spec.eventTypes,
          PAGE_SIZE,
          take
        );
        if (loadedPage.length == 0) {
          return { done: true, value: null };
        }
        return { value: loadedPage[current] };
      }
    },
  };
}

async function readEvents<Events extends EventsMap, Metadata>(
  db: DB,
  streamName?: string,
  eventTypes?: (keyof Events)[],
  take?: number,
  skip?: number
) {
  const events = await db.event.findMany({
    where: {
      eventType: whereEventTypes(eventTypes),
      streams: streamName ? { some: { stream: streamName } } : undefined,
    },
    orderBy: { id: 'asc' },
    take,
    skip,
    select: { eventId: true, eventType: true, data: true, metadata: true },
  });
  return events.map(
    (event) =>
      DBEvent.parse(event) as any as Event<
        keyof Events,
        Events[keyof Events],
        Metadata
      >
  );
}

function countEvents<Events extends EventsMap, Metadata>(
  db: DB,
  spec: Specification<Events, Metadata>
) {
  return db.event.count({
    where: {
      eventType: whereEventTypes(spec.eventTypes),
      streams: spec.streamName
        ? { some: { stream: spec.streamName } }
        : undefined,
    },
    take: spec.limit,
    skip: spec.offset,
  });
}
