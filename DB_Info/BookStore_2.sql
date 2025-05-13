-- Create and initialize Bookstore_v2 schema
CREATE SCHEMA IF NOT EXISTS `Bookstore_v2`;
USE `Bookstore_v2`;

-- Disable foreign key checks during setup
SET FOREIGN_KEY_CHECKS = 0;

-- Admins table (for managing books, magazines, and discounts)
CREATE TABLE IF NOT EXISTS `Admins` (
  `admin_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Customers table
CREATE TABLE IF NOT EXISTS `Customers` (
  `customer_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Disciplines table (e.g., Language, Novel, Technology, etc.)
CREATE TABLE IF NOT EXISTS `Disciplines` (
  `discipline_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- Books table
CREATE TABLE IF NOT EXISTS `Books` (
  `book_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `isbn` VARCHAR(20) UNIQUE NOT NULL,
  `publisher` VARCHAR(100),
  `publication_year` YEAR,
  `price` DECIMAL(10,2) NOT NULL,
  `stock_quantity` INT DEFAULT 0,
  `description` TEXT,
  `created_by_admin` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by_admin`) REFERENCES `Admins`(`admin_id`)
) ENGINE=InnoDB;

-- Magazines table
CREATE TABLE IF NOT EXISTS `Magazines` (
  `magazine_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `issn` VARCHAR(20) UNIQUE NOT NULL,
  `publisher` VARCHAR(100),
  `issue_date` DATE,
  `price` DECIMAL(10,2) NOT NULL,
  `stock_quantity` INT DEFAULT 0,
  `description` TEXT,
  `created_by_admin` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by_admin`) REFERENCES `Admins`(`admin_id`)
) ENGINE=InnoDB;

-- Link tables for disciplines (many-to-many)
CREATE TABLE IF NOT EXISTS `BookDisciplines` (
  `book_id` INT NOT NULL,
  `discipline_id` INT NOT NULL,
  PRIMARY KEY (`book_id`, `discipline_id`),
  FOREIGN KEY (`book_id`) REFERENCES `Books`(`book_id`),
  FOREIGN KEY (`discipline_id`) REFERENCES `Disciplines`(`discipline_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `MagazineDisciplines` (
  `magazine_id` INT NOT NULL,
  `discipline_id` INT NOT NULL,
  PRIMARY KEY (`magazine_id`, `discipline_id`),
  FOREIGN KEY (`magazine_id`) REFERENCES `Magazines`(`magazine_id`),
  FOREIGN KEY (`discipline_id`) REFERENCES `Disciplines`(`discipline_id`)
) ENGINE=InnoDB;

-- Authors table
CREATE TABLE IF NOT EXISTS `Authors` (
  `author_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `bio` TEXT,
  `birth_date` DATE
) ENGINE=InnoDB;

-- BookAuthors many-to-many
CREATE TABLE IF NOT EXISTS `BookAuthors` (
  `book_id` INT NOT NULL,
  `author_id` INT NOT NULL,
  PRIMARY KEY (`book_id`, `author_id`),
  FOREIGN KEY (`book_id`) REFERENCES `Books`(`book_id`),
  FOREIGN KEY (`author_id`) REFERENCES `Authors`(`author_id`)
) ENGINE=InnoDB;

-- Discounts table
CREATE TABLE IF NOT EXISTS `Discounts` (
  `discount_id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_type` ENUM('book','magazine') NOT NULL,
  `item_id` INT NOT NULL,
  `discount_percent` DECIMAL(5,2) NOT NULL CHECK (`discount_percent` BETWEEN 0 AND 100),
  `start_date` DATE,
  `end_date` DATE,
  `created_by_admin` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by_admin`) REFERENCES `Admins`(`admin_id`),
  INDEX (`item_type`, `item_id`)
) ENGINE=InnoDB;

-- Reviews table
CREATE TABLE IF NOT EXISTS `Reviews` (
  `review_id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_type` ENUM('book','magazine') NOT NULL,
  `item_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `review_text` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`customer_id`),
  INDEX (`item_type`, `item_id`)
) ENGINE=InnoDB;

-- Carts and CartItems
CREATE TABLE IF NOT EXISTS `Carts` (
  `cart_id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNIQUE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`customer_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `CartItems` (
  `cart_id` INT NOT NULL,
  `item_type` ENUM('book','magazine') NOT NULL,
  `item_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  PRIMARY KEY (`cart_id`, `item_type`, `item_id`),
  FOREIGN KEY (`cart_id`) REFERENCES `Carts`(`cart_id`)
) ENGINE=InnoDB;

-- Orders and OrderItems
CREATE TABLE IF NOT EXISTS `Orders` (
  `order_id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  `total_amount` DECIMAL(10,2),
  FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`customer_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `OrderItems` (
  `order_item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `item_type` ENUM('book','magazine') NOT NULL,
  `item_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price_at_order` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `Orders`(`order_id`)
) ENGINE=InnoDB;

-- Payments table (recording checkout payments)
CREATE TABLE IF NOT EXISTS `Payments` (
  `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `amount` DECIMAL(10,2) NOT NULL,
  `method` ENUM('cash','credit_card','debit_card','online') NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `Orders`(`order_id`)
) ENGINE=InnoDB;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
