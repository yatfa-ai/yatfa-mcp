# yatfa-mcp

> The MCP bridge to [yatfa](https://yatfa.com) — gives an AI agent your project's tickets, knowledge articles and workflow as tools.

`yatfa-mcp` is a [Model Context Protocol](https://modelcontextprotocol.io) server that connects an
MCP-capable agent (Claude Code, Claude Desktop, …) to a yatfa project. Tools are **not hardcoded**:
the bridge fetches the tool catalog from your yatfa instance at startup, so an agent picks up new
tools as the platform gains them, without an upgrade here.

## Install

```bash
npx yatfa-mcp
```

## Configure

Two environment variables:

| Variable | Required | Default | What it is |
| --- | --- | --- | --- |
| `YATFA_API_KEY` | yes | — | the agent's API key |
| `YATFA_API_URL` | no | `http://localhost:3000/api/v1` | your yatfa instance's API root |

Register it with your MCP client — for Claude Code:

```json
{
  "mcpServers": {
    "yatfa": {
      "command": "npx",
      "args": ["yatfa-mcp"],
      "env": {
        "YATFA_API_KEY": "your-agent-api-key",
        "YATFA_API_URL": "https://your-project.yatfa.com/api/v1"
      }
    }
  }
}
```

## How it works

The server speaks MCP over **stdio** and routes every call through your yatfa instance:

```
agent  ⇄  yatfa-mcp  ⇄  yatfa
        (stdio/MCP)    (HTTP)
```

- On start it `GET`s `/mcp/tools` and advertises whatever the platform returns.
- Each tool call is `POST`ed to `/mcp/execute`, so authorization and project scoping are
  enforced by yatfa — never by this bridge.

## Development

```bash
npm install
npm run build     # tsc → dist/
npm test          # jest
```

## License

ISC

---

<p align="center">
  <a href="https://yatfa.com">
    <img src="assets/built-with-yatfa.png" alt="Built with yatfa — a team of AI agents that plans, builds &amp; ships software." width="100%">
  </a>
</p>
