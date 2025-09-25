/*
  Warnings:

  - Added the required column `templateType` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add column with NULL allowed
ALTER TABLE `Resume` ADD COLUMN `templateType` VARCHAR(10) NULL;

-- Step 2: Update existing rows with default value
UPDATE `Resume` SET `templateType` = 'default' WHERE `templateType` IS NULL;

-- Step 3: Alter column to NOT NULL
ALTER TABLE `Resume` MODIFY COLUMN `templateType` VARCHAR(10) NOT NULL;
