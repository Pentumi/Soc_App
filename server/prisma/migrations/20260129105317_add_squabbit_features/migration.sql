/*
  Warnings:

  - You are about to drop the column `flight` on the `tournament_participants` table. All the data in the column will be lost.
  - You are about to drop the column `team` on the `tournament_participants` table. All the data in the column will be lost.
  - Made the column `invite_code` on table `tournaments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "tournament_participants_flight_idx";

-- AlterTable
ALTER TABLE "tournament_participants" DROP COLUMN "flight",
DROP COLUMN "team",
ADD COLUMN     "flight_id" INTEGER,
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
ADD COLUMN     "team_id" INTEGER,
ADD COLUMN     "waitlist_position" INTEGER;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "entry_fee" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "handicap_percentage" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "holes_per_round" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN     "league_id" INTEGER,
ADD COLUMN     "num_rounds" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "registration_deadline" TIMESTAMP(3),
ADD COLUMN     "use_course_handicap" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "invite_code" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auto_update_handicap" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "home_course_id" INTEGER;

-- CreateTable
CREATE TABLE "leagues" (
    "id" SERIAL NOT NULL,
    "club_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo_url" TEXT,
    "invite_code" TEXT NOT NULL,
    "season_name" TEXT,
    "season_start" DATE,
    "season_end" DATE,
    "scoring_format" TEXT NOT NULL DEFAULT 'stableford',
    "points_system" JSONB,
    "settings" JSONB,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_members" (
    "id" SERIAL NOT NULL,
    "league_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'spectator',
    "season_points" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "events_played" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flights" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "min_handicap" DECIMAL(4,1),
    "max_handicap" DECIMAL(4,1),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorecards" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "flight_id" INTEGER,
    "round_number" INTEGER NOT NULL DEFAULT 1,
    "tee_time" TIMESTAMP(3),
    "starting_hole" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorecard_players" (
    "id" SERIAL NOT NULL,
    "scorecard_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "playing_handicap" DECIMAL(4,1),

    CONSTRAINT "scorecard_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_games" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "game_type" TEXT NOT NULL,
    "name" TEXT,
    "settings" JSONB,
    "rounds_applied" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hole_competitions" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "hole_number" INTEGER NOT NULL,
    "competition_type" TEXT NOT NULL,
    "prize_description" TEXT,
    "winner_id" INTEGER,
    "winning_distance" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hole_competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" SERIAL NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" SERIAL NOT NULL,
    "follower_id" INTEGER NOT NULL,
    "following_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leagues_invite_code_key" ON "leagues"("invite_code");

-- CreateIndex
CREATE INDEX "league_members_user_id_idx" ON "league_members"("user_id");

-- CreateIndex
CREATE INDEX "league_members_league_id_idx" ON "league_members"("league_id");

-- CreateIndex
CREATE UNIQUE INDEX "league_members_league_id_user_id_key" ON "league_members"("league_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "scorecard_players_scorecard_id_user_id_key" ON "scorecard_players"("scorecard_id", "user_id");

-- CreateIndex
CREATE INDEX "chat_messages_entity_type_entity_id_idx" ON "chat_messages"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "photos_entity_type_entity_id_idx" ON "photos"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "follows_follower_id_idx" ON "follows"("follower_id");

-- CreateIndex
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");

-- CreateIndex
CREATE INDEX "tournament_participants_flight_id_idx" ON "tournament_participants"("flight_id");

-- CreateIndex
CREATE INDEX "tournament_participants_team_id_idx" ON "tournament_participants"("team_id");

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_home_course_id_fkey" FOREIGN KEY ("home_course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecards" ADD CONSTRAINT "scorecards_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecards" ADD CONSTRAINT "scorecards_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecards" ADD CONSTRAINT "scorecards_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecard_players" ADD CONSTRAINT "scorecard_players_scorecard_id_fkey" FOREIGN KEY ("scorecard_id") REFERENCES "scorecards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorecard_players" ADD CONSTRAINT "scorecard_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_games" ADD CONSTRAINT "tournament_games_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hole_competitions" ADD CONSTRAINT "hole_competitions_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hole_competitions" ADD CONSTRAINT "hole_competitions_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
