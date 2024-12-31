CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    description VARCHAR(255),
    owner VARCHAR(100),
    semester VARCHAR(50)
);

INSERT INTO files (code, description, owner, semester)
VALUES 
('SECJ3104-01', 'Course files submission for AD Course (J) Section 01', 'John Doe', '2023/2024-1'),
('SECJ2154-07', 'Course files submission for OOP Course Section 07', 'Jane Smith', '2023/2024-1');

