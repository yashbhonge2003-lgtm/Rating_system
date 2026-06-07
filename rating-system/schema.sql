-- Store Rating Platform Database Schema (MySQL)

CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

-- Users Table
CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `address` VARCHAR(400) DEFAULT NULL,
  `role` ENUM('admin', 'user', 'store_owner') NOT NULL DEFAULT 'user',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stores Table
CREATE TABLE `stores` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `address` VARCHAR(400) DEFAULT NULL,
  `ownerId` CHAR(36) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_stores_email` (`email`),
  KEY `FK_stores_owner` (`ownerId`),
  CONSTRAINT `FK_stores_owner` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ratings Table
CREATE TABLE `ratings` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `value` INT NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `storeId` CHAR(36) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_ratings_user_store` (`userId`, `storeId`),
  KEY `FK_ratings_user` (`userId`),
  KEY `FK_ratings_store` (`storeId`),
  CONSTRAINT `FK_ratings_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_ratings_store` FOREIGN KEY (`storeId`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_ratings_value` CHECK (`value` >= 1 AND `value` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
