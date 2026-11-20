-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: capasalmacen
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `capasalmacen`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `capasalmacen` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `capasalmacen`;

--
-- Table structure for table `vehiculo`
--

DROP TABLE IF EXISTS `vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiculo` (
  `id_vehiculo` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `modelo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ano` int DEFAULT NULL,
  `precio` double DEFAULT NULL,
  `kilometraje` int DEFAULT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `imagen` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `placa` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_vehiculo`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculo`
--

LOCK TABLES `vehiculo` WRITE;
/*!40000 ALTER TABLE `vehiculo` DISABLE KEYS */;
INSERT INTO `vehiculo` VALUES (1,'automovil','Mazda','CX-90',2022,120000000,20000,'Excelente',NULL,'KLM412'),(2,'automovil','Toyota','Corolla Cross',2024,115000000,8500,'Excelente',NULL,'JTR839'),(3,'automovil','Mazda','CX-30',2025,120000000,2000,'Nuevo',NULL,'HNP205'),(4,'camioneta','Honda','CR-V',2025,135000000,2000,'Excelente',NULL,'FBC914'),(5,'camioneta','Toyota','Fortuner',2023,195000000,18000,'Bueno',NULL,'GXZ527'),(6,'automovil','Chevrolet','Onix Turbo',2023,68000000,24500,'Bueno',NULL,'DQR681'),(7,'camioneta','Hyundai','Tucson',2024,128000000,11200,'Excelente',NULL,'LMV390'),(8,'automovil','Kia','Sportage',2022,108000000,31000,'Bueno',NULL,'BKS748'),(9,'automovil','lamborghini','Revuelto',2025,1000000000,0,'Nuevo','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG9CHF3uObwRe-NSMKJbTF2wYh2mHa0slzXlFNjgblJw&s=10','FGH029'),(10,'automovil','lamborghini','Urus',2025,100000000,0,'Nuevo','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgMxeNMYaBdx-MFhSxvgLZu027wmtKTrOedtPa4VUsJQ&s','ASD132');
/*!40000 ALTER TABLE `vehiculo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-20  5:27:10
