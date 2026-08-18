-- Rename Role enum values to match VC-KT-002 Mục 5: VAST_ADMIN -> SUPERADMIN,
-- HOI_ADMIN -> ADMIN. Uses ALTER TYPE ... RENAME VALUE instead of drop/recreate
-- so existing rows keep their role without a manual UPDATE step.
ALTER TYPE "Role" RENAME VALUE 'VAST_ADMIN' TO 'SUPERADMIN';
ALTER TYPE "Role" RENAME VALUE 'HOI_ADMIN' TO 'ADMIN';
