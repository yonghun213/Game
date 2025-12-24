-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "timezone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planned_open_date" DATETIME NOT NULL,
    "actual_open_date" DATETIME,
    "template_version" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TemplatePhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "TemplatePhase_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phase_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role_responsible" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "dependency_indices" TEXT,
    CONSTRAINT "TemplateTask_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "TemplatePhase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
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
    "owner_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Task_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "task_id" TEXT NOT NULL,
    "depends_on_id" TEXT NOT NULL,

    PRIMARY KEY ("task_id", "depends_on_id"),
    CONSTRAINT "TaskDependency_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskDependency_depends_on_id_fkey" FOREIGN KEY ("depends_on_id") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Milestone_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mitigation" TEXT,
    CONSTRAINT "Issue_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Document_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit_type" TEXT NOT NULL,
    "category" TEXT
);

-- CreateTable
CREATE TABLE "GroceryPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "country" TEXT NOT NULL,
    "retailer" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "package_size" REAL NOT NULL,
    "package_unit" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "normalized_price_per_unit" REAL NOT NULL,
    "as_of" DATETIME NOT NULL,
    "source_url" TEXT,
    CONSTRAINT "GroceryPrice_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grocery_price_id" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "changed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" TEXT,
    "reason" TEXT,
    CONSTRAINT "PriceHistory_grocery_price_id_fkey" FOREIGN KEY ("grocery_price_id") REFERENCES "GroceryPrice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "menu_item" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "country" TEXT,
    "yield_count" REAL NOT NULL DEFAULT 1,
    "target_cost_pct" REAL NOT NULL DEFAULT 0.30,
    "manual_price" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecipeLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipe_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    CONSTRAINT "RecipeLine_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeLine_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitorPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "country" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "menu_item" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "as_of" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FXRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from_currency" TEXT NOT NULL,
    "to_currency" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_TaskCollaborator" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TaskCollaborator_A_fkey" FOREIGN KEY ("A") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TaskCollaborator_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_TaskCollaborator_AB_unique" ON "_TaskCollaborator"("A", "B");

-- CreateIndex
CREATE INDEX "_TaskCollaborator_B_index" ON "_TaskCollaborator"("B");
