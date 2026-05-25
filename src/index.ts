#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TatNetClient } from "./client.js";
import { registerAccountTools } from "./tools/account.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerVmTools } from "./tools/vms.js";
import { registerDnsTools } from "./tools/dns.js";
import { registerNetworkingTools } from "./tools/networking.js";
import { registerSshKeyTools } from "./tools/ssh-keys.js";
import { registerCertificateTools } from "./tools/certificates.js";
import { registerAppTools } from "./tools/apps.js";
import { registerFunctionTools } from "./tools/functions.js";

const apiKey = process.env.TATNET_API_KEY;
if (!apiKey) {
  process.stderr.write("Error: TATNET_API_KEY environment variable is required\n");
  process.exit(1);
}

const baseUrl = process.env.TATNET_API_BASE_URL ?? "https://api.tatnet.ru/v1";

const client = new TatNetClient(apiKey, baseUrl);

const server = new McpServer({
  name: "tatnet",
  version: "1.0.0",
  description: "TatNet infrastructure management: VMs, DNS, apps, serverless functions, VPCs, SSH keys, and certificates",
});

registerAccountTools(server, client);
registerProjectTools(server, client);
registerVmTools(server, client);
registerDnsTools(server, client);
registerNetworkingTools(server, client);
registerSshKeyTools(server, client);
registerCertificateTools(server, client);
registerAppTools(server, client);
registerFunctionTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
