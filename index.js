import { Ollama } from "ollama";

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
});

// MCP over stdio - pure JSON-RPC, no banners, no HTTP port
const tools = [
  {
    name: "ollama_list_models",
    description: "List all models available in the local Ollama instance (and cloud models if signed in)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "ollama_chat",
    description: "Send a chat message to a local or cloud Ollama model and get a response",
    inputSchema: {
      type: "object",
      properties: {
        model: { type: "string", description: "Model name, e.g. qwen3:9b or deepseek-v3.1:671b-cloud" },
        prompt: { type: "string", description: "The user message/prompt to send" },
        system: { type: "string", description: "Optional system prompt" },
      },
      required: ["model", "prompt"],
    },
  },
  {
    name: "ollama_generate",
    description: "Generate a text completion using a local or cloud Ollama model",
    inputSchema: {
      type: "object",
      properties: {
        model: { type: "string", description: "Model name" },
        prompt: { type: "string", description: "The prompt text" },
      },
      required: ["model", "prompt"],
    },
  },
];

async function handleTool(name, args) {
  if (name === "ollama_list_models") {
    const result = await ollama.list();
    const models = result.models.map((m) => `${m.name} (${m.details?.parameter_size || "cloud"})`);
    return { content: [{ type: "text", text: models.join("\n") || "No models found" }] };
  }

  if (name === "ollama_chat") {
    const messages = [];
    if (args.system) messages.push({ role: "system", content: args.system });
    messages.push({ role: "user", content: args.prompt });
    const response = await ollama.chat({ model: args.model, messages, stream: false });
    return { content: [{ type: "text", text: response.message.content }] };
  }

  if (name === "ollama_generate") {
    const response = await ollama.generate({ model: args.model, prompt: args.prompt, stream: false });
    return { content: [{ type: "text", text: response.response }] };
  }

  return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
}

// Pure stdio JSON-RPC MCP server
let buffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop(); // keep incomplete line

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      continue;
    }

    let response;

    if (msg.method === "initialize") {
      response = {
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "ollama-mcp-stdio", version: "1.0.0" },
        },
      };
    } else if (msg.method === "notifications/initialized") {
      continue; // no response needed
    } else if (msg.method === "tools/list") {
      response = {
        jsonrpc: "2.0",
        id: msg.id,
        result: { tools },
      };
    } else if (msg.method === "tools/call") {
      try {
        const result = await handleTool(msg.params.name, msg.params.arguments || {});
        response = { jsonrpc: "2.0", id: msg.id, result };
      } catch (err) {
        response = {
          jsonrpc: "2.0",
          id: msg.id,
          result: { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true },
        };
      }
    } else {
      if (msg.id !== undefined) {
        response = {
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32601, message: "Method not found" },
        };
      }
    }

    if (response) {
      process.stdout.write(JSON.stringify(response) + "\n");
    }
  }
});

process.stdin.on("end", () => process.exit(0));
