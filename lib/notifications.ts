import { Resend } from "resend";

interface AdminNotificationInput {
  subject: string;
  lines: string[];
}

function getNotificationConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!apiKey || !from || !to) {
    return null;
  }

  return {
    client: new Resend(apiKey),
    from,
    to,
  };
}

export async function sendAdminNotification(input: AdminNotificationInput) {
  const config = getNotificationConfig();
  if (!config) return;

  try {
    await config.client.emails.send({
      from: config.from,
      to: [config.to],
      subject: input.subject,
      text: input.lines.join("\n"),
    });
  } catch (error) {
    console.error("admin notification failed", error);
  }
}
