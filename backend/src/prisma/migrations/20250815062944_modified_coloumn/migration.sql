/*
  Warnings:

  - You are about to drop the column `userId` on the `SlotLock` table. All the data in the column will be lost.
  - Added the required column `patientId` to the `SlotLock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SlotLock" DROP CONSTRAINT "SlotLock_userId_fkey";

-- AlterTable
ALTER TABLE "SlotLock" DROP COLUMN "userId",
ADD COLUMN     "patientId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SlotLock" ADD CONSTRAINT "SlotLock_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
