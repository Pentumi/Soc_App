-- GolfCru: Society to Club Architecture Migration
-- This migration transforms the single-society model to multi-club architecture

BEGIN;

-- Step 1: Create new Club table (renamed from Society)
CREATE TABLE "clubs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "default_format" TEXT NOT NULL DEFAULT 'Stroke Play',
    "allow_self_join" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clubs_invite_code_key" ON "clubs"("invite_code");

-- Step 2: Create ClubMember table
CREATE TABLE "club_members" (
    "id" SERIAL NOT NULL,
    "club_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "club_members_club_id_user_id_key" ON "club_members"("club_id", "user_id");
CREATE INDEX "club_members_user_id_idx" ON "club_members"("user_id");
CREATE INDEX "club_members_club_id_idx" ON "club_members"("club_id");

-- Step 3: Create TournamentParticipant table
CREATE TABLE "tournament_participants" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "team" TEXT,
    "flight" TEXT,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tournament_participants_tournament_id_user_id_key" ON "tournament_participants"("tournament_id", "user_id");
CREATE INDEX "tournament_participants_user_id_idx" ON "tournament_participants"("user_id");
CREATE INDEX "tournament_participants_tournament_id_idx" ON "tournament_participants"("tournament_id");
CREATE INDEX "tournament_participants_flight_idx" ON "tournament_participants"("flight");

-- Step 4: Migrate Society data to Club table
-- Generate UUID for invite code and set first admin as owner
INSERT INTO "clubs" ("id", "name", "invite_code", "owner_id", "default_format", "created_at", "updated_at")
SELECT
    s."id",
    s."name",
    gen_random_uuid()::text,
    COALESCE(
        (SELECT u."id" FROM "users" u WHERE u."society_id" = s."id" AND u."role" = 'admin' ORDER BY u."created_at" LIMIT 1),
        (SELECT u."id" FROM "users" u WHERE u."society_id" = s."id" ORDER BY u."created_at" LIMIT 1)
    ) as owner_id,
    s."default_format",
    s."created_at",
    s."updated_at"
FROM "societies" s;

-- Step 5: Migrate User roles to ClubMember records
-- Map admin users: first admin becomes owner, rest become admin
WITH ranked_admins AS (
    SELECT
        u."id" as user_id,
        u."society_id" as club_id,
        u."role",
        u."created_at",
        ROW_NUMBER() OVER (PARTITION BY u."society_id" ORDER BY u."created_at") as rn
    FROM "users" u
    WHERE u."society_id" IS NOT NULL
)
INSERT INTO "club_members" ("club_id", "user_id", "role", "joined_at")
SELECT
    club_id,
    user_id,
    CASE
        WHEN role = 'admin' AND rn = 1 THEN 'owner'
        WHEN role = 'admin' THEN 'admin'
        ELSE 'player'
    END as mapped_role,
    created_at
FROM ranked_admins;

-- Step 6: Create TournamentParticipant records from existing TournamentScores
INSERT INTO "tournament_participants" ("tournament_id", "user_id", "role", "status", "joined_at")
SELECT DISTINCT
    ts."tournament_id",
    ts."user_id",
    'player' as role,
    'registered' as status,
    ts."created_at" as joined_at
FROM "tournament_scores" ts
ON CONFLICT ("tournament_id", "user_id") DO NOTHING;

-- Step 7: Add new columns to tournaments table
ALTER TABLE "tournaments" ADD COLUMN "club_id" INTEGER;
ALTER TABLE "tournaments" ADD COLUMN "invite_code" TEXT;
ALTER TABLE "tournaments" ADD COLUMN "allow_self_join" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tournaments" ADD COLUMN "player_cap" INTEGER;
ALTER TABLE "tournaments" ADD COLUMN "leaderboard_visible" BOOLEAN NOT NULL DEFAULT true;

-- Migrate societyId to clubId
UPDATE "tournaments" SET "club_id" = "society_id" WHERE "society_id" IS NOT NULL;

-- Generate invite codes for tournaments
UPDATE "tournaments" SET "invite_code" = gen_random_uuid()::text;

-- Make club_id NOT NULL and add unique constraint on invite_code
ALTER TABLE "tournaments" ALTER COLUMN "club_id" SET NOT NULL;
CREATE UNIQUE INDEX "tournaments_invite_code_key" ON "tournaments"("invite_code");

-- Step 8: Add participantId to tournament_scores
ALTER TABLE "tournament_scores" ADD COLUMN "participant_id" INTEGER;

-- Populate participantId from tournament_participants
UPDATE "tournament_scores" ts
SET "participant_id" = tp."id"
FROM "tournament_participants" tp
WHERE ts."tournament_id" = tp."tournament_id"
  AND ts."user_id" = tp."user_id";

-- Make participantId NOT NULL
ALTER TABLE "tournament_scores" ALTER COLUMN "participant_id" SET NOT NULL;

-- Step 9: Add foreign key constraints
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "club_members" ADD CONSTRAINT "club_members_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "club_members" ADD CONSTRAINT "club_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tournament_scores" ADD CONSTRAINT "tournament_scores_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "tournament_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Drop old columns and constraints
ALTER TABLE "tournaments" DROP CONSTRAINT IF EXISTS "tournaments_society_id_fkey";
ALTER TABLE "tournaments" DROP COLUMN "society_id";

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_society_id_fkey";
ALTER TABLE "users" DROP COLUMN "society_id";
ALTER TABLE "users" DROP COLUMN "role";

-- Step 11: Drop old Society table (now renamed to clubs)
DROP TABLE "societies";

-- Step 12: Verification queries
DO $$
DECLARE
    orphaned_users INT;
    orphaned_scores INT;
    clubs_without_owner INT;
BEGIN
    -- Check for users without club memberships
    SELECT COUNT(*) INTO orphaned_users
    FROM "users" u
    WHERE u."id" NOT IN (SELECT "user_id" FROM "club_members");

    IF orphaned_users > 0 THEN
        RAISE WARNING 'Found % users without club memberships', orphaned_users;
    END IF;

    -- Check for tournament scores without participants
    SELECT COUNT(*) INTO orphaned_scores
    FROM "tournament_scores" ts
    WHERE ts."participant_id" IS NULL;

    IF orphaned_scores > 0 THEN
        RAISE EXCEPTION 'Migration failed: Found % tournament scores without participants', orphaned_scores;
    END IF;

    -- Check for clubs without valid owner
    SELECT COUNT(*) INTO clubs_without_owner
    FROM "clubs" c
    WHERE c."owner_id" NOT IN (SELECT "id" FROM "users");

    IF clubs_without_owner > 0 THEN
        RAISE EXCEPTION 'Migration failed: Found % clubs without valid owner', clubs_without_owner;
    END IF;

    RAISE NOTICE 'Migration validation passed successfully';
END $$;

COMMIT;

-- Migration Summary:
-- ✓ Society → Club (with invite codes and owner)
-- ✓ User global roles → ClubMember roles (owner/admin/player)
-- ✓ TournamentScore → TournamentParticipant (registration tracking)
-- ✓ Tournament updated with club_id, invite codes, settings
-- ✓ All foreign keys and constraints added
-- ✓ Data integrity verified
