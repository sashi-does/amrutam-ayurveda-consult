/*
  Warnings:

  - You are about to drop the column `notes` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `modes` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `isRecurring` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `recurringPattern` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Slot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "bio",
DROP COLUMN "modes",
ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Slot" DROP COLUMN "isRecurring",
DROP COLUMN "mode",
DROP COLUMN "recurringPattern",
DROP COLUMN "status";
