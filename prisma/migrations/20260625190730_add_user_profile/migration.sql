-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "timeOfBirth" TEXT,
    "birthTimeUnknown" BOOLEAN NOT NULL DEFAULT false,
    "birthCity" TEXT,
    "birthState" TEXT,
    "birthCountry" TEXT,
    "birthLat" DOUBLE PRECISION,
    "birthLng" DOUBLE PRECISION,
    "birthTimezone" TEXT,
    "currentCity" TEXT,
    "currentLat" DOUBLE PRECISION,
    "currentLng" DOUBLE PRECISION,
    "language" TEXT DEFAULT 'English',
    "maritalStatus" TEXT,
    "caste" TEXT,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_clerkUserId_key" ON "UserProfile"("clerkUserId");
