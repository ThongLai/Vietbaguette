-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MenuOption" ADD COLUMN     "multiSelect" BOOLEAN NOT NULL DEFAULT false;
