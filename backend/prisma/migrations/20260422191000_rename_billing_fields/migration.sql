PRAGMA foreign_keys=OFF;

ALTER TABLE "User" RENAME COLUMN "stripeCustomerId" TO "billingCustomerId";
ALTER TABLE "Subscription" RENAME COLUMN "stripeSubId" TO "gatewaySubId";

DROP INDEX IF EXISTS "Subscription_stripeSubId_key";
CREATE UNIQUE INDEX "Subscription_gatewaySubId_key" ON "Subscription"("gatewaySubId");

PRAGMA foreign_keys=ON;
