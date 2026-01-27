-- CreateTable
CREATE TABLE "societies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "default_format" TEXT NOT NULL DEFAULT 'Stroke Play',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "societies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "society_id" INTEGER,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "profile_photo" TEXT,
    "current_handicap" DECIMAL(4,1),
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "par" INTEGER NOT NULL,
    "slope_rating" DECIMAL(5,1),
    "course_rating" DECIMAL(5,1),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holes" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "hole_number" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "stroke_index" INTEGER,
    "yardage" INTEGER,

    CONSTRAINT "holes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" SERIAL NOT NULL,
    "society_id" INTEGER,
    "name" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,
    "tournament_date" DATE NOT NULL,
    "start_time" TEXT,
    "format" TEXT NOT NULL DEFAULT 'Stroke Play',
    "is_major" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_scores" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "gross_score" INTEGER NOT NULL,
    "handicap_at_time" DECIMAL(4,1) NOT NULL,
    "net_score" INTEGER NOT NULL,
    "stableford_points" INTEGER,
    "position" INTEGER,
    "handicap_adjustment" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hole_scores" (
    "id" SERIAL NOT NULL,
    "tournament_score_id" INTEGER NOT NULL,
    "hole_id" INTEGER NOT NULL,
    "strokes" INTEGER NOT NULL,
    "stableford_points" INTEGER,
    "putts" INTEGER,
    "fairway_hit" BOOLEAN,
    "green_in_regulation" BOOLEAN,

    CONSTRAINT "hole_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handicap_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "handicap_index" DECIMAL(4,1) NOT NULL,
    "tournament_id" INTEGER,
    "reason" TEXT,
    "effective_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "handicap_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friends" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "friend_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "holes_course_id_hole_number_key" ON "holes"("course_id", "hole_number");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_scores_tournament_id_user_id_key" ON "tournament_scores"("tournament_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hole_scores_tournament_score_id_hole_id_key" ON "hole_scores"("tournament_score_id", "hole_id");

-- CreateIndex
CREATE UNIQUE INDEX "friends_user_id_friend_id_key" ON "friends"("user_id", "friend_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "societies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holes" ADD CONSTRAINT "holes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "societies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_scores" ADD CONSTRAINT "tournament_scores_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_scores" ADD CONSTRAINT "tournament_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_tournament_score_id_fkey" FOREIGN KEY ("tournament_score_id") REFERENCES "tournament_scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_hole_id_fkey" FOREIGN KEY ("hole_id") REFERENCES "holes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handicap_history" ADD CONSTRAINT "handicap_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

