// Cloudflare Turnstile ("I'm human" check) — server-side verification.
// Off until TURNSTILE_SECRET_KEY is set in Vercel, so forms keep working before setup.

export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY);

export async function verifyTurnstile(token: unknown, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) console.warn("Turnstile check failed:", data["error-codes"]?.join(", ") || "unknown");
    return data.success === true;
  } catch (err) {
    // If Cloudflare itself is unreachable, don't lose a real client's form.
    console.error("Turnstile verify request failed, letting the form through:", err);
    return true;
  }
}
