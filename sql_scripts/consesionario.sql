-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: consesionario
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
-- Current Database: `consesionario`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `consesionario` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `consesionario`;

--
-- Table structure for table `publicacion`
--

DROP TABLE IF EXISTS `publicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicacion` (
  `id_publicacion` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `precio_publicacion` decimal(12,2) DEFAULT NULL,
  `fecha_publicacion` datetime DEFAULT NULL,
  `placa` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_publicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacion`
--

LOCK TABLES `publicacion` WRITE;
/*!40000 ALTER TABLE `publicacion` DISABLE KEYS */;
INSERT INTO `publicacion` VALUES (1,'Chevrolet Onix 2022','Excelente estado, único dueño, papeles al día',48000000.00,'2026-09-25 14:52:07','XYZ123','https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500'),(2,'Mazda CX-90 2022','Excelente estado, unico dueño, papeles al dia',120000000.00,'2026-10-21 04:06:08','ABC901','https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500'),(3,'Mazda CX-30 2025','Nuevecito, poco kilometraje',120000000.00,'2026-10-21 04:06:08','DEF302','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500'),(4,'Honda CR-V 2025','Camioneta familiar full equipo',120000000.00,'2026-10-21 04:06:08','GHI525','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500'),(5,'lamborghini aventador 2020','Tipo automovil, marca lamborghini, modelo 2020. Estado: nuevo. Chasis: 100% Estructuralmente Sano.',3000000000.00,'2026-10-21 05:16:50','JKH219',NULL),(6,'lamborghini Revuelto 2025','Tipo automovil, marca lamborghini, modelo 2025. Estado: Nuevo. Chasis: 100% Estructuralmente Sano.',1000000000.00,'2026-11-20 05:21:58','FGH029',NULL),(7,'lamborghini Urus 2025','Tipo automovil, marca lamborghini, modelo 2025. Estado: Nuevo. Chasis: 100% Estructuralmente Sano.',100000000.00,'2026-11-20 05:24:51','ASD132',NULL);
/*!40000 ALTER TABLE `publicacion` ENABLE KEYS */;
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
