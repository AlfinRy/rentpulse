import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { components } from "./_generated/api";
import { AgentMail } from "@agentmail/convex";

const agentmail = new AgentMail(components.agentmail);

const http = httpRouter();

// AgentMail delivery events + inbound replies land here.
// Register https://<deployment>.convex.site/agentmail/webhook in the
// AgentMail dashboard and set AGENTMAIL_WEBHOOK_SECRET.
http.route({
  path: "/agentmail/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => agentmail.handleWebhook(ctx, req)),
});

export default http;
