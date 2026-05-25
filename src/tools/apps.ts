import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TatNetClient } from "../client.js";
import { ok, deleted, apiErr } from "./_utils.js";

export function registerAppTools(server: McpServer, client: TatNetClient): void {
  // ── Apps ───────────────────────────────────────────────────────────────────

  server.tool(
    "tatnet_apps_list",
    "List web applications in a project",
    {
      project_id: z.string().describe("Project UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ project_id, limit, offset }) => {
      try {
        return ok(await client.get(`/projects/${project_id}/apps`, { limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_apps_create",
    "Create a web application in a project. Supports Git repos (GitHub/GitLab) and Docker images.",
    {
      project_id: z.string().describe("Project UUID"),
      name: z.string().min(1).max(255).describe("Application name"),
      source_type: z.enum(["git", "docker_image"]).optional().describe("Source type (default 'git')"),
      docker_image: z.string().optional().describe("Docker image reference (required when source_type='docker_image')"),
      git_provider: z.enum(["github", "gitlab"]).optional().describe("Git provider (default 'github')"),
      github_installation_id: z.string().optional().describe("GitHub App installation ID (required for private GitHub repos)"),
      gitlab_connection_id: z.string().optional().describe("GitLab OAuth connection ID (required for private GitLab repos)"),
      repo_full_name: z.string().optional().describe("Repository full name (e.g. 'org/repo')"),
      repo_id: z.number().int().optional().describe("Repository numeric ID"),
      branch: z.string().max(255).optional().describe("Branch to deploy (default 'main')"),
      framework: z.string().optional().describe("Framework hint (e.g. 'nextjs', 'create-react-app', 'vite')"),
      nodejs_version: z.string().optional().describe("Node.js version override (e.g. '20', '22')"),
      app_type: z.enum(["frontend", "backend", "function"]).optional().describe("Application type (default 'frontend')"),
      runtime_type: z.enum(["firecracker", "vm"]).optional().describe("Runtime type (default 'firecracker')"),
      replica_count: z.number().int().min(0).max(10).optional().describe("Number of replicas (default 0 = scale-to-zero)"),
      auto_deploy: z.boolean().optional().describe("Auto-deploy on push (default true)"),
      vpc_id: z.string().optional().describe("VPC UUID to attach the app to"),
      install_command: z.string().optional().describe("Custom install command (overrides framework detection)"),
      build_command: z.string().optional().describe("Custom build command"),
      output_directory: z.string().optional().describe("Custom output/dist directory"),
      root_directory: z.string().optional().describe("Root directory in the repo (for monorepos)"),
      start_cmd: z.string().optional().describe("Custom start command for backend/SSR apps"),
      replica_vcpu: z.number().int().min(1).max(8).optional().describe("vCPU per replica (1–8)"),
      replica_memory_mb: z.number().int().min(256).max(8192).optional().describe("Memory per replica in MB (256–8192)"),
    },
    async ({ project_id, ...body }) => {
      try {
        return ok(await client.post(`/projects/${project_id}/apps`, body));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_apps_get",
    "Get a web application by ID",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
    },
    async ({ project_id, app_id }) => {
      try {
        return ok(await client.get(`/projects/${project_id}/apps/${app_id}`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_apps_delete",
    "Delete a web application and all its builds, domains, and environment variables",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
    },
    async ({ project_id, app_id }) => {
      try {
        await client.del(`/projects/${project_id}/apps/${app_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_apps_deploy",
    "Trigger a new deployment for a web application",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
      commit_sha: z.string().optional().describe("Specific commit SHA to deploy (defaults to HEAD of the configured branch)"),
    },
    async ({ project_id, app_id, commit_sha }) => {
      try {
        return ok(
          await client.post(`/projects/${project_id}/apps/${app_id}/deploy`, { commit_sha })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  // ── Builds ─────────────────────────────────────────────────────────────────

  server.tool(
    "tatnet_app_builds_list",
    "List deployment builds for a web application",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ project_id, app_id, limit, offset }) => {
      try {
        return ok(
          await client.get(`/projects/${project_id}/apps/${app_id}/builds`, { limit, offset })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  // ── Environment Variables ──────────────────────────────────────────────────

  server.tool(
    "tatnet_app_env_list",
    "List environment variables for a web application (secret values are masked)",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ project_id, app_id, limit, offset }) => {
      try {
        return ok(
          await client.get(`/projects/${project_id}/apps/${app_id}/env`, { limit, offset })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_app_env_create",
    "Add an environment variable to a web application",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
      name: z.string().min(1).max(255).describe("Environment variable name (e.g. 'DATABASE_URL')"),
      value: z.string().min(1).describe("Environment variable value"),
      is_secret: z.boolean().optional().describe("Mark as secret — value will be masked in API responses (default false)"),
    },
    async ({ project_id, app_id, name, value, is_secret }) => {
      try {
        return ok(
          await client.post(`/projects/${project_id}/apps/${app_id}/env`, { name, value, is_secret })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_app_env_delete",
    "Delete an environment variable from a web application",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
      env_id: z.string().describe("Environment variable UUID"),
    },
    async ({ project_id, app_id, env_id }) => {
      try {
        await client.del(`/projects/${project_id}/apps/${app_id}/env/${env_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  // ── Domains ────────────────────────────────────────────────────────────────

  server.tool(
    "tatnet_app_domains_list",
    "List domains attached to a web application",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ project_id, app_id, limit, offset }) => {
      try {
        return ok(
          await client.get(`/projects/${project_id}/apps/${app_id}/domains`, { limit, offset })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_app_domains_create",
    "Add a custom domain to a web application. Triggers automatic TLS certificate issuance.",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
      domain: z.string().min(1).max(255).describe("Domain name (e.g. 'app.example.com')"),
      override_dns: z.boolean().optional().describe("Override existing DNS records if the domain is in a managed zone (default false)"),
    },
    async ({ project_id, app_id, domain, override_dns }) => {
      try {
        return ok(
          await client.post(`/projects/${project_id}/apps/${app_id}/domains`, { domain, override_dns })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_app_domains_delete",
    "Remove a domain from a web application",
    {
      project_id: z.string().describe("Project UUID"),
      app_id: z.string().describe("App UUID"),
      domain_id: z.string().describe("Domain UUID"),
    },
    async ({ project_id, app_id, domain_id }) => {
      try {
        await client.del(`/projects/${project_id}/apps/${app_id}/domains/${domain_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
