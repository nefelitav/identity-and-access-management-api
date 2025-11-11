import { DomainEvent } from "~/domain";

export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: EventHandler<T>,
  ): void;
  unsubscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: EventHandler<T>,
  ): void;
}

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const eventHandlers = this.handlers.get(eventType) || [];

    // Execute handlers in parallel
    await Promise.all(
      eventHandlers.map((handler) =>
        handler.handle(event).catch((error) => {
          console.error(`Error handling event ${eventType}:`, error);
          // Don't throw to prevent one handler failure from affecting others
        }),
      ),
    );
  }

  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: EventHandler<T>,
  ): void {
    const eventTypeName = eventType.name;
    const handlers = this.handlers.get(eventTypeName) || [];
    handlers.push(handler);
    this.handlers.set(eventTypeName, handlers);
  }

  unsubscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: EventHandler<T>,
  ): void {
    const eventTypeName = eventType.name;
    const handlers = this.handlers.get(eventTypeName) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.handlers.set(eventTypeName, handlers);
    }
  }
}

// Event Store for persistence
export interface EventStore {
  saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number,
  ): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsFromVersion(
    aggregateId: string,
    fromVersion: number,
  ): Promise<DomainEvent[]>;
}

export class InMemoryEventStore implements EventStore {
  private events = new Map<string, DomainEvent[]>();

  async saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number,
  ): Promise<void> {
    const existingEvents = this.events.get(aggregateId) || [];

    if (existingEvents.length !== expectedVersion) {
      throw new Error(`Concurrency conflict for aggregate ${aggregateId}`);
    }

    const allEvents = [...existingEvents, ...events];
    this.events.set(aggregateId, allEvents);
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events.get(aggregateId) || [];
  }

  async getEventsFromVersion(
    aggregateId: string,
    fromVersion: number,
  ): Promise<DomainEvent[]> {
    const allEvents = this.events.get(aggregateId) || [];
    return allEvents.slice(fromVersion);
  }
}
export { DomainEvent };
