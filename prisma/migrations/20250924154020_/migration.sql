-- CreateEnum
CREATE TYPE "public"."Situation" AS ENUM ('UNPAYED', 'PAYED');

-- AlterTable
ALTER TABLE "public"."Billing" ADD COLUMN     "situation" "public"."Situation" NOT NULL DEFAULT 'UNPAYED';
