-- phpMyAdmin SQL Dump
-- version 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2021 at 12:24 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `finance-api`
--

-- --------------------------------------------------------

--
-- Table structure for table `symbols`
--

CREATE TABLE `symbols` (
  `id` int(10) UNSIGNED NOT NULL,
  `symbol` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `shares` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `cashValue` varchar(255) DEFAULT NULL,
  `commission` int(11) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `exSuffix` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `symbols`
--

INSERT INTO `symbols` (`id`, `symbol`, `name`, `type`, `date`, `shares`, `price`, `cashValue`, `commission`, `notes`, `exSuffix`) VALUES
(1, 'ALV-GY', 'null', 'Buy', '2021-04-08', 0, 0, NULL, 0, '', '-GY');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `symbols`
--
ALTER TABLE `symbols`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `symbols`
--
ALTER TABLE `symbols`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
