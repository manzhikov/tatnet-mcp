import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TatNetClient } from "../client.js";
import { ok, apiErr } from "./_utils.js";

export function registerProjectTools(server: McpServer, client: TatNetClient): void {
  server.tool(
    "tatnet_projects_list",
    "List all projects in the account",
    {
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (1–200, default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ limit, offset }) => {
      try {
        return ok(await client.get("/projects", { limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_projects_get",
    "Get a project by ID",
    {
      project_id: z.string().describe("Project UUID"),
    },
    async ({ project_id }) => {
      try {
        return ok(await client.get(`/projects/${project_id}`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
