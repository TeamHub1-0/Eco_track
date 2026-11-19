import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Report } from "../../../src/features/reports/domain/entities/report.entity.js";
import { ReportId, UserId } from "../../../src/features/reports/domain/entities/types.js";
import { aReport, NOW } from "../../support/builders.js";

describe("Report entity", () => {
  it("creates a report with PENDING status", () => {
    const report = Report.create({
      id: ReportId("rep-1"),
      userId: UserId("usr-1"),
      category: "PLASTIC",
      title: "Illegal dumping",
      description: null,
      location: { latitude: -6.2088, longitude: 106.8456 },
      locationSource: "GPS",
      locationAccuracy: 5.2,
      now: NOW,
    });

    assert.strictEqual(report.status, "PENDING");
    assert.strictEqual(report.id, "rep-1");
    assert.strictEqual(report.userId, "usr-1");
    assert.strictEqual(report.category, "PLASTIC");
    assert.strictEqual(report.title, "Illegal dumping");
    assert.strictEqual(report.description, null);
    assert.deepStrictEqual(report.location, { latitude: -6.2088, longitude: 106.8456 });
    assert.strictEqual(report.locationSource, "GPS");
    assert.strictEqual(report.locationAccuracy, 5.2);
    assert.deepStrictEqual(report.images, []);
    assert.deepStrictEqual(report.createdAt, NOW);
    assert.strictEqual(report.updatedAt, null);
  });

  it("rehydrates a report with its images and status", () => {
    const report = aReport({
      status: "APPROVED",
      images: [{ id: "img-1", imagePath: "/storage/img-1.jpg", createdAt: NOW }],
    });

    assert.strictEqual(report.status, "APPROVED");
    assert.strictEqual(report.images.length, 1);
    assert.strictEqual(report.images[0]?.imagePath, "/storage/img-1.jpg");
  });

  it("applies changes via withChanges and updates updatedAt", () => {
    const later = new Date("2026-01-16T12:00:00Z");
    const updated = aReport().withChanges({
      title: "Updated title",
      category: "GLASS",
    }, later);

    assert.strictEqual(updated.title, "Updated title");
    assert.strictEqual(updated.category, "GLASS");
    assert.strictEqual(updated.description, null);
    assert.deepStrictEqual(updated.location, { latitude: -6.2088, longitude: 106.8456 });
    assert.deepStrictEqual(updated.updatedAt, later);
    assert.deepStrictEqual(updated.createdAt, NOW);
    assert.strictEqual(updated.status, "PENDING");
  });

  it("withChanges preserves fields not provided", () => {
    const updated = aReport({ title: "Original", category: "PLASTIC" }).withChanges(
      { description: "New description" },
      NOW,
    );

    assert.strictEqual(updated.title, "Original");
    assert.strictEqual(updated.category, "PLASTIC");
    assert.strictEqual(updated.description, "New description");
  });
});
