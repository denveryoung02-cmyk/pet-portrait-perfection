const RESEND_API_URL = "https://api.resend.com/emails";

function formatTheme(themeId: string): string {
  return themeId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function sendOrderConfirmationEmail(opts: {
  to: string;
  name: string | null;
  theme: string;
  downloadUrl: string;
  resendApiKey: string;
  orderId?: string;
  petName?: string | null;
}): Promise<void> {
  const { to, name, theme, downloadUrl, resendApiKey, orderId, petName } = opts;
  const displayName = name?.split(" ")[0] ?? "there";
  const themeLabel = formatTheme(theme);
  const petPossessive = petName ? `${petName}'s` : "your pet's";
  const heroPackUrl = orderId ? `https://www.pawtoons.co/hero-pack?order=${orderId}` : null;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #111;">
      <div style="margin-bottom: 32px;">
        <span style="font-size: 28px;">🐾</span>
        <span style="font-size: 20px; font-weight: 700; margin-left: 8px; letter-spacing: -0.5px;">Pawtoons</span>
      </div>
      <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 16px; line-height: 1.2;">Your portrait is ready to download!</h1>
      <p style="color: #555; margin: 0 0 8px;">Hi ${displayName},</p>
      <p style="color: #555; margin: 0 0 28px;">Your <strong>${themeLabel}</strong> Pawtoon portrait is ready. Click below to download your full-resolution image — the link is valid for 24 hours.</p>
      <a href="${downloadUrl}" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; border-radius: 100px; font-weight: 600; font-size: 15px; text-decoration: none; margin-bottom: 32px;">Download your portrait →</a>
      <p style="color: #888; font-size: 13px; margin: 0 0 4px;">Link not working? Copy and paste into your browser:</p>
      <p style="color: #888; font-size: 12px; word-break: break-all; margin: 0 0 32px;">${downloadUrl}</p>
      ${heroPackUrl ? `
      <div style="background: #faf9f7; border-radius: 12px; padding: 16px 20px; margin: 0 0 32px;">
        <p style="color: #555; font-size: 13px; margin: 0 0 8px;">Your Hero Pack is being prepared — ${petPossessive} hero portrait, phone wallpaper, character card, and certificate. It'll be ready to view in your account shortly.</p>
        <a href="${heroPackUrl}" style="color: #000; font-size: 13px; font-weight: 600; text-decoration: underline;">View your Hero Pack →</a>
      </div>
      ` : ""}
      <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 24px;"/>
      <p style="color: #bbb; font-size: 12px; margin: 0;">You can also access your portraits anytime from your <a href="https://www.pawtoons.co/dashboard" style="color: #999;">dashboard</a>. Questions? Reply to this email.</p>
    </div>
  `;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Pawtoons <hello@pawtoons.co>",
      to: [to],
      subject: `Your ${themeLabel} Pawtoon portrait is ready 🐾`,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Resend API error (${res.status}): ${errText.slice(0, 300)}`);
  }
}

export async function sendBundleReadyEmail(opts: {
  to: string;
  name: string | null;
  items: { label: string; downloadUrl: string }[];
  resendApiKey: string;
  orderId?: string;
  petName?: string | null;
}): Promise<void> {
  const { to, name, items, resendApiKey, orderId, petName } = opts;
  const displayName = name?.split(" ")[0] ?? "there";
  const petPossessive = petName ? `${petName}'s` : "your pet's";
  const heroPackUrl = orderId ? `https://www.pawtoons.co/hero-pack?order=${orderId}` : null;

  const linksHtml = items
    .map(
      (item) => `
      <div style="margin-bottom: 20px;">
        <p style="color: #555; margin: 0 0 8px; font-weight: 600;">${item.label}</p>
        <a href="${item.downloadUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 100px; font-weight: 600; font-size: 14px; text-decoration: none;">Download →</a>
      </div>`,
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #111;">
      <div style="margin-bottom: 32px;">
        <span style="font-size: 28px;">🐾</span>
        <span style="font-size: 20px; font-weight: 700; margin-left: 8px; letter-spacing: -0.5px;">Pawtoons</span>
      </div>
      <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 16px; line-height: 1.2;">Your 2 extra styles are ready!</h1>
      <p style="color: #555; margin: 0 0 8px;">Hi ${displayName},</p>
      <p style="color: #555; margin: 0 0 28px;">The other 2 styles from your Pawtoons bundle have finished generating. Click below to download each full-resolution image — links are valid for 1 hour.</p>
      ${linksHtml}
      ${heroPackUrl ? `<p style="color: #555; font-size: 13px; margin: 8px 0 0;">Don't forget — ${petPossessive} Hero Pack is ready to view too: <a href="${heroPackUrl}" style="color: #000; font-weight: 600; text-decoration: underline;">View your Hero Pack →</a></p>` : ""}
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;"/>
      <p style="color: #bbb; font-size: 12px; margin: 0;">You can also access your portraits anytime from your <a href="https://www.pawtoons.co/dashboard" style="color: #999;">dashboard</a>. Questions? Reply to this email.</p>
    </div>
  `;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Pawtoons <hello@pawtoons.co>",
      to: [to],
      subject: "Your 2 extra Pawtoon styles are ready 🐾",
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Resend API error (${res.status}): ${errText.slice(0, 300)}`);
  }
}
