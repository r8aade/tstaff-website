import { prisma } from "@/lib/prisma";

// Agreements employees sign in the app. Body format: plain text, "## " starts a heading,
// a blank line starts a new paragraph. Admins can edit the text at /admin/agreements.
// These defaults are a starting point, not legal advice: have a lawyer review them.

export type AgreementKey = "contractor" | "nda";

export const AGREEMENT_KEYS: AgreementKey[] = ["contractor", "nda"];

/** Which onboarding step each agreement checks off (matched by the step's label). */
export const AGREEMENT_STEP_LABEL: Record<AgreementKey, string> = {
  contractor: "Contractor agreement signed",
  nda: "NDA signed"
};

export function agreementForLabel(label: string): AgreementKey | null {
  const k = AGREEMENT_KEYS.find((key) => AGREEMENT_STEP_LABEL[key].toLowerCase() === label.trim().toLowerCase());
  return k ?? null;
}

export const DEFAULT_AGREEMENTS: Record<AgreementKey, { title: string; body: string }> = {
  contractor: {
    title: "Independent Contractor Agreement",
    body: `This Independent Contractor Agreement ("Agreement") is between Talnt Staffing ("Talnt") and the person signing below ("Contractor"). It starts on the date Contractor signs.

## 1. The work
Talnt places Contractor with Talnt's clients to do remote work such as admin, back-office, customer service, sales support, and technical support. Talnt will tell Contractor which client or clients they are working for, their schedule, and who to report to.

## 2. Independent contractor
Contractor is an independent contractor, not an employee of Talnt or of any client. Contractor is responsible for their own taxes, government contributions, and registrations in the country where they live and work, unless the law requires otherwise.

## 3. Pay
Talnt pays Contractor the hourly rate Talnt confirms in writing, for hours that are recorded in the Talnt time clock and approved by Talnt. Talnt pays on its regular pay schedule using the payment method set up with Contractor. Talnt does not pay for time that is not recorded, or that is outside the agreed schedule unless Talnt or the client approved it in advance.

## 4. Time records
Contractor must clock in when they start work, clock out when they stop, and record breaks, all in the Talnt time clock. Time entries must be honest and accurate. Coming in late and staying late to make up the time is not allowed unless approved in advance. Entering time that was not worked is a serious breach of this Agreement and can lead to non-payment of those hours and ending this Agreement.

## 5. Equipment and workspace
Contractor provides their own computer, reliable internet, a headset, and a quiet place to work, and keeps them in good working order. Contractor must tell Talnt right away if a power, internet, or equipment problem stops them from working.

## 6. Time off
Vacation and sick time follow Talnt's time off policy as shown in the Talnt app. Contractor must request time off in the app and wait for approval, except for sudden illness, which must be reported as soon as possible.

## 7. Confidentiality
Contractor will keep private all non-public information about Talnt, its clients, and their customers, including customer lists, prices, passwords, systems, and business plans. This duty continues after this Agreement ends. Contractor also agrees to the separate Talnt Non-Disclosure Agreement.

## 8. Work product
Everything Contractor creates while working for Talnt or a Talnt client, including documents, data, designs, code, content, and lists, belongs to Talnt or the client as Talnt directs. Contractor assigns all rights in that work to Talnt and will sign any papers needed to confirm this.

## 9. Client accounts and data
Contractor will use client systems and accounts only for the assigned work, will not share login details, and will not copy, download, or keep client data on personal devices or accounts unless the client allows it. Contractor will return or delete all client and Talnt data when asked and when this Agreement ends.

## 10. No poaching
While this Agreement is in effect and for 12 months after it ends, Contractor will not work directly or through another company for any Talnt client they were placed with, and will not try to take Talnt clients or staff away from Talnt, unless Talnt agrees in writing.

## 11. Ending this Agreement
Either side can end this Agreement with 14 days' written notice. Talnt can end it right away for serious misconduct, including false time entries, sharing confidential information, or misuse of client systems. Talnt will pay for approved hours worked up to the end date.

## 12. Whole agreement
This Agreement, the Non-Disclosure Agreement, and Talnt's written policies are the whole agreement between Talnt and Contractor about this work. Changes must be in writing. If any part of this Agreement cannot be enforced, the rest still applies.

## 13. Electronic signature
Contractor agrees to sign this Agreement electronically. An electronic signature has the same effect as a signature on paper.`
  },
  nda: {
    title: "Non-Disclosure Agreement",
    body: `This Non-Disclosure Agreement ("NDA") is between Talnt Staffing ("Talnt") and the person signing below ("Recipient"). It starts on the date Recipient signs.

## 1. Confidential information
"Confidential Information" means any non-public information Recipient sees or learns while working with Talnt or a Talnt client. This includes business plans, prices and rates, customer and supplier lists, customer personal data, financial information, passwords and login details, systems and software, processes, and anything marked or clearly meant to be private.

## 2. What is not confidential
Information is not confidential if it is already public through no fault of Recipient, if Recipient already knew it before working with Talnt, or if Recipient received it lawfully from someone else with no duty to keep it private.

## 3. Recipient's promises
Recipient will:
- use Confidential Information only to do their assigned work;
- not share it with anyone except people at Talnt or the client who need it for the work;
- not copy, photograph, download, or forward it to personal email, devices, or accounts unless the work requires it and the client allows it;
- keep passwords and logins private and never share them;
- tell Talnt right away if they think Confidential Information was lost, shared, or misused.

## 4. Customer personal data
Recipient will handle customer personal data with care, follow the client's privacy rules, and follow data privacy laws that apply, such as the Philippine Data Privacy Act where it applies.

## 5. When the law requires sharing
If a court or government agency legally requires Recipient to share Confidential Information, Recipient will tell Talnt first (if allowed) and share only what is required.

## 6. Returning information
When asked, and when the work ends, Recipient will return or delete all Confidential Information and copies, and confirm this in writing if Talnt asks.

## 7. How long this lasts
This NDA continues after Recipient stops working with Talnt. Recipient's duties last for 5 years after the work ends, and for trade secrets and customer personal data, for as long as the information stays confidential.

## 8. Breach
If Recipient breaks this NDA, Talnt may end the working relationship right away and may seek any remedy the law allows, including a court order to stop the misuse.

## 9. Electronic signature
Recipient agrees to sign this NDA electronically. An electronic signature has the same effect as a signature on paper.`
  }
};

export type Agreement = { key: AgreementKey; title: string; body: string; version: number; updatedAt: Date | null };

export function isAgreementKey(k: string): k is AgreementKey {
  return (AGREEMENT_KEYS as string[]).includes(k);
}

/** Current text for an agreement: the admin-edited version, or the default. */
export async function getAgreement(key: AgreementKey): Promise<Agreement> {
  const row = await prisma.agreementTemplate.findUnique({ where: { key } });
  if (row) return { key, title: row.title, body: row.body, version: row.version, updatedAt: row.updatedAt };
  return { key, ...DEFAULT_AGREEMENTS[key], version: 1, updatedAt: null };
}

export { parseBody, type Block } from "@/lib/agreementText";
