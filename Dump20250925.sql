-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (x86_64)
--
-- Host: localhost    Database: ecommerce_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,'ORD-001','Wireless Bluetooth Headphones',1,129.99,129.99,'2025-09-25 15:55:21'),(2,'ORD-002','USB-C Charging Cable',2,24.75,49.50,'2025-09-25 15:55:21'),(3,'ORD-002','Phone Case',1,39.99,39.99,'2025-09-25 15:55:21'),(4,'ORD-003','Gaming Mouse',1,79.99,79.99,'2025-09-25 15:55:21'),(5,'ORD-003','Mechanical Keyboard',1,119.99,119.99,'2025-09-25 15:55:21'),(6,'ORD-1758820302924-ke6sxlmp8','Team Tee',2,24.99,49.98,'2025-09-25 17:11:43'),(7,'ORD-1758820302924-ke6sxlmp8','Logo Hat',1,19.99,19.99,'2025-09-25 17:11:43'),(8,'ORD-1758820636153-iqoyxcrue','Team Tee',2,24.99,49.98,'2025-09-25 17:17:16'),(9,'ORD-1758820636153-iqoyxcrue','Logo Hat',1,19.99,19.99,'2025-09-25 17:17:16'),(10,'ORD-1758835011884-ouxq2acby','Team Tee',2,24.99,49.98,'2025-09-25 21:16:52'),(11,'ORD-1758835011884-ouxq2acby','Logo Hat',1,19.99,19.99,'2025-09-25 21:16:52'),(12,'ORD-1758835408748-4g4taa68z','Team Tee',2,24.99,49.98,'2025-09-25 21:23:28'),(13,'ORD-1758835408748-4g4taa68z','Logo Hat',1,19.99,19.99,'2025-09-25 21:23:28');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `customer_first_name` varchar(100) NOT NULL,
  `customer_last_name` varchar(100) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `shipping_address` text NOT NULL,
  `billing_address` text,
  `total_amount` decimal(10,2) NOT NULL,
  `order_status` enum('pending','authorized','captured','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_customer_email` (`customer_email`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-001','John','Doe','john@example.com','+1-555-0123','123 Main St, Anytown, USA 12345',NULL,129.99,'authorized','2025-09-25 15:55:21','2025-09-25 15:55:21'),(2,'ORD-002','Jane','Smith','jane@example.com','+1-555-0456','456 Oak Ave, Another City, USA 67890',NULL,89.50,'captured','2025-09-25 15:55:21','2025-09-25 15:55:21'),(3,'ORD-003','Bob','Johnson','bob@example.com','+1-555-0789','789 Pine Rd, Third Town, USA 13579',NULL,199.99,'shipped','2025-09-25 15:55:21','2025-09-25 15:55:21'),(4,'ORD-1758820302924-ke6sxlmp8','Belen','Guevara','bguevar2@students.kennesaw.edu','','123 Main St, City, State 12345','123 Main St, City, State 12345',80.57,'authorized','2025-09-25 17:11:43','2025-09-25 17:11:43'),(5,'ORD-1758820636153-iqoyxcrue','Rebeca','Guevara','bguevar2@students.kennesaw.edu','','123 Main St, City, State 12345','123 Main St, City, State 12345',80.57,'authorized','2025-09-25 17:17:16','2025-09-25 17:17:16'),(6,'ORD-1758835011884-ouxq2acby','Belen','Guevara','b@gmail.com','','123 Main St, City, State 12345','123 Main St, City, State 12345',80.57,'authorized','2025-09-25 21:16:51','2025-09-25 21:16:51'),(7,'ORD-1758835408748-4g4taa68z','B','G','B@gmail.com','','123 Main St, City, State 12345','123 Main St, City, State 12345',80.57,'authorized','2025-09-25 21:23:28','2025-09-25 21:23:28');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_authorizations`
--

DROP TABLE IF EXISTS `payment_authorizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_authorizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `authorization_token` varchar(255) NOT NULL,
  `authorization_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `authorization_expiry_date` timestamp NOT NULL,
  `payment_status` enum('authorized','captured','failed','expired') DEFAULT 'authorized',
  `amount` decimal(10,2) NOT NULL,
  `card_last_four` varchar(4) DEFAULT NULL,
  `card_type` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_auth_token` (`authorization_token`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_expiry_date` (`authorization_expiry_date`),
  CONSTRAINT `payment_authorizations_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_authorizations`
--

LOCK TABLES `payment_authorizations` WRITE;
/*!40000 ALTER TABLE `payment_authorizations` DISABLE KEYS */;
INSERT INTO `payment_authorizations` VALUES (1,'ORD-001','AUTH-12345-ABCDE','2025-09-25 15:55:21','2025-10-02 15:55:21','authorized',129.99,'1234','Visa','2025-09-25 15:55:21','2025-09-25 15:55:21'),(2,'ORD-002','AUTH-67890-FGHIJ','2025-09-25 15:55:21','2025-09-30 15:55:21','captured',89.50,'5678','MasterCard','2025-09-25 15:55:21','2025-09-25 15:55:21'),(3,'ORD-003','AUTH-11111-KLMNO','2025-09-25 15:55:21','2025-09-28 15:55:21','authorized',199.99,'9012','Visa','2025-09-25 15:55:21','2025-09-25 15:55:21'),(4,'ORD-1758820302924-ke6sxlmp8','dGhpcyBpcyBhbiBhdXRoIHRva2Vu','2025-09-25 17:11:43','2025-10-02 17:11:44','authorized',80.57,'1111','Unknown','2025-09-25 17:11:43','2025-09-25 17:11:43'),(5,'ORD-1758820636153-iqoyxcrue','dGhpcyBpcyBhbiBhdXRoIHRva2Vu','2025-09-25 17:17:16','2025-10-02 17:17:17','authorized',80.57,'1111','Unknown','2025-09-25 17:17:16','2025-09-25 17:17:16'),(6,'ORD-1758835011884-ouxq2acby','dGhpcyBpcyBhbiBhdXRoIHRva2Vu','2025-09-25 21:16:52','2025-10-02 21:16:52','authorized',80.57,'1111','Unknown','2025-09-25 21:16:52','2025-09-25 21:16:52'),(7,'ORD-1758835408748-4g4taa68z','dGhpcyBpcyBhbiBhdXRoIHRva2Vu','2025-09-25 21:23:28','2025-10-02 21:23:29','authorized',80.57,'1111','Unknown','2025-09-25 21:23:28','2025-09-25 21:23:28');
/*!40000 ALTER TABLE `payment_authorizations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-25 17:33:48
