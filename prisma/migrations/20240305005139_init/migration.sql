/*
  Warnings:

  - You are about to drop the column `hashedpassword` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedpassword",
ADD COLUMN     "hashedPassword" TEXT;
