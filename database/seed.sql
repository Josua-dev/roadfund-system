-- ============================================================
-- Road Fund Administration Namibia
-- Seed / Sample Data
-- ============================================================

USE roadfund_system;

-- ============================================================
-- REGIONS
-- ============================================================
INSERT INTO regions (name, code) VALUES
('Khomas', 'KHO'),
('Erongo', 'ERO'),
('Oshana', 'OSH'),
('Omusati', 'OMU'),
('Kavango East', 'KVE'),
('Kavango West', 'KVW'),
('Kunene', 'KUN'),
('Otjozondjupa', 'OTJ'),
('Omaheke', 'OMA'),
('Hardap', 'HAR'),
('//Karas', 'KAR'),
('Zambezi', 'ZAM'),
('Oshikoto', 'OKT'),
('Ohangwena', 'OHW');

-- ============================================================
-- USERS  (passwords are all: Password123!)
-- bcrypt hash of "Password123!"
-- ============================================================
INSERT INTO users (full_name, email, password_hash, role, region_id, phone) VALUES
('System Administrator', 'admin@roadfund.na', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJOBDEX9hSB3sOFZ6MKrKdtm', 'admin', 1, '+264 61 000 0001'),
('Thomas Nambahu', 'inspector@roadfund.na', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJOBDEX9hSB3sOFZ6MKrKdtm', 'inspector', 1, '+264 61 000 0002'),
('Maria Hamutenya', 'officer@roadfund.na', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJOBDEX9hSB3sOFZ6MKrKdtm', 'maintenance_officer', 1, '+264 61 000 0003'),
('John Citizen', 'citizen@roadfund.na', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJOBDEX9hSB3sOFZ6MKrKdtm', 'citizen', 2, '+264 81 000 0004'),
('Aune Shivute', 'aune@example.na', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJOBDEX9hSB3sOFZ6MKrKdtm', 'citizen', 3, '+264 81 111 1111'),
('David Nakale', 'david@example.na', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJOBDEX9hSB3sOFZ6MKrKdtm', 'citizen', 2, '+264 81 222 2222'),
('Inspector Heita', 'heita@roadfund.na', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJOBDEX9hSB3sOFZ6MKrKdtm', 'inspector', 2, '+264 61 333 3333'),
('Officer Katiti', 'katiti@roadfund.na', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJOBDEX9hSB3sOFZ6MKrKdtm', 'maintenance_officer', 3, '+264 61 444 4444');

-- ============================================================
-- REPORTS
-- ============================================================
INSERT INTO reports (report_number, title, description, issue_type, severity, status, region_id, latitude, longitude, address, reported_by, assigned_to, progress_percent) VALUES
('RF-2024-0001', 'Large Pothole on B1 Highway', 'Massive pothole causing vehicle damage near Windhoek North. Approximately 1.5m wide and 30cm deep. Multiple vehicles have sustained damage.', 'pothole', 'critical', 'in_progress', 1, -22.5597, 17.0832, 'B1 Highway, Windhoek North, Khomas', 4, 3, 65),
('RF-2024-0002', 'Damaged Road Sign at Intersection', 'Speed limit sign knocked over and missing. Dangerous for drivers approaching the intersection at high speed.', 'damaged_sign', 'high', 'verified', 2, -22.9576, 14.5053, 'Sam Nujoma Drive, Swakopmund, Erongo', 5, NULL, 0),
('RF-2024-0003', 'Broken Traffic Light at Main Junction', 'Traffic light has been non-functional for 3 days. Causing major traffic congestion and near-accidents.', 'broken_traffic_light', 'critical', 'assigned', 1, -22.5609, 17.0658, 'Independence Ave & Robert Mugabe Ave, Windhoek', 6, 3, 10),
('RF-2024-0004', 'Flooded Road After Heavy Rain', 'Road completely flooded making it impassable. Water is approximately 50cm deep across the full width.', 'flooded_road', 'high', 'reported', 3, -17.9083, 15.7562, 'Main Road B1, Oshakati, Oshana', 5, NULL, 0),
('RF-2024-0005', 'Severe Road Cracking on C28', 'Multiple deep cracks across the road surface. Structural integrity appears compromised. Immediate attention required.', 'cracked_road', 'critical', 'completed', 4, -18.7329, 15.6837, 'C28, Outapi, Omusati', 4, 3, 100),
('RF-2024-0006', 'Road Blockage Due to Fallen Tree', 'Large tree has fallen across the road completely blocking both lanes. Vehicles unable to pass.', 'road_blockage', 'high', 'completed', 1, -22.6788, 17.1234, 'Sam Nujoma Drive, Windhoek', 6, 3, 100),
('RF-2024-0007', 'Multiple Potholes Near School', 'Several potholes in front of school zone. Dangerous for school buses and children crossing. Needs urgent repair.', 'pothole', 'high', 'under_review', 2, -22.9801, 14.5209, 'School Street, Swakopmund', 5, NULL, 0),
('RF-2024-0008', 'Gravel Road Erosion After Floods', 'Heavy rainfall has eroded large sections of the gravel road. Multiple sections are now impassable.', 'cracked_road', 'medium', 'reported', 5, -17.9560, 20.1234, 'D3700, Rundu, Kavango East', 4, NULL, 0),
('RF-2024-0009', 'Missing Road Markings on Highway', 'Lane markings have completely faded on a 2km stretch. Dangerous at night and in rainy conditions.', 'damaged_sign', 'medium', 'verified', 1, -22.5400, 17.1100, 'Trans-Kalahari Highway, Khomas', 6, NULL, 0),
('RF-2024-0010', 'Pothole Cluster Near Traffic Circle', 'Cluster of 5-6 potholes near the traffic circle. Depth ranges from 15-25cm. Very hazardous.', 'pothole', 'high', 'in_progress', 2, -22.9623, 14.5071, 'Walvis Bay Road, Swakopmund', 5, 8, 40);

-- ============================================================
-- MAINTENANCE TASKS
-- ============================================================
INSERT INTO maintenance_tasks (report_id, assigned_team, assigned_officer, inspector_id, status, priority, start_date, estimated_completion, progress_percent, notes, cost_estimate) VALUES
(1, 'Alpha Repair Team', 3, 2, 'in_progress', 'urgent', '2024-03-15', '2024-03-25', 65, 'Excavation complete, filling in progress. Road surface will be repaved.', 85000.00),
(3, 'Beta Repair Team', 3, 2, 'in_progress', 'urgent', '2024-03-18', '2024-03-20', 10, 'Electrical team dispatched. Parts ordered from supplier.', 45000.00),
(5, 'Gamma Road Team', 8, 7, 'completed', 'high', '2024-02-01', '2024-02-20', 100, 'Full resurfacing completed. Quality inspection passed.', 320000.00),
(6, 'Emergency Response', 3, 2, 'completed', 'urgent', '2024-03-10', '2024-03-10', 100, 'Tree removed within 2 hours. Road cleared and reopened.', 15000.00),
(10, 'Alpha Repair Team', 8, 7, 'in_progress', 'high', '2024-03-20', '2024-03-30', 40, 'First 3 potholes filled. Remaining work in progress.', 65000.00);

-- ============================================================
-- STATUS HISTORY
-- ============================================================
INSERT INTO status_history (report_id, old_status, new_status, changed_by, notes) VALUES
(1, NULL, 'reported', 4, 'Initial report submitted by citizen'),
(1, 'reported', 'under_review', 2, 'Assigned to inspection queue'),
(1, 'under_review', 'verified', 2, 'Field inspection confirmed critical pothole'),
(1, 'verified', 'assigned', 1, 'Assigned to maintenance team'),
(1, 'assigned', 'in_progress', 3, 'Repair work commenced'),
(5, NULL, 'reported', 4, 'Initial report submitted'),
(5, 'reported', 'verified', 7, 'Verified by regional inspector'),
(5, 'verified', 'assigned', 1, 'Assigned to Gamma Road Team'),
(5, 'assigned', 'in_progress', 8, 'Work started'),
(5, 'in_progress', 'completed', 8, 'Resurfacing complete, road reopened');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, message, type, report_id, is_read) VALUES
(4, 'Report Status Updated', 'Your report RF-2024-0001 status changed to In Progress', 'status_update', 1, 0),
(4, 'Report Completed', 'Your report RF-2024-0005 has been successfully resolved!', 'success', 5, 1),
(3, 'New Assignment', 'You have been assigned to repair report RF-2024-0001', 'assignment', 1, 1),
(2, 'Inspection Required', 'New critical report RF-2024-0002 needs inspection', 'alert', 2, 0),
(5, 'Report Received', 'Your road report has been received and is under review', 'info', 7, 0);

-- ============================================================
-- INSPECTION REPORTS
-- ============================================================
INSERT INTO inspection_reports (report_id, inspector_id, findings, recommendation, verified) VALUES
(1, 2, 'Pothole measures 1.8m x 1.2m x 35cm depth. Asphalt failure due to water infiltration. Surrounding area shows signs of further deterioration.', 'Immediate full-depth patch repair required. Recommend milling 2m radius around pothole and full repave.', 1),
(5, 7, 'Multiple transverse cracks observed over 500m section. Subgrade failure suspected. Cracking width ranges 5-20mm.', 'Full reconstruction recommended for affected section. Drainage improvements needed to prevent recurrence.', 1),
(9, 2, 'Lane markings completely absent over 2.1km. No edge lines or center markings visible. Night visibility extremely poor.', 'Thermoplastic road marking application required over entire affected section.', 1);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) VALUES
(1, 'CREATE_USER', 'users', 2, '127.0.0.1'),
(1, 'CREATE_USER', 'users', 3, '127.0.0.1'),
(4, 'SUBMIT_REPORT', 'reports', 1, '127.0.0.1'),
(2, 'UPDATE_STATUS', 'reports', 1, '127.0.0.1'),
(3, 'UPDATE_PROGRESS', 'maintenance_tasks', 1, '127.0.0.1');
