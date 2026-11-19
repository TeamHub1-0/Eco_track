import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CreateReportService } from "../../../../src/features/reports/application/services/create-report.service.js";
import { InMemoryReportRepository, SequentialIds, FixedClock } from "../../../support/fakes.js";

describe("CreateReportService", () => {
  it("creates a pending report and persists it with images and history", async () => {
    const repo = new InMemoryReportRepository();
    const service = new CreateReportService(repo, new SequentialIds(), new FixedClock());

    const report = await service.execute({
      title: "Illegal dumping near riverbank",
      description: "Large pile of plastic bags.",
      category: "PLASTIC",
      latitude: -6.2088,
      longitude: 106.8456,
      locationSource: "GPS",
      locationAccuracy: 5.2,
      imagePaths: ["/storage/img-1.jpg", "/storage/img-2.jpg"],
    }, "usr-1");

    assert.strictEqual(report.status, "PENDING");
    assert.strictEqual(report.userId, "usr-1");
    assert.strictEqual(report.category, "PLASTIC");
    assert.strictEqual(report.title, "Illegal dumping near riverbank");
    assert.strictEqual(report.description, "Large pile of plastic bags.");
    assert.deepStrictEqual(report.location, { latitude: -6.2088, longitude: 106.8456 });
    assert.strictEqual(report.locationSource, "GPS");
    assert.strictEqual(report.locationAccuracy, 5.2);
    assert.strictEqual(report.images.length, 2);

    const stored = await repo.getReportById(report.id);
    assert.ok(stored);
    assert.strictEqual(stored.status, "PENDING");
    assert.strictEqual(stored.images.length, 2);
  });

  it("rejects a missing title", async () => {
    const repo = new InMemoryReportRepository();
    const service = new CreateReportService(repo, new SequentialIds(), new FixedClock());

    await assert.rejects(
      service.execute({ title: "", description: null, category: "PLASTIC", latitude: -6.2088, longitude: 106.8456, locationSource: "GPS", locationAccuracy: null, imagePaths: [] }, "usr-1"),
      { message: "title is required" },
    );
  });

  it("rejects an invalid waste category", async () => {
    const repo = new InMemoryReportRepository();
    const service = new CreateReportService(repo, new SequentialIds(), new FixedClock());

    await assert.rejects(
      service.execute({ title: "t", description: null, category: "RADIOACTIVE" as any, latitude: -6.2088, longitude: 106.8456, locationSource: "GPS", locationAccuracy: null, imagePaths: [] }, "usr-1"),
      { message: "invalid waste category" },
    );
  });

  it("rejects invalid latitude", async () => {
    const repo = new InMemoryReportRepository();
    const service = new CreateReportService(repo, new SequentialIds(), new FixedClock());

    await assert.rejects(
      service.execute({ title: "t", description: null, category: "PLASTIC", latitude: 91, longitude: 106.8456, locationSource: "GPS", locationAccuracy: null, imagePaths: [] }, "usr-1"),
      { message: "valid latitude and longitude are required" },
    );
  });

  it("rejects invalid longitude", async () => {
    const repo = new InMemoryReportRepository();
    const service = new CreateReportService(repo, new SequentialIds(), new FixedClock());

    await assert.rejects(
      service.execute({ title: "t", description: null, category: "PLASTIC", latitude: -6.2088, longitude: 200, locationSource: "GPS", locationAccuracy: null, imagePaths: [] }, "usr-1"),
      { message: "valid latitude and longitude are required" },
    );
  });

  it("rejects more than 5 images", async () => {
    const repo = new InMemoryReportRepository();
    const service = new CreateReportService(repo, new SequentialIds(), new FixedClock());

    const images = Array(6).fill("/storage/img.jpg");
    await assert.rejects(
      service.execute({ title: "t", description: null, category: "PLASTIC", latitude: -6.2088, longitude: 106.8456, locationSource: "GPS", locationAccuracy: null, imagePaths: images }, "usr-1"),
      { message: "maximum of 5 photographs allowed" },
    );
  });

  it("allows a report with no images and no description", async () => {
    const repo = new InMemoryReportRepository();
    const service = new CreateReportService(repo, new SequentialIds(), new FixedClock());

    const report = await service.execute({
      title: "Minimal report",
      description: null,
      category: "BIOLOGICAL",
      latitude: -6.2088,
      longitude: 106.8456,
      locationSource: "MANUAL",
      locationAccuracy: null,
      imagePaths: [],
    }, "usr-1");

    assert.strictEqual(report.status, "PENDING");
    assert.strictEqual(report.description, null);
    assert.deepStrictEqual(report.images, []);
  });

  it("generates sequential ids and freezes time via the fixed clock", async () => {
    const repo = new InMemoryReportRepository();
    const ids = new SequentialIds();
    const clock = new FixedClock();
    const service = new CreateReportService(repo, ids, clock);

    const first = await service.execute({ title: "one", description: null, category: "PAPER", latitude: 1, longitude: 2, locationSource: "GPS", locationAccuracy: null, imagePaths: [] }, "usr-1");
    const second = await service.execute({ title: "two", description: null, category: "PAPER", latitude: 3, longitude: 4, locationSource: "GPS", locationAccuracy: null, imagePaths: [] }, "usr-1");

    assert.strictEqual(first.id, "rep-1");
    assert.strictEqual(second.id, "rep-2");
    assert.deepStrictEqual(first.createdAt, clock.current);
    assert.deepStrictEqual(second.createdAt, clock.current);
  });
});
