import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TatNetClient } from "../client.js";
import { ok, deleted, apiErr } from "./_utils.js";

export function registerDnsTools(server: McpServer, client: TatNetClient): void {
  // ── Zones ──────────────────────────────────────────────────────────────────

  server.tool(
    "tatnet_dns_zones_list",
    "List DNS zones in the account",
    {
      search: z.string().optional().describe("Filter zones by name (substring search)"),
      status_filter: z.string().optional().describe("Filter by zone status (e.g. 'active', 'pending')"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ search, status_filter, limit, offset }) => {
      try {
        return ok(await client.get("/dns/zones", { search, status_filter, limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_zones_create",
    "Create a new DNS zone",
    {
      name: z.string().describe("Zone name (e.g. 'example.com')"),
      default_ttl: z.number().int().positive().optional().describe("Default TTL in seconds for records"),
      dnssec_enabled: z.boolean().optional().describe("Enable DNSSEC signing (default false)"),
    },
    async ({ name, default_ttl, dnssec_enabled }) => {
      try {
        return ok(await client.post("/dns/zones", { name, default_ttl, dnssec_enabled }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_zones_get",
    "Get a DNS zone by ID",
    {
      zone_id: z.string().describe("Zone UUID"),
    },
    async ({ zone_id }) => {
      try {
        return ok(await client.get(`/dns/zones/${zone_id}`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_zones_update",
    "Update a DNS zone (TTL or DNSSEC settings)",
    {
      zone_id: z.string().describe("Zone UUID"),
      default_ttl: z.number().int().positive().optional().describe("New default TTL in seconds"),
      dnssec_enabled: z.boolean().optional().describe("Enable or disable DNSSEC"),
    },
    async ({ zone_id, default_ttl, dnssec_enabled }) => {
      try {
        return ok(await client.patch(`/dns/zones/${zone_id}`, { default_ttl, dnssec_enabled }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_zones_delete",
    "Delete a DNS zone and all its records",
    {
      zone_id: z.string().describe("Zone UUID"),
    },
    async ({ zone_id }) => {
      try {
        await client.del(`/dns/zones/${zone_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_zones_verify",
    "Verify NS delegation for a DNS zone and activate it if delegation is correct",
    {
      zone_id: z.string().describe("Zone UUID"),
    },
    async ({ zone_id }) => {
      try {
        return ok(await client.post(`/dns/zones/${zone_id}/verify`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  // ── RRsets ─────────────────────────────────────────────────────────────────

  server.tool(
    "tatnet_dns_rrsets_list",
    "List resource record sets (RRsets) in a DNS zone",
    {
      zone_id: z.string().describe("Zone UUID"),
      name: z.string().optional().describe("Filter by record name (e.g. 'www.example.com.')"),
      type: z.string().optional().describe("Filter by record type (e.g. 'A', 'MX', 'CNAME')"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ zone_id, name, type, limit, offset }) => {
      try {
        return ok(
          await client.get(`/dns/zones/${zone_id}/rrsets`, { name, type, limit, offset })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_rrsets_create",
    "Create a resource record set in a DNS zone",
    {
      zone_id: z.string().describe("Zone UUID"),
      name: z.string().describe("Record name (e.g. 'www.example.com.' — trailing dot is canonical)"),
      type: z.string().describe("Record type (A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, etc.)"),
      ttl: z.number().int().positive().optional().describe("TTL in seconds (defaults to zone default_ttl)"),
      rrclass: z.string().optional().describe("Record class (default 'IN')"),
    },
    async ({ zone_id, name, type, ttl, rrclass }) => {
      try {
        return ok(
          await client.post(`/dns/zones/${zone_id}/rrsets`, { name, type, ttl, rrclass })
        );
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_rrsets_get",
    "Get a resource record set by ID",
    {
      zone_id: z.string().describe("Zone UUID"),
      rrset_id: z.string().describe("RRset UUID"),
    },
    async ({ zone_id, rrset_id }) => {
      try {
        return ok(await client.get(`/dns/zones/${zone_id}/rrsets/${rrset_id}`));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_rrsets_delete",
    "Delete a resource record set and all its records (fails if managed by the Apps Platform)",
    {
      zone_id: z.string().describe("Zone UUID"),
      rrset_id: z.string().describe("RRset UUID"),
    },
    async ({ zone_id, rrset_id }) => {
      try {
        await client.del(`/dns/zones/${zone_id}/rrsets/${rrset_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  // ── Records ────────────────────────────────────────────────────────────────

  server.tool(
    "tatnet_dns_records_list",
    "List individual DNS records in a resource record set",
    {
      rrset_id: z.string().describe("RRset UUID"),
      limit: z.number().int().min(1).max(200).optional().describe("Items per page (default 50)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset (default 0)"),
    },
    async ({ rrset_id, limit, offset }) => {
      try {
        return ok(await client.get(`/dns/rrsets/${rrset_id}/records`, { limit, offset }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_records_create",
    "Add a DNS record to a resource record set",
    {
      rrset_id: z.string().describe("RRset UUID"),
      rdata: z.string().describe("Record data in zone-file format (e.g. '1.2.3.4' for A, '10 mail.example.com.' for MX)"),
    },
    async ({ rrset_id, rdata }) => {
      try {
        return ok(await client.post(`/dns/rrsets/${rrset_id}/records`, { rdata }));
      } catch (e) {
        return apiErr(e);
      }
    }
  );

  server.tool(
    "tatnet_dns_records_delete",
    "Delete a DNS record from a resource record set (fails if the RRset is managed by the Apps Platform)",
    {
      rrset_id: z.string().describe("RRset UUID"),
      record_id: z.string().describe("Record UUID"),
    },
    async ({ rrset_id, record_id }) => {
      try {
        await client.del(`/dns/rrsets/${rrset_id}/records/${record_id}`);
        return deleted();
      } catch (e) {
        return apiErr(e);
      }
    }
  );
}
