#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { tools, initializeTools, executeToolWrapper } from "./tools/index.js";

const server = new Server(
    {
        name: "yatfa-bridge",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List tools - dynamically loaded from Rails
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: tools.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
        })),
    };
});

// Execute tool - route all calls through Rails
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;

    // Verify tool exists
    const toolExists = tools.some((t) => t.name === toolName);
    if (!toolExists) {
        throw new Error(`Tool not found: ${toolName}`);
    }

    // Execute via Rails
    return await executeToolWrapper(toolName, request.params.arguments);
});

async function main() {
    // Load tools from Rails before starting server
    console.error("Loading tools from Rails API...");
    await initializeTools();
    console.error(`Loaded ${tools.length} tools`);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("YATFA MCP Bridge running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
