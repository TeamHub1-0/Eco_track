import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import {
  uploadImages,
  handleMulterError,
} from "../../../middlewares/report.middleware";
import { CreateReportService } from "../application/services/create-report.service";
import { UpdateReportService } from "../application/services/update-report.service";
import { TrackReportService } from "../application/services/track-report.service";
import { MySQLReportRepository } from "../infrastructure/repositories/mysql-report.repository";
import { UuidIdGenerator, SystemClock } from "../infrastructure/system";

const router = Router();

const repository = new MySQLReportRepository();
const idGenerator = new UuidIdGenerator();
const clock = new SystemClock();

const createReportService = new CreateReportService(repository, idGenerator, clock);
const updateReportService = new UpdateReportService(repository, clock);
const trackReportService = new TrackReportService(repository);

const controller = new ReportController(createReportService, updateReportService, trackReportService);

router.post(
  "/reports",
  uploadImages,
  handleMulterError,
  controller.createReport,
);

router.get("/reports", controller.listReports);
router.get("/reports/nearby", controller.getNearbyReports);
router.get("/reports/:id", controller.getReport);
router.get("/reports/:id/history", controller.getReportHistory);
router.put(
  "/reports/:id",
  uploadImages,
  handleMulterError,
  controller.updateReport,
);

export default router;
