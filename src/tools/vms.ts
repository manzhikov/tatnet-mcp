import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TatNetClient } from "../client.js";
import { ok, deleted, apiErr } from "./_utils.js";

const interfaceSchema = z.object({
  type: z.enum(["public", "vpc"]).describe("Interface type"),
  vpc_id: z.string().optional().describe("VPC UUID — required for 'vpc' type"),
  enable_ipv4: z.boolean().optional().describe("Allocate a public IPv4 address (default true)"),
  enable_ipv6: z.boolean().optional().describe("Allocate a public IPv6 address (default false)"),
  dhcp4: z.boolean().optional().describe("Enable DHCP for IPv4 (default false)"),
});

export function registerVmTools(server: McpServer, client: TatNetClient): void {
  server.tool(
    "tatnet_vms_list",
    "List virtual machines in a project",
    {
      project_id: z.string().describe("Project UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ project_id, limit, offset }) => {
      try {
        return ok(await client.get(`/projects/${project_id}/vms`, { limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vms_create",
    "Create a new virtual machine in a project",
    {
      project_id: z.string().describe("Project UUID"),
      name: z.string().min(1).max(255).describe("VM display name"),
      hostname: z.string().min(1).max(63).describe("VM hostname (lowercase letters, digits, hyphens)"),
      image_id: z.string().describe("OS image UUID"),
      vm_plan_id: z.string().describe("VM plan UUID (determines CPU/RAM/disk defaults)"),
      cluster_id: z.string().describe("Cluster UUID where the VM will be created"),
      default_user: z.string().min(1).describe("Default SSH login username (e.g. 'ubuntu', 'debian')"),
      disk_size_gb: z.number().int().positive().optional().describe("Custom disk size in GB (overrides plan default)"),
      ssh_key_ids: z.array(z.string()).optional().describe("SSH key UUIDs to inject into the VM"),
      interfaces: z.array(interfaceSchema).optional().describe("Network interfaces to attach (default: one public interface with IPv4)"),
      cloud_init: z.string().optional().describe("Custom cloud-init user-data (YAML)"),
      period_months: z.number().int().optional().describe("Payment period in months (1, 3, 6, 12)"),
      period_days: z.number().int().optional().describe("Payment period in days (e.g. 1)"),
      backup_count: z.number().int().min(0).max(10).optional().describe("Number of backup slots to pre-purchase (0–10, default 0)"),
    },
    async ({ project_id, ...body }) => {
      try {
        return ok(await client.post(`/projects/${project_id}/vms`, body));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vms_get",
    "Get a virtual machine by ID",
    {
      project_id: z.string().describe("Project UUID"),
      vm_id: z.string().describe("VM UUID"),
    },
    async ({ project_id, vm_id }) => {
      try {
        return ok(await client.get(`/projects/${project_id}/vms/${vm_id}`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vms_delete",
    "Delete a virtual machine (irreversible — all data is lost)",
    {
      project_id: z.string().describe("Project UUID"),
      vm_id: z.string().describe("VM UUID"),
    },
    async ({ project_id, vm_id }) => {
      try {
        await client.del(`/projects/${project_id}/vms/${vm_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vms_start",
    "Start a stopped virtual machine",
    {
      project_id: z.string().describe("Project UUID"),
      vm_id: z.string().describe("VM UUID"),
    },
    async ({ project_id, vm_id }) => {
      try {
        return ok(await client.post(`/projects/${project_id}/vms/${vm_id}/start`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vms_stop",
    "Stop a running virtual machine (graceful shutdown)",
    {
      project_id: z.string().describe("Project UUID"),
      vm_id: z.string().describe("VM UUID"),
    },
    async ({ project_id, vm_id }) => {
      try {
        return ok(await client.post(`/projects/${project_id}/vms/${vm_id}/stop`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vms_restart",
    "Restart a virtual machine",
    {
      project_id: z.string().describe("Project UUID"),
      vm_id: z.string().describe("VM UUID"),
    },
    async ({ project_id, vm_id }) => {
      try {
        return ok(await client.post(`/projects/${project_id}/vms/${vm_id}/restart`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vm_backups_list",
    "List backups for a virtual machine",
    {
      project_id: z.string().describe("Project UUID"),
      vm_id: z.string().describe("VM UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ project_id, vm_id, limit, offset }) => {
      try {
        return ok(
          await client.get(`/projects/${project_id}/vms/${vm_id}/backups`, { limit, offset })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vm_backups_create",
    "Create a manual backup of a virtual machine",
    {
      project_id: z.string().describe("Project UUID"),
      vm_id: z.string().describe("VM UUID"),
      name: z.string().min(1).max(255).describe("Backup name"),
      description: z.string().optional().describe("Optional backup description"),
    },
    async ({ project_id, vm_id, name, description }) => {
      try {
        return ok(
          await client.post(`/projects/${project_id}/vms/${vm_id}/backups`, { name, description })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vm_backups_delete",
    "Delete a VM backup",
    {
      project_id: z.string().describe("Project UUID"),
      vm_id: z.string().describe("VM UUID"),
      backup_id: z.string().describe("Backup UUID"),
    },
    async ({ project_id, vm_id, backup_id }) => {
      try {
        await client.del(`/projects/${project_id}/vms/${vm_id}/backups/${backup_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
