# ollama-mcp-stdio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-2024--11--05-blue)](https://modelcontextprotocol.io/)

Minimal **MCP** (Model Context Protocol) stdio server that bridges **Claude Desktop** — or any MCP client — to a local **Ollama** instance.

---

## English

### Why

Frontier models like Claude are powerful but every token costs. For mechanical, repetitive, or confidential work — classifying emails, extracting fields from PDFs, generating templated content in bulk, first-pass analysis on sensitive documents — it's far more efficient to delegate to a local model via Ollama. This server is exactly that bridge: tiny, dependency-light, and protocol-pure.

No HTTP server, no banners, no ports. Pure stdio JSON-RPC. Either it works or it doesn't — there are no in-between states to debug.

### Tools exposed

| Tool | Description |
|---|---|
| `ollama_list_models` | List local models (plus cloud models if signed in) |
| `ollama_chat` | Chat with a model. Accepts `model`, `prompt`, and optional `system` |
| `ollama_generate` | Raw text completion (no chat formatting) |

### Requirements

- **Node.js ≥ 18**
- **Ollama** installed and running ([ollama.com/download](https://ollama.com/download))
- At least one model pulled: `ollama pull qwen3:9b` (or whichever you prefer)

### Install

```bash
git clone https://github.com/JardiMargalefAgusti/ollama-mcp-stdio.git
cd ollama-mcp-stdio
npm install
```

### Configure Claude Desktop

Edit your Claude Desktop config file:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Add:

```json
{
  "mcpServers": {
    "ollama": {
      "command": "node",
      "args": ["/absolute/path/to/ollama-mcp-stdio/index.js"]
    }
  }
}
```

Restart Claude Desktop. The three tools should appear.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | Ollama API base URL |

Pass it in the `env` field of your MCP server config if Ollama runs on a non-default host.

### Smoke test (no Claude needed)

```bash
node index.js
```

Then paste over stdin:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
```

You should see an `initialize` response and a `tools/list` response with three tools.

### Usage patterns

**Bulk classification.** Claude receives many items and, in a single turn, classifies each by delegating to `ollama_chat` with a tight system prompt. Token cost on the orchestrator stays small.

**Structured extraction.** Claude asks `ollama_generate` to return a JSON object with specific fields from a long document. Claude validates the output and acts on it.

**Confidential first pass.** Sensitive documents stay inside the local network: the local model handles initial parsing, classification, or summarization before the orchestrator sees anything.

**Claude → Ollama → Claude cascade.** Claude plans and synthesizes; Ollama does the heavy repetitive work.

### Roadmap

- `ollama_embed` for local embeddings and RAG
- Multi-turn `messages` array in `ollama_chat`
- Optional streaming for long responses
- Default model via env var

PRs welcome.

### License

MIT — see [LICENSE](LICENSE).

---

## Català

### Per què

Els models frontera com Claude són potents però cada token té un cost. Per a feina mecànica, repetitiva o confidencial — classificar emails, extreure camps de PDFs, generar contingut amb plantilla en sèrie, primera passada sobre documents sensibles — surt molt més a compte delegar-la a un model local via Ollama. Aquest servidor és exactament aquest pont: petit, amb poques dependències, i pur en protocol.

Sense servidor HTTP, sense banners, sense ports. JSON-RPC per stdio i prou. O funciona o no funciona, no hi ha estats intermedis per depurar.

### Eines exposades

| Tool | Descripció |
|---|---|
| `ollama_list_models` | Llista models locals (i cloud si hi ha sessió iniciada) |
| `ollama_chat` | Conversa amb un model. Accepta `model`, `prompt` i `system` opcional |
| `ollama_generate` | Completar text en mode raw (sense format chat) |

### Requisits

- **Node.js ≥ 18**
- **Ollama** instal·lat i corrent ([ollama.com/download](https://ollama.com/download))
- Almenys un model descarregat: `ollama pull qwen3:9b` (o el que prefereixis)

### Instal·lació

```bash
git clone https://github.com/JardiMargalefAgusti/ollama-mcp-stdio.git
cd ollama-mcp-stdio
npm install
```

### Configuració de Claude Desktop

Edita el fitxer de configuració de Claude Desktop:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Afegeix:

```json
{
  "mcpServers": {
    "ollama": {
      "command": "node",
      "args": ["/ruta/absoluta/a/ollama-mcp-stdio/index.js"]
    }
  }
}
```

Reinicia Claude Desktop. Les tres eines haurien d'aparèixer.

### Patrons d'ús

**Classificació massiva.** Claude rep molts elements i, en un sol torn, classifica cada un delegant a `ollama_chat` amb un system prompt curt. El cost de tokens de l'orquestrador es manté baix.

**Extracció estructurada.** Claude demana a `ollama_generate` que retorni un JSON amb camps específics d'un document llarg. Claude valida la sortida i actua.

**Primera passada confidencial.** Documents sensibles queden dins la xarxa local: el model local fa el parsing inicial, la classificació o el resum abans que l'orquestrador en vegi res.

**Cascada Claude → Ollama → Claude.** Claude planifica i sintetitza; Ollama fa la feina pesada repetitiva.

### Llicència

MIT — veure [LICENSE](LICENSE).
