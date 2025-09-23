/*
  Warnings:

  - Added the required column `firstName` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('owner', 'customer', 'monitor', 'caregiver');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "role" "public"."Role" NOT NULL;
