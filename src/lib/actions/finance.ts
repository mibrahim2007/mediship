"use server"

import { requireTenantSession } from "@/lib/auth/session"
import {
  createJournalEntry,
  postJournalEntry,
  cancelJournalEntry,
  getNextEntryNo,
  createAccount,
} from "@/lib/db/finance"
import {
  journalEntrySchema,
  accountSchema,
  type JournalEntryInput,
  type AccountInput,
} from "@/lib/validations/finance"
import { revalidatePath } from "next/cache"

export async function createJournalEntryAction(input: JournalEntryInput) {
  const session = await requireTenantSession()
  const data = journalEntrySchema.parse(input)

  const totalDebit  = data.lines.reduce((s, l) => s + Number(l.debit  ?? 0), 0)
  const totalCredit = data.lines.reduce((s, l) => s + Number(l.credit ?? 0), 0)
  const entry_no = await getNextEntryNo(session.companyId!)

  const entry = await createJournalEntry({
    company_id:   session.companyId!,
    entry_no,
    entry_date:   data.entry_date,
    journal_type: data.journal_type,
    voucher_type: data.voucher_type,
    reference:    data.reference || undefined,
    narration:    data.narration || undefined,
    status:       "draft",
    total_debit:  totalDebit,
    total_credit: totalCredit,
    created_by:   session.userId!,
    lines: data.lines.map((l, i) => ({
      account_id:  l.account_id,
      description: l.description || undefined,
      debit:       Number(l.debit ?? 0),
      credit:      Number(l.credit ?? 0),
      sort_order:  i,
    })),
  })

  revalidatePath("/finance")
  return entry
}

export async function postJournalEntryAction(id: string) {
  const session = await requireTenantSession()
  await postJournalEntry(id, session.companyId!)
  revalidatePath("/finance")
  revalidatePath("/finance/journal/" + id)
}

export async function cancelJournalEntryAction(id: string) {
  const session = await requireTenantSession()
  await cancelJournalEntry(id, session.companyId!)
  revalidatePath("/finance")
  revalidatePath("/finance/journal/" + id)
}

export async function createAccountAction(input: AccountInput) {
  const session = await requireTenantSession()
  const data = accountSchema.parse(input)
  const account = await createAccount({
    company_id:   session.companyId!,
    code:         data.code,
    name:         data.name,
    account_type: data.account_type,
    parent_id:    data.parent_id || undefined,
  })
  revalidatePath("/finance/accounts")
  return account
}
