import { api } from "../api.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Fetch tool definitions dynamically from Rails
export async function loadTools(): Promise<Tool[]> {
    try {
        const response = await api.get('/mcp/tools');

        // Transform Rails format to MCP Tool format
        const tools: Tool[] = response.data.tools.map((railsTool: any) => ({
            name: railsTool.name,
            description: railsTool.description,
            inputSchema: railsTool.parameters as any
        }));

        return tools;
    } catch (error) {
        console.error('Failed to load tools from Rails:', error);
        throw error;
    }
}

// Generic execute function that calls Rails /mcp/execute
export async function executeTool(toolName: string, args: any) {
    try {
        const response = await api.post('/mcp/execute', {
            tool: toolName,
            params: args
        });

        return {
            content: [{ type: "text", text: JSON.stringify(response.data.result, null, 2) }]
        };
    } catch (error: any) {
        // Format error consistently
        let errorMessage = `Error: ${error.message}`;

        if (error.response) {
            errorMessage = `API Error (${error.response.status}): ${JSON.stringify(error.response.data, null, 2)}`;
        } else if (error.request) {
            errorMessage = `Network Error: No response received from API. Is Rails running?`;
        }

        return {
            content: [{ type: "text", text: errorMessage }],
            isError: true
        };
    }
}
