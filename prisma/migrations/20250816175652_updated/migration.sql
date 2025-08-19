/*
  Warnings:

  - You are about to drop the column `isProfileComplete` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "isProfileComplete",
ADD COLUMN     "is_profile_complete" BOOLEAN NOT NULL DEFAULT false;
