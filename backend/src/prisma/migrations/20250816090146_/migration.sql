/*
  Warnings:

  - You are about to drop the column `confirmedAt` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "confirmedAt",
ADD COLUMN     "appointmentDateTime" TIMESTAMP(3);
