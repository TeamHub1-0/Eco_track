import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UpdateReportService } from "../../../../src/features/reports/application/services/update-report.service.js";
import { InMemoryReportRepository, FixedClock } from "../../../support/fakes.js";
import { aReport } from "../../../support/builders.js";

describe("UpdateReportService", () => {
  it("updates a PENDING report and records the change", async () => {
    const repo = new InMemoryReportRepository();
    const clock = new FixedClock();
    const service = new UpdateReportService(repo, clock);
    const created = await repo.createReport(aReport({ userId: "usr-1" }), []);

    const updated = await service.execute(created.id, {
      title: "Updated title",
      category: "GLASS",
      description: "New description",
    }, "usr-1");

    assert.strictEqual(updated.title, "Updated title");
    assert.strictEqual(updated.category, "GLASS");
    assert.strictEqual(updated.description, "New description");
    assert.deepStrictEqual(updated.status, "PENDING");
  });

  it("updates location when latitude and longitude are provided together", async () => {
    const repo = new InMemoryReportRepository();
    const service = new UpdateReportService(repo, new FixedClock());
    const created = await repo.createReport(aReport({ userId: "usr-1" }), []);

    const updated = await service.execute(created.id, { latitude: -7.0, longitude: 107.0 }, "usr-1");

    assert.deepStrictEqual(updated.location, { latitude: -7.0, longitude: 107.0 });
  });

  it("rejects editing a report that is not PENDING", async () => {
    const repo = new InMemoryReportRepository();
    const service = new UpdateReportService(repo, new FixedClock());
    const created = await repo.createReport(aReport({ userId: "usr-1", status: "APPROVED" }), []);

    await assert.rejects(
      service.execute(created.id, { title: "t" }, "usr-1"),
      { message: "report cannot be modified in its current status" },
    );
  });

  it("rejects editing another user's report", async () => {
    const repo = new InMemoryReportRepository();
    const service = new UpdateReportService(repo, new FixedClock());
    const created = await repo.createReport(aReport({ userId: "usr-1" }), []);

    await assert.rejects(
      service.execute(created.id, { title: "t" }, "usr-2"),
      { message: "you do not own this report" },
    );
  });

  it("rejects a missing title on update", async () => {
    const repo = new InMemoryReportRepository();
    const service = new UpdateReportService(repo, new FixedClock());
    const created = await repo.createReport(aReport({ userId: "usr-1" }), []);

    await assert.rejects(
      service.execute(created.id, { title: "" }, "usr-1"),
      { message: "title is required" },
    );
  });

  it("rejects latitude without longitude", async () => {
    const repo = new InMemoryReportRepository();
    const service = new UpdateReportService(repo, new FixedClock());
    const created = await repo.createReport(aReport({ userId: "usr-1" }), []);

    await assert.rejects(
      service.execute(created.id, { latitude: -6.2088 } as any, "usr-1"),
      { message: "latitude and longitude must be provided together" },
    );
  });

  it("returns the existing report when no updatable fields are provided", async () => {
    const repo = new InMemoryReportRepository();
    const service = new UpdateReportService(repo, new FixedClock());
    const created = await repo.createReport(aReport({ userId: "usr-1", title: "Original" }), []);

    const updated = await service.execute(created.id, {}, "usr-1");

    assert.strictEqual(updated.title, "Original");
  });
});
