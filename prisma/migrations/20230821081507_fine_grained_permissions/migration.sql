BEGIN;

-- Step 1: Create the new enum type
CREATE TYPE "AccessLevel_new" AS ENUM ('Admin', 'TeamMember', 'ViewOnly', 'SubmitOnly');

-- Step 2: Update rows that use the 'Normal' value to use the new enum type's 'TeamMember' value
ALTER TABLE "Permission" ALTER COLUMN "accessLevel" TYPE "AccessLevel_new" USING (CASE WHEN "accessLevel" = 'Normal' THEN 'TeamMember'::text ELSE "accessLevel"::text END)::"AccessLevel_new";
ALTER TABLE "Invite" ALTER COLUMN "accessLevel" TYPE "AccessLevel_new" USING (CASE WHEN "accessLevel" = 'Normal' THEN 'TeamMember'::text ELSE "accessLevel"::text END)::"AccessLevel_new";

-- Step 3: Alter the columns to use the new enum type
ALTER TABLE "Permission" ALTER COLUMN "accessLevel" TYPE "AccessLevel_new" USING "accessLevel"::text::"AccessLevel_new";
ALTER TABLE "Invite" ALTER COLUMN "accessLevel" TYPE "AccessLevel_new" USING "accessLevel"::text::"AccessLevel_new";

-- Step 4: Rename and drop the old enum type
ALTER TYPE "AccessLevel" RENAME TO "AccessLevel_old";
ALTER TYPE "AccessLevel_new" RENAME TO "AccessLevel";
DROP TYPE "AccessLevel_old";

COMMIT;
