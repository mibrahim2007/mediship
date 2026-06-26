import { z } from "zod"

export const journalLineSchema = z.object({
  account_id:  z.string().uuid("Select an account"),
  description: z.string().optional(),
  debit:       z.coerce.number().min(0),
  credit:      z.coerce.number().min(0),
  sort_order:  z.number(),
})

export const journalEntrySchema = z.object({
  entry_date:   z.string().min(1, "Date is required"),
  journal_type: z.enum(["sale", "purchase", "cash", "bank", "general"]),
  voucher_type: z.enum(["INV", "BILL", "CPV", "CRV", "BPV", "BRV", "JV"]),
  reference:    z.string().optional(),
  narration:    z.string().optional(),
  lines:        z.array(journalLineSchema).min(2, "At least 2 lines required"),
}).refine((d) => {
  const totalDebit  = d.lines.reduce((s, l) => s + Number(l.debit  ?? 0), 0)
  const totalCredit = d.lines.reduce((s, l) => s + Number(l.credit ?? 0), 0)
  return Math.abs(totalDebit - totalCredit) < 0.01
}, { message: "Total debits must equal total credits", path: ["lines"] })

export type JournalEntryInput = z.infer<typeof journalEntrySchema>
export type JournalLineInput  = z.infer<typeof journalLineSchema>

export const accountSchema = z.object({
  code:         z.string().min(1, "Account code is required"),
  name:         z.string().min(1, "Account name is required"),
  account_type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parent_id:    z.string().uuid().optional().or(z.literal("")),
})

export type AccountInput = z.infer<typeof accountSchema>
