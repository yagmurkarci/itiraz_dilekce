-- CreateTable
CREATE TABLE "course_departments" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_departments_course_id_department_id_key" ON "course_departments"("course_id", "department_id");

-- AddForeignKey
ALTER TABLE "course_departments" ADD CONSTRAINT "course_departments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_departments" ADD CONSTRAINT "course_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
