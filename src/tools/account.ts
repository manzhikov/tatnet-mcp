import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TatNetClient } from "../client.js";
import { ok, apiErr } from "./_utils.js";

export function registerAccountTools(server: McpServer, client: TatNetClient): void {
  server.tool(
    "tatnet_whoami",
    "Get information about the current API key: account ID, key ID, and attached IAM policy statements",
    {},
    async () => {
      try {
        return ok(await client.get("/account"));
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
