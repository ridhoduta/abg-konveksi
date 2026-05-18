-- AlterTable
ALTER TABLE "OrderPayment" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "proofOfPayment" TEXT,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
