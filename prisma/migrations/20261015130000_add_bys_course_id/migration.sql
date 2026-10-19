-- AlterTable
ALTER TABLE "courses" ADD COLUMN "bys_course_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "courses_bys_course_id_key" ON "courses"("bys_course_id");

-- DropIndex
DROP INDEX "courses_course_code_key";
