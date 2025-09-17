-- Create database
CREATE DATABASE website_sekolahku;
USE website_sekolahku;

CREATE TABLE roles (
    id INT PRIMARY KEY, -- Removed AUTO_INCREMENT to allow id = 0
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Insert predefined values for roles
INSERT INTO roles (id, name) VALUES
(0, 'Admin'),
(1, 'KepalaSekolah'),
(2, 'Staff'),
(3, 'Student');

-- Optionally set AUTO_INCREMENT starting at 4 for future inserts
ALTER TABLE roles AUTO_INCREMENT = 4;

-- Create table: users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    id_role INT NOT NULL,
    data JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (id_role) REFERENCES roles(id)
);

-- Create table: role_permissions
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_role INT NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    can_create BOOLEAN NOT NULL DEFAULT FALSE,
    can_read BOOLEAN NOT NULL DEFAULT FALSE,
    can_update BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (id_role) REFERENCES roles(id)
);

-- Create table: guests
CREATE TABLE guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    address TEXT,
    purpose VARCHAR(255) NOT NULL,
    visit_date DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create table: attendance
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_user INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('hadir', 'izin', 'sakit', 'alpha', 'terlambat') NOT NULL DEFAULT 'alpha',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id)
);

-- Create table: academic_years
CREATE TABLE academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year VARCHAR(9) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create table: principal_agendas
CREATE TABLE principal_agendas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create table: surveys
CREATE TABLE surveys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    id_academic_year INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (id_academic_year) REFERENCES academic_years(id)
);

-- Create table: survey_responses
CREATE TABLE survey_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_survey INT NOT NULL,
    question VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    surveyor_name VARCHAR(255) NOT NULL,
    surveyor_details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (id_survey) REFERENCES surveys(id)
);

-- Create table: departments
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create table: classes
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    grade VARCHAR(10) NOT NULL,
    id_department INT NOT NULL,
    subgrade VARCHAR(10),
    id_academic_year INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (id_department) REFERENCES departments(id),
    FOREIGN KEY (id_academic_year) REFERENCES academic_years(id)
);
