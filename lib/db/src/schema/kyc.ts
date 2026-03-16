import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const kycDocStatusEnum = pgEnum("kyc_doc_status", ["pending", "submitted", "approved", "rejected"]);

export const kycDocumentsTable = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  idDocumentType: text("id_document_type"),
  idDocumentUrl: text("id_document_url"),
  addressProofType: text("address_proof_type"),
  addressProofUrl: text("address_proof_url"),
  status: kycDocStatusEnum("status").notNull().default("submitted"),
  rejectionReason: text("rejection_reason"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertKycSchema = createInsertSchema(kycDocumentsTable).omit({ id: true, submittedAt: true });
export type InsertKyc = z.infer<typeof insertKycSchema>;
export type KycDocument = typeof kycDocumentsTable.$inferSelect;
