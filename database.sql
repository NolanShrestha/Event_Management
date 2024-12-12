CREATE DATABASE IF NOT EXISTS Event_db;
DROP DATABASE IF EXISTS Event_db;
USE Event_db;

CREATE TABLE roles (
    id CHAR(36) NOT NULL PRIMARY KEY,     
    role_name VARCHAR(50) NOT NULL UNIQUE    
);

CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,      
    name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role_id CHAR(36) NOT NULL,              
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) 
);

CREATE TABLE events (
    id CHAR(36) NOT NULL PRIMARY KEY,       
    title VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    event_date DATETIME NOT NULL,                     
    created_by CHAR(36) NOT NULL, 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) 
);

CREATE TABLE bookings (
    id CHAR(36) NOT NULL PRIMARY KEY,        
    event_id CHAR(36) NOT NULL,             
    user_id CHAR(36) NOT NULL,              
    booking_date DATETIME NOT NULL,  
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id) 
);

INSERT INTO roles (id, role_name)
VALUES 
    (UUID(), 'admin'), 
    (UUID(), 'user');
