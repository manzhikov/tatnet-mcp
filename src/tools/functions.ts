import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TatNetClient } from "../client.js";
import { ok, deleted, apiErr } from "./_utils.js";

export function registerFunctionTools(server: McpServer, client: TatNetClient): void {
  // ── Functions ──────────────────────────────────────────────────────────────

  server.tool(
    "tatnet_functions_list",
    "List serverless functions in a project",
    {
      project_id: z.string().describe("Project UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ project_id, limit, offset }) => {
      try {
        return ok(await client.get(`/projects/${project_id}/functions`, { limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_functions_create",
    "Create a serverless function with inline code. Supported runtimes: Go, Python, Node.js.",
    {
      project_id: z.string().describe("Project UUID"),
      name: z.string().min(1).max(255).describe("Function name"),
      runtime: z.enum(["go", "python", "node"]).describe("Runtime: 'go', 'python', or 'node'"),
      code: z.string().describe("Function source code inline"),
      vpc_id: z.string().optional().describe("VPC UUID to attach the function to (for private network access)"),
    },
    async ({ project_id, name, runtime, code, vpc_id }) => {
      try {
        return ok(
          await client.post(`/projects/${project_id}/functions`, { name, runtime, code, vpc_id })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_functions_get",
    "Get a serverless function by ID (includes invoke_url)",
    {
      project_id: z.string().describe("Project UUID"),
      function_id: z.string().describe("Function UUID"),
    },
    async ({ project_id, function_id }) => {
      try {
        return ok(await client.get(`/projects/${project_id}/functions/${function_id}`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_functions_delete",
    "Delete a serverless function",
    {
      project_id: z.string().describe("Project UUID"),
      function_id: z.string().describe("Function UUID"),
    },
    async ({ project_id, function_id }) => {
      try {
        await client.del(`/projects/${project_id}/functions/${function_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_functions_deploy",
    "Deploy (build) a serverless function to make it invocable via its HTTP endpoint",
    {
      project_id: z.string().describe("Project UUID"),
      function_id: z.string().describe("Function UUID"),
    },
    async ({ project_id, function_id }) => {
      try {
        return ok(
          await client.post(`/projects/${project_id}/functions/${function_id}/deploy`)
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  // ── Environment Variables ──────────────────────────────────────────────────

  server.tool(
    "tatnet_function_env_list",
    "List environment variables for a serverless function (secret values are masked)",
    {
      project_id: z.string().describe("Project UUID"),
      function_id: z.string().describe("Function UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ project_id, function_id, limit, offset }) => {
      try {
        return ok(
          await client.get(`/projects/${project_id}/functions/${function_id}/env`, {
            limit,
            offset,
          })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_function_env_create",
    "Add an environment variable to a serverless function",
    {
      project_id: z.string().describe("Project UUID"),
      function_id: z.string().describe("Function UUID"),
      name: z.string().min(1).max(255).describe("Environment variable name"),
      value: z.string().min(1).describe("Environment variable value"),
      is_secret: z.boolean().optional().describe("Mark as secret — value will be masked in API responses (default false)"),
    },
    async ({ project_id, function_id, name, value, is_secret }) => {
      try {
        return ok(
          await client.post(`/projects/${project_id}/functions/${function_id}/env`, {
            name,
            value,
            is_secret,
          })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_function_env_delete",
    "Delete an environment variable from a serverless function",
    {
      project_id: z.string().describe("Project UUID"),
      function_id: z.string().describe("Function UUID"),
      env_id: z.string().describe("Environment variable UUID"),
    },
    async ({ project_id, function_id, env_id }) => {
      try {
        await client.del(
          `/projects/${project_id}/functions/${function_id}/env/${env_id}`
        );
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
