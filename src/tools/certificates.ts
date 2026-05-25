import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TatNetClient } from "../client.js";
import { ok, apiErr } from "./_utils.js";

export function registerCertificateTools(server: McpServer, client: TatNetClient): void {
  server.tool(
    "tatnet_certificates_list",
    "List TLS certificates in the account (auto-issued by the platform for app domains). Read-only.",
    {
      domain: z.string().optional().describe("Filter by primary domain (exact match)"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ domain, limit, offset }) => {
      try {
        return ok(await client.get("/certificates", { domain, limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
