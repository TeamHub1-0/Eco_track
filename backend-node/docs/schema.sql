-- EcoTrack MySQL schema (derived from Docs/database/garbageReport.db)

CREATE DATABASE IF NOT EXISTS ecotrack
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecotrack;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL UNIQUE,
  profile_picture VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
);

INSERT INTO users (id, name, email, password) VALUES (1, 'Anonymous', 'anonymous@ecotrack.local', 'x') ON DUPLICATE KEY UPDATE id=id;

CREATE TABLE IF NOT EXISTS garbage_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  category ENUM('PLASTIC','PAPER','GLASS','METAL','CARDBOARD','BIOLOGICAL') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location POINT NOT NULL SRID 4326,
  location_source ENUM('GPS','MANUAL') NOT NULL,
  location_accuracy FLOAT,
  status ENUM('PENDING','APPROVED','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status_created (status, created_at),
  SPATIAL INDEX idx_location (location),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS report_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  report_id BIGINT NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES garbage_reports(id)
);