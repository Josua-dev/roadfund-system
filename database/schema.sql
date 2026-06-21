-- ============================================================
-- Road Fund Administration Namibia
-- Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS roadfund_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE roadfund_system;

-- ============================================================
-- REGIONS
-- ============================================================
CREATE TABLE regions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('citizen','inspector','maintenance_officer','admin') NOT NULL DEFAULT 'citizen',
  region_id INT,
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  email_verified TINYINT(1) DEFAULT 0,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_number VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  issue_type ENUM(
    'pothole','damaged_sign','broken_traffic_light',
    'flooded_road','cracked_road','road_blockage','other'
  ) NOT NULL,
  severity ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM(
    'reported','under_review','verified',
    'assigned','in_progress','completed','rejected'
  ) NOT NULL DEFAULT 'reported',
  region_id INT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  reported_by INT NOT NULL,
  assigned_to INT,
  progress_percent TINYINT DEFAULT 0,
  rejection_reason TEXT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES regions(id),
  FOREIGN KEY (reported_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  INDEX idx_region (region_id),
  INDEX idx_reported_by (reported_by)
);

-- ============================================================
-- MAINTENANCE TASKS
-- ============================================================
CREATE TABLE maintenance_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  assigned_team VARCHAR(150),
  assigned_officer INT,
  inspector_id INT,
  status ENUM('pending','in_progress','completed','paused') DEFAULT 'pending',
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  start_date DATE,
  estimated_completion DATE,
  actual_completion DATE,
  progress_percent TINYINT DEFAULT 0,
  notes TEXT,
  cost_estimate DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_officer) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- ATTACHMENTS
-- ============================================================
CREATE TABLE attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ============================================================
-- STATUS HISTORY (TIMELINE)
-- ============================================================
CREATE TABLE status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('status_update','assignment','alert','info','success') DEFAULT 'info',
  report_id INT,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL,
  INDEX idx_user_read (user_id, is_read)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (user_id)
);

-- ============================================================
-- INSPECTION_REPORTS
-- ============================================================
CREATE TABLE inspection_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  report_id INT NOT NULL,
  inspector_id INT NOT NULL,
  findings TEXT,
  recommendation TEXT,
  verified TINYINT(1) DEFAULT 0,
  inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (inspector_id) REFERENCES users(id)
);

-- ── Report number sequence (race-condition-safe counter) ──────
-- Run once as a migration if the table doesn't exist
CREATE TABLE IF NOT EXISTS report_sequences (
  year      SMALLINT UNSIGNED NOT NULL,
  last_seq  INT UNSIGNED      NOT NULL DEFAULT 0,
  PRIMARY KEY (year)
) ENGINE=InnoDB;
