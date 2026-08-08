import { tool } from "ai";
import { z } from "zod";
import { desc, sql } from "drizzle-orm";
import { Resend } from "resend";
import { getDb } from "@/db/client";
import { messages } from "@/db/schema";
import { checkRateLimit } from "@/lib/agent/rate-limit";

export const name = "send_message_to_aneeq";

export function makeSendMessageTool(ctx: { ip: string }) {
  return tool({
    description:
      "Send a message from the visitor to Aneeq's inbox (and email). Only call AFTER the visitor has confirmed their email and the exact message text. The recipient is always Aneeq.",
    inputSchema: z.object({
      fromName: z
        .string()
        .max(100)
        .optional()
        .describe("Visitor's name, if given"),
      fromEmail: z
        .string()
        .email()
        .describe("Visitor's email for Aneeq to reply to"),
      message: z
        .string()
        .min(1)
        .max(2000)
        .describe("The confirmed message text"),
    }),
    execute: async ({ fromName, fromEmail, message }) => {
      const allowed = await checkRateLimit("email", ctx.ip, 3, 86400);
      if (!allowed)
        return {
          error:
            "Message limit reached for today. Suggest emailing hassan.aneeq01@gmail.com directly.",
        };

      const db = getDb();
      const [dupe] = await db
        .select({ id: messages.id })
        .from(messages)
        .where(
          sql`${messages.body} = ${message} and ${messages.createdAt} > now() - interval '10 minutes'`,
        )
        .orderBy(desc(messages.createdAt))
        .limit(1);
      if (dupe) return { ok: true, note: "Already delivered moments ago." };

      await db
        .insert(messages)
        .values({ fromName: fromName ?? null, fromEmail, body: message });

      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Portfolio Agent <onboarding@resend.dev>",
          to: "hassan.aneeq01@gmail.com",
          replyTo: fromEmail,
          subject: `Portfolio message from ${fromName ?? fromEmail}`,
          text: `${message}\n\n— ${fromName ?? "Anonymous"} <${fromEmail}>\nvia the portfolio agent`,
        });
      } catch (err) {
        console.error(
          "agent: resend send failed (message stored in inbox)",
          err,
        );
        return {
          ok: true,
          note: "Stored in Aneeq's inbox; email delivery delayed.",
        };
      }
      return { ok: true };
    },
  });
}
