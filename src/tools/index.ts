import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { loadTools, executeTool } from "./loader.js";

// Export tools dynamically loaded from Rails
// This ensures Rails is the single source of truth for tool definitions
export const tools: Tool[] = [];

// Export load function to be called during server initialization
export async function initializeTools(): Promise<void> {
    const loadedTools = await loadTools();

    // Clear existing tools and load from Rails
    tools.length = 0;
    tools.push(...loadedTools);

    console.log(`Loaded ${tools.length} tools from Rails API`);
}

// Export a generic tool executor that routes all tool calls through Rails
export async function executeToolWrapper(toolName: string, args: any) {
    return executeTool(toolName, args);
}
