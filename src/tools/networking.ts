import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TatNetClient } from "../client.js";
import { ok, deleted, apiErr } from "./_utils.js";

export function registerNetworkingTools(server: McpServer, client: TatNetClient): void {
  // ── VPCs ───────────────────────────────────────────────────────────────────

  server.tool(
    "tatnet_vpcs_list",
    "List VPCs (virtual private networks) in the account",
    {
      cluster_id: z.string().optional().describe("Filter by cluster UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ cluster_id, limit, offset }) => {
      try {
        return ok(await client.get("/vpcs", { cluster_id, limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vpcs_create",
    "Create a new VPC (virtual private network)",
    {
      name: z.string().describe("VPC name"),
      subnet: z.string().describe("IPv4 subnet in CIDR notation (e.g. '192.168.10.0/24'). Must not overlap with 10.0.0.0/12 (reserved for platform)."),
      cluster_id: z.string().describe("Cluster UUID where the VPC will be created"),
    },
    async ({ name, subnet, cluster_id }) => {
      try {
        return ok(await client.post("/vpcs", { name, subnet, cluster_id }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vpcs_get",
    "Get a VPC by ID",
    {
      vpc_id: z.string().describe("VPC UUID"),
    },
    async ({ vpc_id }) => {
      try {
        return ok(await client.get(`/vpcs/${vpc_id}`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_vpcs_delete",
    "Delete a VPC (must have no attached resources)",
    {
      vpc_id: z.string().describe("VPC UUID"),
    },
    async ({ vpc_id }) => {
      try {
        await client.del(`/vpcs/${vpc_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  // ── Reserved IPs ───────────────────────────────────────────────────────────

  server.tool(
    "tatnet_reserved_ips_list",
    "List reserved IP addresses in a VPC",
    {
      vpc_id: z.string().describe("VPC UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ vpc_id, limit, offset }) => {
      try {
        return ok(await client.get(`/vpcs/${vpc_id}/reserved-ips`, { limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_reserved_ips_create",
    "Reserve an IP address in a VPC for use with a VM",
    {
      vpc_id: z.string().describe("VPC UUID"),
      name: z.string().describe("Name for this reserved IP"),
      address: z.string().describe("IPv4 address to reserve (must be within the VPC subnet)"),
      mac: z.string().describe("MAC address to associate with this IP (format: xx:xx:xx:xx:xx:xx)"),
    },
    async ({ vpc_id, name, address, mac }) => {
      try {
        return ok(await client.post(`/vpcs/${vpc_id}/reserved-ips`, { name, address, mac }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_reserved_ips_delete",
    "Delete a reserved IP address",
    {
      vpc_id: z.string().describe("VPC UUID"),
      ip_id: z.string().describe("Reserved IP UUID"),
    },
    async ({ vpc_id, ip_id }) => {
      try {
        await client.del(`/vpcs/${vpc_id}/reserved-ips/${ip_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
