import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TatNetClient } from "../client.js";
import { ok, deleted, apiErr } from "./_utils.js";

export function registerSshKeyTools(server: McpServer, client: TatNetClient): void {
  server.tool(
    "tatnet_ssh_keys_list",
    "List SSH public keys stored in the account",
    {
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ limit, offset }) => {
      try {
        return ok(await client.get("/ssh-keys", { limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_ssh_keys_create",
    "Add an SSH public key to the account for use when creating VMs",
    {
      name: z.string().describe("Display name for this key"),
      public_key: z.string().describe("SSH public key string (must start with 'ssh-rsa', 'ssh-ed25519', 'ecdsa-sha2-nistp256', etc.)"),
    },
    async ({ name, public_key }) => {
      try {
        return ok(await client.post("/ssh-keys", { name, public_key }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_ssh_keys_delete",
    "Delete an SSH key from the account",
    {
      key_id: z.string().describe("SSH key UUID"),
    },
    async ({ key_id }) => {
      try {
        await client.del(`/ssh-keys/${key_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
