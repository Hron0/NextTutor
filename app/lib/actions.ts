'use server'

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
})
//Create - Delete
const InvoiceValidate = FormSchema.omit({ id: true, date: true })

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = InvoiceValidate.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })
    const amountInCents = amount * 100
    const date = new Date().toISOString().split('T')[0]

    try {
        await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `

    } catch (err) {
        return { message: `Error while Creating Invoice, ${err}` }
    }
    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = InvoiceValidate.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })

    const amountInCents = amount * 100

    try {
        await sql`
    UPDATE invoices
    set customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `
    } catch (err) {
        return { message: `Error while Updating Invoice, ${err}` }
    }
    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
    throw new Error(`Failed to Delete Invoice`)

    try {
        await sql`
    DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices')
    } catch (err) {
        return { message: `Error while Deleting Invoice, ${err}` }
    }

}