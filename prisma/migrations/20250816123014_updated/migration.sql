/*
  Warnings:

  - You are about to drop the `user_profile_question_anwsers` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."selected_answer_options" DROP CONSTRAINT "selected_answer_options_answer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_profile_question_anwsers" DROP CONSTRAINT "user_profile_question_anwsers_question_id_fkey";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "username" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."user_profile_question_anwsers";

-- CreateTable
CREATE TABLE "public"."user_profile_question_answers" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "answer_text" TEXT,

    CONSTRAINT "user_profile_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_profile_question_answers_user_id_idx" ON "public"."user_profile_question_answers"("user_id");

-- CreateIndex
CREATE INDEX "user_profile_question_answers_question_id_idx" ON "public"."user_profile_question_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_question_answers_question_id_user_id_key" ON "public"."user_profile_question_answers"("question_id", "user_id");

-- CreateIndex
CREATE INDEX "question_options_question_id_idx" ON "public"."question_options"("question_id");

-- CreateIndex
CREATE INDEX "selected_answer_options_option_id_idx" ON "public"."selected_answer_options"("option_id");

-- CreateIndex
CREATE INDEX "user_profile_questions_step_number_idx" ON "public"."user_profile_questions"("step_number");

-- AddForeignKey
ALTER TABLE "public"."user_profile_question_answers" ADD CONSTRAINT "user_profile_question_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_profile_question_answers" ADD CONSTRAINT "user_profile_question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."user_profile_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."selected_answer_options" ADD CONSTRAINT "selected_answer_options_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "public"."user_profile_question_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."selected_answer_options" ADD CONSTRAINT "selected_answer_options_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
