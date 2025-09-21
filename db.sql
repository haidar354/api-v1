-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 19, 2025 at 02:44 PM
-- Server version: 8.4.0
-- PHP Version: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `website_sekolahku`
--
-- Create database
CREATE DATABASE IF NOT EXISTS website_sekolahku2;
USE website_sekolahku2;
-- --------------------------------------------------------

--
-- Table structure for table `academic_years`
--

CREATE TABLE `academic_years` (
  `id` int NOT NULL,
  `year` varchar(9) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `academic_years`
--

INSERT INTO `academic_years` (`id`, `year`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, '2024/2025', '2025-01-01', '2025-06-30', 1, '2025-09-19 00:16:37', '2025-09-19 00:57:02', '2025-09-18 17:57:02'),
(3, '2025/2026', '2025-07-01', '2025-12-31', 1, '2025-09-19 00:17:08', '2025-09-19 00:20:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int NOT NULL,
  `id_role` int NOT NULL,
  `id_user` int NOT NULL,
  `id_class` int DEFAULT NULL,
  `date` date NOT NULL,
  `status` set('hadir','izin','sakit','alpha','terlambat','cuti','dinas') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'alpha',
  `information` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `id_role`, `id_user`, `id_class`, `date`, `status`, `information`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 4, 23, 1, '2025-09-19', 'hadir', '', '2025-09-19 00:00:00', '2025-09-19 00:00:00', NULL),
(2, 4, 23, 2, '2025-09-19', 'hadir', '', '2025-09-19 00:30:00', '2025-09-19 00:30:00', NULL),
(3, 4, 23, 3, '2025-09-19', 'terlambat', 'Terlambat 15 menit', '2025-09-19 01:15:00', '2025-09-19 01:15:00', NULL),
(4, 4, 23, 4, '2025-09-19', 'hadir', '', '2025-09-19 01:45:00', '2025-09-19 01:45:00', NULL),
(5, 4, 23, 5, '2025-09-19', 'sakit', 'Demam tinggi', '2025-09-19 02:00:00', '2025-09-19 02:00:00', NULL),
(6, 4, 23, 6, '2025-09-19', 'hadir', '', '2025-09-19 02:30:00', '2025-09-19 02:30:00', NULL),
(7, 4, 23, 7, '2025-09-19', 'izin', 'Ada keperluan keluarga', '2025-09-19 03:00:00', '2025-09-19 03:00:00', NULL),
(8, 4, 23, 8, '2025-09-19', 'hadir', '', '2025-09-19 03:30:00', '2025-09-19 03:30:00', NULL),
(9, 4, 23, 9, '2025-09-19', 'alpha', '', '2025-09-19 04:00:00', '2025-09-19 04:00:00', NULL),
(10, 4, 23, 10, '2025-09-19', 'hadir', '', '2025-09-19 04:30:00', '2025-09-19 04:30:00', NULL),
(11, 4, 23, 11, '2025-09-19', 'terlambat', 'Terlambat 30 menit', '2025-09-19 05:30:00', '2025-09-19 05:30:00', NULL),
(12, 4, 23, 12, '2025-09-19', 'hadir', '', '2025-09-19 06:00:00', '2025-09-19 06:00:00', NULL),
(13, 4, 23, 13, '2025-09-19', 'sakit', 'Flu dan batuk', '2025-09-19 06:30:00', '2025-09-19 06:30:00', NULL),
(14, 4, 23, 14, '2025-09-19', 'hadir', '', '2025-09-19 07:00:00', '2025-09-19 07:00:00', NULL),
(15, 4, 23, 15, '2025-09-19', 'izin', 'Urusan administrasi', '2025-09-19 07:30:00', '2025-09-19 07:30:00', NULL),
(16, 4, 23, 16, '2025-09-19', 'hadir', '', '2025-09-19 08:00:00', '2025-09-19 08:00:00', NULL),
(17, 4, 23, 17, '2025-09-19', 'alpha', '', '2025-09-19 08:30:00', '2025-09-19 08:30:00', NULL),
(18, 4, 23, 18, '2025-09-19', 'hadir', '', '2025-09-19 09:00:00', '2025-09-19 09:00:00', NULL),
(19, 4, 23, 19, '2025-09-19', 'terlambat', 'Terlambat 10 menit', '2025-09-19 09:40:00', '2025-09-19 09:40:00', NULL),
(20, 4, 23, 20, '2025-09-19', 'hadir', '', '2025-09-19 10:00:00', '2025-09-19 10:00:00', NULL),
(21, 3, 25, 1, '2025-09-19', 'hadir', 'Mengajar Matematika kelas 1', '2025-09-19 00:00:00', '2025-09-19 00:00:00', NULL),
(22, 3, 25, 2, '2025-09-19', 'hadir', 'Mengajar Bahasa Indonesia kelas 2', '2025-09-19 00:30:00', '2025-09-19 00:30:00', NULL),
(23, 3, 25, 3, '2025-09-19', 'cuti', 'Cuti melahirkan', '2025-09-19 01:00:00', '2025-09-19 01:00:00', NULL),
(24, 3, 25, 4, '2025-09-19', 'hadir', 'Mengajar IPA kelas 4', '2025-09-19 01:45:00', '2025-09-19 01:45:00', NULL),
(25, 3, 25, 5, '2025-09-19', 'sakit', 'Demam dan pusing', '2025-09-19 02:00:00', '2025-09-19 02:00:00', NULL),
(26, 3, 25, 6, '2025-09-19', 'hadir', 'Mengajar IPS kelas 6', '2025-09-19 02:30:00', '2025-09-19 02:30:00', NULL),
(27, 3, 25, 7, '2025-09-19', 'izin', 'Menghadiri seminar pendidikan', '2025-09-19 03:00:00', '2025-09-19 03:00:00', NULL),
(28, 3, 25, 8, '2025-09-19', 'hadir', 'Mengajar Olahraga kelas 8', '2025-09-19 03:30:00', '2025-09-19 03:30:00', NULL),
(29, 3, 25, 9, '2025-09-19', 'terlambat', 'Terlambat karena macet', '2025-09-19 04:15:00', '2025-09-19 04:15:00', NULL),
(30, 3, 25, 10, '2025-09-19', 'hadir', 'Mengajar Seni Budaya kelas 10', '2025-09-19 04:30:00', '2025-09-19 04:30:00', NULL),
(31, 4, 23, 1, '2025-09-19', 'hadir', '', '2025-09-19 00:15:00', '2025-09-19 00:15:00', NULL),
(32, 4, 23, 2, '2025-09-19', 'sakit', 'Sakit kepala', '2025-09-19 00:45:00', '2025-09-19 00:45:00', NULL),
(33, 4, 23, 3, '2025-09-19', 'hadir', '', '2025-09-19 01:30:00', '2025-09-19 01:30:00', NULL),
(34, 4, 23, 4, '2025-09-19', 'izin', 'Mengurus dokumen penting', '2025-09-19 02:00:00', '2025-09-19 02:00:00', NULL),
(35, 4, 23, 5, '2025-09-19', 'hadir', '', '2025-09-19 02:15:00', '2025-09-19 02:15:00', NULL),
(36, 4, 23, 6, '2025-09-19', 'alpha', '', '2025-09-19 02:45:00', '2025-09-19 02:45:00', NULL),
(37, 4, 23, 7, '2025-09-19', 'hadir', '', '2025-09-19 03:15:00', '2025-09-19 03:15:00', NULL),
(38, 4, 23, 8, '2025-09-19', 'terlambat', 'Terlambat 20 menit', '2025-09-19 03:50:00', '2025-09-19 03:50:00', NULL),
(39, 4, 23, 9, '2025-09-19', 'hadir', '', '2025-09-19 04:15:00', '2025-09-19 04:15:00', NULL),
(40, 4, 23, 10, '2025-09-19', 'sakit', 'Batuk pilek', '2025-09-19 04:45:00', '2025-09-19 04:45:00', NULL),
(41, 4, 23, 11, '2025-09-19', 'hadir', '', '2025-09-19 05:45:00', '2025-09-19 05:45:00', NULL),
(42, 4, 23, 12, '2025-09-19', 'izin', 'Acara keluarga', '2025-09-19 06:15:00', '2025-09-19 06:15:00', NULL),
(43, 4, 23, 13, '2025-09-19', 'hadir', '', '2025-09-19 06:45:00', '2025-09-19 06:45:00', NULL),
(44, 4, 23, 14, '2025-09-19', 'alpha', '', '2025-09-19 07:15:00', '2025-09-19 07:15:00', NULL),
(45, 4, 23, 15, '2025-09-19', 'hadir', '', '2025-09-19 07:45:00', '2025-09-19 07:45:00', NULL),
(46, 4, 23, 16, '2025-09-19', 'terlambat', 'Terlambat 25 menit', '2025-09-19 08:25:00', '2025-09-19 08:25:00', NULL),
(47, 4, 23, 17, '2025-09-19', 'hadir', '', '2025-09-19 08:45:00', '2025-09-19 08:45:00', NULL),
(48, 4, 23, 18, '2025-09-19', 'sakit', 'Migrain', '2025-09-19 09:15:00', '2025-09-19 09:15:00', NULL),
(49, 4, 23, 19, '2025-09-19', 'hadir', '', '2025-09-19 09:55:00', '2025-09-19 09:55:00', NULL),
(50, 4, 23, 20, '2025-09-19', 'izin', 'Checkup kesehatan', '2025-09-19 10:15:00', '2025-09-19 10:15:00', NULL),
(51, 3, 25, 11, '2025-09-19', 'hadir', 'Mengajar PKN kelas 11', '2025-09-19 05:00:00', '2025-09-19 05:00:00', NULL),
(52, 3, 25, 12, '2025-09-19', 'cuti', 'Cuti tahunan', '2025-09-19 05:30:00', '2025-09-19 05:30:00', NULL),
(53, 3, 25, 13, '2025-09-19', 'hadir', 'Mengajar Fisika kelas 13', '2025-09-19 06:00:00', '2025-09-19 06:00:00', NULL),
(54, 3, 25, 14, '2025-09-19', 'izin', 'Rapat dengan kepala sekolah', '2025-09-19 06:30:00', '2025-09-19 06:30:00', NULL),
(55, 3, 25, 15, '2025-09-19', 'hadir', 'Mengajar Kimia kelas 15', '2025-09-19 07:00:00', '2025-09-19 07:00:00', NULL),
(56, 3, 25, 16, '2025-09-19', 'sakit', 'Flu berat', '2025-09-19 07:30:00', '2025-09-19 07:30:00', NULL),
(57, 3, 25, 17, '2025-09-19', 'hadir', 'Mengajar Biologi kelas 17', '2025-09-19 08:00:00', '2025-09-19 08:00:00', NULL),
(58, 3, 25, 18, '2025-09-19', 'terlambat', 'Terlambat 35 menit', '2025-09-19 08:35:00', '2025-09-19 08:35:00', NULL),
(59, 3, 25, 19, '2025-09-19', 'hadir', 'Mengajar Geografi kelas 19', '2025-09-19 09:00:00', '2025-09-19 09:00:00', NULL),
(60, 3, 25, 20, '2025-09-19', 'cuti', 'Cuti melahirkan', '2025-09-19 09:30:00', '2025-09-19 09:30:00', NULL),
(61, 4, 23, 1, '2025-09-19', 'sakit', 'Asma kambuh', '2025-09-19 00:30:00', '2025-09-19 00:30:00', NULL),
(62, 4, 23, 2, '2025-09-19', 'hadir', '', '2025-09-19 01:00:00', '2025-09-19 01:00:00', NULL),
(63, 4, 23, 3, '2025-09-19', 'izin', 'Menghadiri pemakaman', '2025-09-19 01:45:00', '2025-09-19 01:45:00', NULL),
(64, 4, 23, 4, '2025-09-19', 'hadir', '', '2025-09-19 02:15:00', '2025-09-19 02:15:00', NULL),
(65, 4, 23, 5, '2025-09-19', 'alpha', '', '2025-09-19 02:30:00', '2025-09-19 02:30:00', NULL),
(66, 4, 23, 6, '2025-09-19', 'hadir', '', '2025-09-19 03:00:00', '2025-09-19 03:00:00', NULL),
(67, 4, 23, 7, '2025-09-19', 'terlambat', 'Terlambat 40 menit', '2025-09-19 03:40:00', '2025-09-19 03:40:00', NULL),
(68, 4, 23, 8, '2025-09-19', 'hadir', '', '2025-09-19 04:00:00', '2025-09-19 04:00:00', NULL),
(69, 4, 23, 9, '2025-09-19', 'sakit', 'Diare', '2025-09-19 04:30:00', '2025-09-19 04:30:00', NULL),
(70, 4, 23, 10, '2025-09-19', 'hadir', '', '2025-09-19 05:00:00', '2025-09-19 05:00:00', NULL),
(71, 4, 23, 11, '2025-09-19', 'izin', 'Mengurus BPJS', '2025-09-19 06:00:00', '2025-09-19 06:00:00', NULL),
(72, 4, 23, 12, '2025-09-19', 'hadir', '', '2025-09-19 06:30:00', '2025-09-19 06:30:00', NULL),
(73, 4, 23, 13, '2025-09-19', 'alpha', '', '2025-09-19 07:00:00', '2025-09-19 07:00:00', NULL),
(74, 4, 23, 14, '2025-09-19', 'hadir', '', '2025-09-19 07:30:00', '2025-09-19 07:30:00', NULL),
(75, 4, 23, 15, '2025-09-19', 'terlambat', 'Terlambat 50 menit', '2025-09-19 08:20:00', '2025-09-19 08:20:00', NULL),
(76, 4, 23, 16, '2025-09-19', 'hadir', '', '2025-09-19 08:15:00', '2025-09-19 08:15:00', NULL),
(77, 4, 23, 17, '2025-09-19', 'sakit', 'Panas tinggi', '2025-09-19 08:45:00', '2025-09-19 08:45:00', NULL),
(78, 4, 23, 18, '2025-09-19', 'hadir', '', '2025-09-19 09:30:00', '2025-09-19 09:30:00', NULL),
(79, 4, 23, 19, '2025-09-19', 'izin', 'Ada undangan pernikahan', '2025-09-19 10:10:00', '2025-09-19 10:10:00', NULL),
(80, 4, 23, 20, '2025-09-19', 'hadir', '', '2025-09-19 10:30:00', '2025-09-19 10:30:00', NULL),
(81, 4, 23, 1, '2025-09-19', 'hadir', '', '2025-09-19 00:45:00', '2025-09-19 00:45:00', NULL),
(82, 4, 23, 2, '2025-09-19', 'terlambat', 'Terlambat 60 menit', '2025-09-19 01:30:00', '2025-09-19 01:30:00', NULL),
(83, 4, 23, 3, '2025-09-19', 'hadir', '', '2025-09-19 02:00:00', '2025-09-19 02:00:00', NULL),
(84, 4, 23, 4, '2025-09-19', 'sakit', 'Vertigo', '2025-09-19 02:30:00', '2025-09-19 02:30:00', NULL),
(85, 4, 23, 5, '2025-09-19', 'hadir', '', '2025-09-19 02:45:00', '2025-09-19 02:45:00', NULL),
(86, 4, 23, 6, '2025-09-19', 'izin', 'Ujian masuk universitas', '2025-09-19 03:15:00', '2025-09-19 03:15:00', NULL),
(87, 4, 23, 7, '2025-09-19', 'hadir', '', '2025-09-19 03:45:00', '2025-09-19 03:45:00', NULL),
(88, 4, 23, 8, '2025-09-19', 'alpha', '', '2025-09-19 04:15:00', '2025-09-19 04:15:00', NULL),
(89, 4, 23, 9, '2025-09-19', 'hadir', '', '2025-09-19 04:45:00', '2025-09-19 04:45:00', NULL),
(90, 4, 23, 10, '2025-09-19', 'terlambat', 'Terlambat 45 menit', '2025-09-19 05:45:00', '2025-09-19 05:45:00', NULL),
(91, 4, 23, 11, '2025-09-19', 'hadir', '', '2025-09-19 06:15:00', '2025-09-19 06:15:00', NULL),
(92, 4, 23, 12, '2025-09-19', 'sakit', 'Maag akut', '2025-09-19 06:45:00', '2025-09-19 06:45:00', NULL),
(93, 4, 23, 13, '2025-09-19', 'hadir', '', '2025-09-19 07:15:00', '2025-09-19 07:15:00', NULL),
(94, 4, 23, 14, '2025-09-19', 'izin', 'Pendaftaran beasiswa', '2025-09-19 07:45:00', '2025-09-19 07:45:00', NULL),
(95, 4, 23, 15, '2025-09-19', 'hadir', '', '2025-09-19 08:00:00', '2025-09-19 08:00:00', NULL),
(96, 4, 23, 16, '2025-09-19', 'alpha', '', '2025-09-19 08:30:00', '2025-09-19 08:30:00', NULL),
(97, 4, 23, 17, '2025-09-19', 'hadir', '', '2025-09-19 09:00:00', '2025-09-19 09:00:00', NULL),
(98, 4, 23, 18, '2025-09-19', 'terlambat', 'Terlambat 30 menit', '2025-09-19 09:45:00', '2025-09-19 09:45:00', NULL),
(99, 4, 23, 19, '2025-09-19', 'hadir', '', '2025-09-19 10:25:00', '2025-09-19 10:25:00', NULL),
(100, 4, 23, 20, '2025-09-19', 'sakit', 'Sakit perut', '2025-09-19 10:45:00', '2025-09-19 10:45:00', NULL),
(101, 3, 25, 1, '2025-09-19', 'izin', 'Pelatihan kurikulum baru', '2025-09-19 00:15:00', '2025-09-19 00:15:00', NULL),
(102, 3, 25, 2, '2025-09-19', 'hadir', 'Mengajar Agama kelas 2', '2025-09-19 00:45:00', '2025-09-19 00:45:00', NULL),
(103, 3, 25, 3, '2025-09-19', 'hadir', 'Mengajar Sejarah kelas 3', '2025-09-19 01:15:00', '2025-09-19 01:15:00', NULL),
(104, 3, 25, 4, '2025-09-19', 'cuti', 'Cuti sakit', '2025-09-19 02:00:00', '2025-09-19 02:00:00', NULL),
(105, 3, 25, 5, '2025-09-19', 'hadir', 'Mengajar Ekonomi kelas 5', '2025-09-19 02:30:00', '2025-09-19 02:30:00', NULL),
(106, 3, 25, 6, '2025-09-19', 'terlambat', 'Terlambat karena hujan', '2025-09-19 03:15:00', '2025-09-19 03:15:00', NULL),
(107, 3, 25, 7, '2025-09-19', 'hadir', 'Mengajar Sosiologi kelas 7', '2025-09-19 03:45:00', '2025-09-19 03:45:00', NULL),
(108, 3, 25, 8, '2025-09-19', 'sakit', 'Tekanan darah tinggi', '2025-09-19 04:00:00', '2025-09-19 04:00:00', NULL),
(109, 3, 25, 9, '2025-09-19', 'hadir', 'Mengajar Prakarya kelas 9', '2025-09-19 04:30:00', '2025-09-19 04:30:00', NULL),
(110, 3, 25, 10, '2025-09-19', 'izin', 'Workshop guru profesional', '2025-09-19 05:15:00', '2025-09-19 05:15:00', NULL),
(111, 3, 25, 11, '2025-09-19', 'hadir', 'Mengajar TIK kelas 11', '2025-09-19 05:45:00', '2025-09-19 05:45:00', NULL),
(112, 3, 25, 12, '2025-09-19', 'hadir', 'Mengajar Kewirausahaan kelas 12', '2025-09-19 06:15:00', '2025-09-19 06:15:00', NULL),
(113, 3, 25, 13, '2025-09-19', 'cuti', 'Cuti melahirkan', '2025-09-19 06:45:00', '2025-09-19 06:45:00', NULL),
(114, 3, 25, 14, '2025-09-19', 'hadir', 'Mengajar Akuntansi kelas 14', '2025-09-19 07:15:00', '2025-09-19 07:15:00', NULL),
(115, 3, 25, 15, '2025-09-19', 'terlambat', 'Terlambat 20 menit', '2025-09-19 07:50:00', '2025-09-19 07:50:00', NULL),
(116, 3, 25, 16, '2025-09-19', 'hadir', 'Mengajar Manajemen kelas 16', '2025-09-19 08:15:00', '2025-09-19 08:15:00', NULL),
(117, 3, 25, 17, '2025-09-19', 'izin', 'Menghadiri pernikahan keluarga', '2025-09-19 08:45:00', '2025-09-19 08:45:00', NULL),
(118, 3, 25, 18, '2025-09-19', 'hadir', 'Mengajar Psikologi kelas 18', '2025-09-19 09:15:00', '2025-09-19 09:15:00', NULL),
(119, 3, 25, 19, '2025-09-19', 'sakit', 'Asam lambung naik', '2025-09-19 09:45:00', '2025-09-19 09:45:00', NULL),
(120, 3, 25, 20, '2025-09-19', 'hadir', 'Mengajar Statistik kelas 20', '2025-09-19 10:15:00', '2025-09-19 10:15:00', NULL),
(121, 4, 23, 1, '2025-09-19', 'izin', 'Mengurus KTP', '2025-09-19 01:00:00', '2025-09-19 01:00:00', NULL),
(122, 4, 23, 2, '2025-09-19', 'hadir', '', '2025-09-19 01:15:00', '2025-09-19 01:15:00', NULL),
(123, 4, 23, 3, '2025-09-19', 'sakit', 'Gejala tipus', '2025-09-19 01:30:00', '2025-09-19 01:30:00', NULL),
(124, 4, 23, 4, '2025-09-19', 'hadir', '', '2025-09-19 02:45:00', '2025-09-19 02:45:00', NULL),
(125, 4, 23, 5, '2025-09-19', 'terlambat', 'Terlambat 55 menit', '2025-09-19 03:25:00', '2025-09-19 03:25:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int NOT NULL,
  `grade` varchar(10) NOT NULL,
  `id_department` int NOT NULL,
  `subgrade` varchar(10) DEFAULT NULL,
  `id_academic_year` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `grade`, `id_department`, `subgrade`, `id_academic_year`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'X', 2, '1', 3, '2025-09-19 02:19:53', '2025-09-19 02:19:53', NULL),
(2, '1', 14, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(3, '2', 14, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(4, '2', 14, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(5, '3', 14, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(6, '3', 14, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(7, '4', 14, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(8, '4', 14, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(9, '5', 14, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(10, '5', 14, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(11, '6', 14, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(12, '6', 14, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(13, '7', 14, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(14, '7', 14, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(15, '8', 14, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(16, '8', 14, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(17, '9', 15, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(18, '9', 15, 'B', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(19, '10', 15, 'A', 3, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(20, '10', 15, 'B', 3, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL),
(21, '1', 14, 'A', 2, '2025-09-01 01:00:00', '2025-09-01 01:00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `short_name` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `code` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `short_name`, `code`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 'Pengembangan Perangkat Lunak & Gim', 'PPLG', 'PPLG01', '2025-09-18 23:06:46', '2025-09-18 23:07:30', NULL),
(14, 'Teknik Informatika', 'TI', 'TI01', '2025-09-18 23:12:56', '2025-09-18 23:27:09', NULL),
(15, 'Teknik Industri', 'TI', 'TI02', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(16, 'Teknik Elektro', 'TE', 'TE02', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(17, 'Teknik Mesin', 'TM', 'TM03', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(18, 'Akuntansi', 'AK', 'AK04', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(19, 'Manajemen', 'MNJ', 'MNJ05', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(21, 'Pendidikan Dasar', 'DIKDAS', 'DD01', '2025-09-18 23:00:00', '2025-09-18 23:00:00', NULL),
(22, 'Pengembangan Perangkat Lunak & Gim', 'PPLG', 'PPLG01', '2025-09-18 23:06:46', '2025-09-18 23:07:30', NULL),
(23, 'Teknik Informatika', 'TI', 'TI01', '2025-09-18 23:12:56', '2025-09-18 23:27:09', NULL),
(24, 'Teknik Industri', 'TI', 'TI02', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(25, 'Teknik Elektro', 'TE', 'TE02', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(26, 'Teknik Mesin', 'TM', 'TM03', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(27, 'Akuntansi', 'AK', 'AK04', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL),
(28, 'Manajemen', 'MNJ', 'MNJ05', '2025-09-18 23:12:56', '2025-09-18 23:12:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text,
  `purpose` varchar(255) NOT NULL,
  `visit_date` datetime NOT NULL,
  `signature` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `guests`
--

INSERT INTO `guests` (`id`, `full_name`, `address`, `purpose`, `visit_date`, `signature`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'John Doe', '123 Main Street, City', 'Meeting with principal', '2025-09-18 07:10:10', 'signatures/signatures-CM11S6-panduan-buat-website-prak.png', '2025-09-18 07:10:09', '2025-09-18 07:10:09', NULL),
(2, 'John Doe', '123 Main Street, City', 'Meeting with principal', '2025-09-18 07:10:49', 'signatures/signatures-PXTW28-panduan-buat-website-prak.png', '2025-09-18 07:10:49', '2025-09-18 07:10:49', NULL),
(3, 'John Doe', '123 Main Street, City', 'Meeting with principal', '2025-09-18 07:11:17', 'signatures/signatures-MQE12A-panduan-buat-website-prak.png', '2025-09-18 07:11:17', '2025-09-18 07:11:17', NULL),
(4, 'John Doe', '123 Main Street, City', 'Meeting with principal', '2025-09-18 09:02:19', 'signatures/signatures-Z3ARLM-Logo Resolusi.webp', '2025-09-18 09:02:19', '2025-09-18 09:02:19', NULL),
(5, 'John Doe', '123 Main Street, City', 'Meeting with principal', '2025-09-19 03:09:20', 'signatures/signatures-D6SE5I-Logo Resolusi.webp', '2025-09-19 03:09:20', '2025-09-19 03:09:20', NULL),
(6, 'John Doe Updated', '789 New Street, Updated City', 'Updated meeting purpose', '2025-09-19 03:09:55', 'signatures/signatures-C3QB7T-unnamed.png', '2025-09-19 03:09:54', '2025-09-19 03:12:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `principal_agendas`
--

CREATE TABLE `principal_agendas` (
  `id` int NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `description` text,
  `event_date` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `principal_agendas`
--

INSERT INTO `principal_agendas` (`id`, `event_name`, `description`, `event_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Digital Learning Seminar', 'Monthly seminar designed to enhance digital literacy skills and integrate technology into classroom activities.', '2025-11-12 09:00:00', '2025-09-19 01:00:12', '2025-09-19 01:02:49', NULL),
(2, 'Teacher Development Workshop', 'Quarterly workshop focused on improving teaching strategies and sharing best practices among staff.', '2025-10-05 08:30:00', '2025-09-19 01:01:20', '2025-09-19 01:01:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `can_login` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `can_login`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Admin', 1, '2025-09-17 06:29:36', '2025-09-18 10:13:07', NULL),
(2, 'Kepala Sekolah', 1, '2025-09-17 06:29:36', '2025-09-18 10:13:07', NULL),
(3, 'Guru', 0, '2025-09-17 06:29:36', '2025-09-19 04:24:41', NULL),
(4, 'Siswa', 0, '2025-09-17 06:29:36', '2025-09-18 10:13:07', NULL),
(5, 'Operator', 1, '2025-09-18 10:40:22', '2025-09-18 22:54:21', NULL),
(6, 'Mahasiswa', 1, '2025-09-18 22:54:56', '2025-09-18 22:55:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int NOT NULL,
  `id_role` int NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `can_create` tinyint(1) NOT NULL DEFAULT '0',
  `can_read` tinyint(1) NOT NULL DEFAULT '0',
  `can_update` tinyint(1) NOT NULL DEFAULT '0',
  `can_delete` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `id_role`, `table_name`, `can_create`, `can_read`, `can_update`, `can_delete`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'academic_years', 1, 1, 1, 1, '2025-09-18 10:40:55', '2025-09-18 10:40:55', NULL),
(2, 1, 'role_permissions', 1, 1, 1, 1, '2025-09-18 10:48:54', '2025-09-18 10:48:54', NULL),
(3, 1, 'attendance', 1, 1, 1, 1, '2025-09-18 10:49:00', '2025-09-18 10:49:00', NULL),
(4, 1, 'classes', 1, 1, 1, 1, '2025-09-18 10:49:06', '2025-09-18 10:49:06', NULL),
(5, 1, 'departments', 1, 1, 1, 1, '2025-09-18 10:49:14', '2025-09-18 10:49:14', NULL),
(6, 1, 'guests', 1, 1, 1, 1, '2025-09-18 10:49:19', '2025-09-18 10:49:19', NULL),
(7, 1, 'principal_agendas', 1, 1, 1, 1, '2025-09-18 10:49:29', '2025-09-18 10:49:29', NULL),
(8, 1, 'surveys', 1, 1, 1, 1, '2025-09-18 10:49:35', '2025-09-18 10:49:35', NULL),
(9, 1, 'survey_responses', 1, 1, 1, 1, '2025-09-18 10:49:41', '2025-09-18 10:49:41', NULL),
(10, 1, 'roles', 1, 1, 1, 1, '2025-09-18 10:49:54', '2025-09-18 10:49:54', NULL),
(11, 1, 'users', 1, 1, 1, 1, '2025-09-18 10:50:15', '2025-09-18 10:50:15', NULL),
(12, 2, 'academic_years', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(13, 2, 'role_permissions', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(14, 2, 'attendance', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(15, 2, 'classes', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(16, 2, 'departments', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(17, 2, 'guests', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(18, 2, 'principal_agendas', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(19, 2, 'surveys', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(20, 2, 'survey_responses', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(21, 2, 'roles', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(22, 2, 'users', 1, 1, 1, 1, '2025-09-18 11:26:25', '2025-09-18 11:26:25', NULL),
(23, 3, 'users', 0, 1, 0, 0, '2025-09-18 22:51:00', '2025-09-18 22:53:07', '2025-09-18 15:53:08');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int NOT NULL,
  `id_user` int NOT NULL,
  `id_class` int DEFAULT NULL,
  `nis` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `id_user`, `id_class`, `nis`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 23, 1, '123456', '2025-09-19 12:44:48', '2025-09-19 12:44:48', NULL),
(4, 24, 1, '100000', '2025-09-19 13:04:44', '2025-09-19 13:04:44', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `surveys`
--

CREATE TABLE `surveys` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `id_academic_year` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `surveys`
--

INSERT INTO `surveys` (`id`, `title`, `description`, `id_academic_year`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Student Satisfaction Surveys', 'Annual survey to measure student satisfaction with school facilities and teaching quality.', 3, '2025-09-19 01:57:51', '2025-09-19 01:58:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` int NOT NULL,
  `id_survey` int NOT NULL,
  `question` text NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `survey_questions`
--

INSERT INTO `survey_questions` (`id`, `id_survey`, `question`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'How would you rate the overall teaching quality?', 'ABCD', '2025-09-19 01:59:02', '2025-09-19 07:45:45', NULL),
(2, 1, 'How satisfied are you with the classroom quality?', 'ABCD', '2025-09-19 01:59:15', '2025-09-19 07:45:45', NULL),
(3, 1, 'How satisfied are you with the lab quality?', 'ABCD', '2025-09-19 01:59:22', '2025-09-19 07:45:45', NULL),
(4, 1, 'How satisfied are you with the field school quality?', 'ABCD', '2025-09-19 01:59:29', '2025-09-19 07:45:45', NULL),
(5, 1, 'How satisfied are you with the school\'s food quality?', 'ABCD', '2025-09-19 01:59:37', '2025-09-19 07:45:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `survey_responses`
--

CREATE TABLE `survey_responses` (
  `id` int NOT NULL,
  `id_survey` int NOT NULL,
  `id_survey_question` int NOT NULL,
  `id_survey_surveyor` int NOT NULL,
  `score` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `survey_responses`
--

INSERT INTO `survey_responses` (`id`, `id_survey`, `id_survey_question`, `id_survey_surveyor`, `score`, `created_at`, `updated_at`, `deleted_at`) VALUES
(11, 1, 1, 1, 4, '2025-09-19 08:20:47', '2025-09-19 08:20:47', NULL),
(12, 1, 2, 1, 5, '2025-09-19 08:20:47', '2025-09-19 08:20:47', NULL),
(13, 1, 3, 1, 3, '2025-09-19 08:20:47', '2025-09-19 08:20:47', NULL),
(14, 1, 5, 3, 2, '2025-09-19 08:30:47', '2025-09-19 08:30:47', NULL),
(15, 1, 4, 3, 2, '2025-09-19 08:30:47', '2025-09-19 08:30:47', NULL),
(16, 1, 3, 3, 1, '2025-09-19 08:30:47', '2025-09-19 08:30:47', NULL),
(17, 1, 2, 3, 4, '2025-09-19 08:30:47', '2025-09-19 08:30:47', NULL),
(18, 1, 1, 3, 4, '2025-09-19 08:30:47', '2025-09-19 08:30:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `survey_surveyors`
--

CREATE TABLE `survey_surveyors` (
  `id` int NOT NULL,
  `id_survey` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `organization` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `feedback` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `survey_surveyors`
--

INSERT INTO `survey_surveyors` (`id`, `id_survey`, `name`, `organization`, `feedback`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'APCB', 'NGUWAWOR', 'BAGUS', '2025-09-19 08:12:26', '2025-09-19 08:12:26', NULL),
(2, 1, 'adad', 'adad', 'adadad', '2025-09-19 08:30:04', '2025-09-19 08:30:04', NULL),
(3, 1, 'adad', 'adad', 'adadad', '2025-09-19 08:30:46', '2025-09-19 08:30:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int NOT NULL,
  `id_user` int NOT NULL,
  `id_class` int DEFAULT NULL,
  `nip` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `id_user`, `id_class`, `nip`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 25, 1, '100000', '2025-09-19 13:06:55', '2025-09-19 13:06:55', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `id_role` int NOT NULL,
  `data` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `id_role`, `data`, `created_at`, `updated_at`, `deleted_at`) VALUES
(13, 'Admin Name', 1, '{\"email\": \"admin12345@gmail.com\", \"phone\": \"+62812345678\", \"office\": \"Main Office\", \"password\": \"$2a$12$XNu5KElT0RXUSsGgs.T3ReiTz5UyhOIwo07xwXaLj.NUZCeFxAOWO\", \"department\": \"Administration\"}', '2025-09-18 06:41:36', '2025-09-18 10:13:54', NULL),
(14, 'Kepala Sekolah', 2, '{\"email\": \"kepala12345@gmail.com\", \"password\": \"$2a$12$1idW4iToJGra9hDBVkAiOuetEll5vD3Cy/jJlvGfulSrlOSFHCkfm\"}', '2025-09-18 08:59:21', '2025-09-18 10:13:54', NULL),
(16, 'Guru Sekolah', 3, '{}', '2025-09-18 09:01:12', '2025-09-18 10:13:54', NULL),
(23, 'Murid Sekolah Baru', 4, '{\"nis\": \"123456\", \"id_class\": 1}', '2025-09-19 05:44:48', '2025-09-19 05:44:48', NULL),
(24, 'Murid Sekolah Baru CUY', 4, '{\"nis\": \"100000\", \"id_class\": 1}', '2025-09-19 06:04:43', '2025-09-19 06:04:43', NULL),
(25, 'Guru Sekolah Baru', 3, '{\"nip\": \"100000\", \"id_class\": 1}', '2025-09-19 06:06:54', '2025-09-19 06:06:55', '2025-09-18 23:06:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role` (`id_role`),
  ADD KEY `attendance_ibfk_1` (`id_user`),
  ADD KEY `id_class` (`id_class`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_department` (`id_department`),
  ADD KEY `id_academic_year` (`id_academic_year`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `principal_agendas`
--
ALTER TABLE `principal_agendas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_permissions_ibfk_1` (`id_role`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `students_ibfk_2` (`id_class`);

--
-- Indexes for table `surveys`
--
ALTER TABLE `surveys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_academic_year` (`id_academic_year`);

--
-- Indexes for table `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_survey` (`id_survey`);

--
-- Indexes for table `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survey_responses_ibfk_1` (`id_survey`),
  ADD KEY `survey_responses_ibfk_2` (`id_survey_question`),
  ADD KEY `id_survey_surveyor` (`id_survey_surveyor`);

--
-- Indexes for table `survey_surveyors`
--
ALTER TABLE `survey_surveyors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_class` (`id_class`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `users_ibfk_1` (`id_role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `principal_agendas`
--
ALTER TABLE `principal_agendas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `surveys`
--
ALTER TABLE `surveys`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `survey_questions`
--
ALTER TABLE `survey_questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `survey_responses`
--
ALTER TABLE `survey_responses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `survey_surveyors`
--
ALTER TABLE `survey_surveyors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`id_class`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`id_department`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`id_academic_year`) REFERENCES `academic_years` (`id`);

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`id_class`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `surveys`
--
ALTER TABLE `surveys`
  ADD CONSTRAINT `surveys_ibfk_1` FOREIGN KEY (`id_academic_year`) REFERENCES `academic_years` (`id`);

--
-- Constraints for table `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD CONSTRAINT `survey_questions_ibfk_1` FOREIGN KEY (`id_survey`) REFERENCES `surveys` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD CONSTRAINT `survey_responses_ibfk_1` FOREIGN KEY (`id_survey`) REFERENCES `surveys` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `survey_responses_ibfk_2` FOREIGN KEY (`id_survey_question`) REFERENCES `survey_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `survey_responses_ibfk_3` FOREIGN KEY (`id_survey_surveyor`) REFERENCES `survey_surveyors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`id_class`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
