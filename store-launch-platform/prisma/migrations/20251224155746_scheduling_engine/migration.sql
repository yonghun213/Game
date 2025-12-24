/*
  Warnings:

  - Added the required column `type` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anchor_event` to the `TemplateTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offset_days` to the `TemplateTask` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Milestone_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("date", "id", "name", "status", "store_id") SELECT "date", "id", "name", "status", "store_id" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "phase" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "start_date" DATETIME,
    "due_date" DATETIME,
    "completed_at" DATETIME,
    "manual_override" BOOLEAN NOT NULL DEFAULT false,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "reschedule_mode" TEXT NOT NULL DEFAULT 'SHIFT_DOWNSTREAM',
    "calendar_rule" TEXT NOT NULL DEFAULT 'CALENDAR_DAYS',
    "owner_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Task_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("completed_at", "created_at", "description", "due_date", "id", "owner_id", "phase", "priority", "start_date", "status", "store_id", "title", "updated_at") SELECT "completed_at", "created_at", "description", "due_date", "id", "owner_id", "phase", "priority", "start_date", "status", "store_id", "title", "updated_at" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "timezone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planned_open_date" DATETIME,
    "actual_open_date" DATETIME,
    "contract_signed_date" DATETIME,
    "template_version" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Store" ("actual_open_date", "address", "city", "country", "created_at", "id", "name", "planned_open_date", "status", "template_version", "timezone", "updated_at") SELECT "actual_open_date", "address", "city", "country", "created_at", "id", "name", "planned_open_date", "status", "template_version", "timezone", "updated_at" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE TABLE "new_TemplateTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phase_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role_responsible" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "anchor_event" TEXT NOT NULL,
    "offset_days" INTEGER NOT NULL,
    "workday_rule" TEXT NOT NULL DEFAULT 'CALENDAR_DAYS',
    "is_milestone" BOOLEAN NOT NULL DEFAULT false,
    "dependency_indices" TEXT,
    CONSTRAINT "TemplateTask_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "TemplatePhase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TemplateTask" ("dependency_indices", "description", "duration_days", "id", "name", "phase_id", "role_responsible") SELECT "dependency_indices", "description", "duration_days", "id", "name", "phase_id", "role_responsible" FROM "TemplateTask";
DROP TABLE "TemplateTask";
ALTER TABLE "new_TemplateTask" RENAME TO "TemplateTask";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
