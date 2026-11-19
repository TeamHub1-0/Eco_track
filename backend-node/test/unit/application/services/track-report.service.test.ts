import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TrackReportService } from "../../../../src/features/reports/application/services/track-report.service.js";
import { InMemoryReportRepository } from "../../../support/fakes.js";
import { aReport } from "../../../support/builders.js";

describe("TrackReportService", () => {
  it("returns a report owned by the user", async () => {
    const repo = new InMemoryReportRepository();
    const service = new TrackReportService(repo);
    const created = await repo.createReport(aReport({ userId: "usr-1", status: "APPROVED" }), []);

    const report = await service.getReportById(created.id, "usr-1");

    assert.strictEqual(report.id, created.id);
    assert.strictEqual(report.status, "APPROVED");
    assert.strictEqual(report.userId, "usr-1");
  });

  it("throws NotFoundError for an unknown report", async () => {
    const repo = new InMemoryReportRepository();
    const service = new TrackReportService(repo);

    await assert.rejects(
      service.getReportById("rep-missing", "usr-1"),
      { message: "report not found" },
    );
  });

  it("throws ForbiddenError when the user does not own the report", async () => {
    const repo = new InMemoryReportRepository();
    const service = new TrackReportService(repo);
    await repo.createReport(aReport({ userId: "usr-1" }), []);

    await assert.rejects(
      service.getReportById("rep-1", "usr-2"),
      { message: "you do not own this report" },
    );
  });

  it("lists a user's reports with pagination and status filter", async () => {
    const repo = new InMemoryReportRepository();
    const service = new TrackReportService(repo);
    await repo.createReport(aReport({ userId: "usr-1", status: "PENDING", id: "rep-pending-1" }), []);
    await repo.createReport(aReport({ userId: "usr-1", status: "RESOLVED", id: "rep-resolved-1" }), []);
    await repo.createReport(aReport({ userId: "usr-2", status: "PENDING", id: "rep-other-1" }), []);

    const result = await service.getReportsByUserId("usr-1", { status: "PENDING", page: 1, limit: 10 });

    assert.strictEqual(result.total, 1);
    assert.strictEqual(result.reports.length, 1);
    assert.strictEqual(result.reports[0]?.status, "PENDING");
  });

  it("paginates results", async () => {
    const repo = new InMemoryReportRepository();
    const service = new TrackReportService(repo);
    for (let i = 1; i <= 5; i++) {
      await repo.createReport(aReport({ userId: "usr-1", id: `rep-${i}` }), []);
    }

    const first = await service.getReportsByUserId("usr-1", { page: 1, limit: 2 });
    const second = await service.getReportsByUserId("usr-1", { page: 2, limit: 2 });

    assert.strictEqual(first.total, 5);
    assert.strictEqual(first.reports.length, 2);
    assert.strictEqual(second.reports.length, 2);
  });

  it("returns report history", async () => {
    const repo = new InMemoryReportRepository();
    const service = new TrackReportService(repo);
    await repo.createReport(aReport({ userId: "usr-1" }), []);

    const history = await service.getReportHistory("rep-1", "usr-1");

    assert.ok(Array.isArray(history));
    assert.strictEqual(history[0]?.newStatus, "PENDING");
  });

  it("throws NotFoundError when fetching history for an unknown report", async () => {
    const repo = new InMemoryReportRepository();
    const service = new TrackReportService(repo);

    await assert.rejects(
      service.getReportHistory("rep-missing", "usr-1"),
      { message: "report not found" },
    );
  });
});
