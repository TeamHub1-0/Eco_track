import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.memoryStorage();

export const uploadImages = multer({
  storage,
  limits: { files: MAX_IMAGES, fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return cb(new Error("UNSUPPORTED_IMAGE_FORMAT"));
    }
    cb(null, true);
  },
}).array("images", MAX_IMAGES);

export type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export const authenticateUser = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user?.id) {
    const err = new Error("UNAUTHENTICATED") as Error & { statusCode?: number };
    err.statusCode = 401;
    return next(err);
  }
  next();
};

export const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.id ?? "1";
};

export const parseCreateBody = (req: Request) => {
  const images = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[]).map((f) => f.originalname)
    : [];

  return {
    title: req.body.title,
    description: req.body.description ?? null,
    category: req.body.category,
    latitude: req.body.latitude ? Number(req.body.latitude) : undefined,
    longitude: req.body.longitude ? Number(req.body.longitude) : undefined,
    location_source: req.body.location_source ?? "GPS",
    location_accuracy: req.body.location_accuracy
      ? Number(req.body.location_accuracy)
      : null,
    images,
  };
};

export const parseUpdateBody = (req: Request) => {
  return {
    title: req.body.title !== undefined ? req.body.title : undefined,
    description: req.body.description !== undefined ? req.body.description : undefined,
    category: req.body.category !== undefined ? req.body.category : undefined,
    latitude:
      req.body.latitude !== undefined ? Number(req.body.latitude) : undefined,
    longitude:
      req.body.longitude !== undefined ? Number(req.body.longitude) : undefined,
    location_source:
      req.body.location_source !== undefined ? req.body.location_source : undefined,
    location_accuracy:
      req.body.location_accuracy !== undefined
        ? Number(req.body.location_accuracy)
        : undefined,
  };
};

export const handleMulterError = (
  err: Error & { code?: string; statusCode?: number },
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const e = err as Error & { code?: string; statusCode?: number };
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      e.statusCode = 400;
      e.message = "Maximum of 5 photographs allowed";
    } else if (err.code === "LIMIT_FILE_SIZE") {
      e.statusCode = 413;
      e.message = "One or more photographs exceed the file-size limit";
    }
  } else if (err.message === "UNSUPPORTED_IMAGE_FORMAT") {
    e.statusCode = 415;
    e.message = "Unsupported photograph format. Use JPEG, PNG, or WEBP.";
  }
  next(err);
};
