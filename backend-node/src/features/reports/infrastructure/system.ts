import { randomUUID } from "node:crypto";

export interface IdGenerator {
  newId(): string;
}

export interface Clock {
  now(): Date;
}

export class UuidIdGenerator implements IdGenerator {
  newId(): string {
    return randomUUID();
  }
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
