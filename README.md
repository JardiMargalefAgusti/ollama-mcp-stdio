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

**Bulk classification.** Claude receives 50 emails and, in a single turn, classifies each by delegating to `ollama_chat` with a tight system prompt. Token cost on the orchestrator stays small.

**Structured extraction.** Claude asks `ollama_generate` to return a JSON object with specific fields from a long document. Claude validates the output and acts on it.

**Confidential first pass.** Tender documents, client data, contracts: the first analytical pass stays inside the local network.

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

## Català (notes per a l'equip APOGEA i col·legues del sector AECO)

### Per què t'interessa

Claude (Opus) és potent però car en tokens. Per a tasques mecàniques i repetitives —classificar emails de licitacions, extreure dades de PDFs Tekton, generar microcontingut CRM en sèrie, fer primeres passades sobre plecs confidencials—, té molt més sentit delegar-les a un model local via Ollama. Aquest servidor és aquest pont.

Pensat originalment per al **Taller IA APOGEA** i per a qualsevol professional del sector BIM/AECO que vulgui combinar Claude Desktop amb models locals.

### Casos d'ús concrets en flux de feina BIM/AECO

**Auditoria BIM en cascada.** Claude orquestra una auditoria de 8 IFCs contra un BEP. Per a cada model, Claude llegeix els Psets via el teu MCP `auditor-bim` i delega la validació de propietats individuals a `ollama_chat` amb Qwen3.5 local. Claude només sintetitza els resultats i genera el dashboard React final. Estalvi típic: 70-90% dels tokens d'Opus en aquesta mena de feina.

**Classificació d'emails ASICA / Infonalia.** En lloc de fer servir context d'Opus per llegir 50 alertes diàries de licitacions, Claude les passa una a una a Ollama amb un prompt curt ("classifica: BIM, GMAO, Genèric, Descartat") i només treballa amb el subset rellevant.

**Extracció de factures de proveïdors.** Skill `holded-invoices` combinat amb model local: Claude llegeix el PDF de la factura, en demana a Ollama un JSON amb proveïdor, NIF, base, IVA, total, i després crida l'API de Holded amb les dades validades.

**Generació de fitxes Tekton.** A partir de l'HTML exportat del càlcul d'instalacions, Ollama extreu les dades estructurades i Claude completa la plantilla DOCX de memòria.

### Models recomanats per al teu hardware

Per a l'equip APOGEA i màquines similars (i7-14700K / 128 GB RAM / RTX 5070):

- **`qwen3:9b`** — Equilibri general. Bon raonament, segueix instruccions, JSON fiable.
- **`gemma3:12b`** — Si vols més qualitat en redacció i no t'importa més latència.
- **`deepseek-r1:8b`** — Per a tasques que requereixen raonament intern (problemes lògics, plans pas a pas).
- **`nomic-embed-text`** — Quan afegim suport d'embeddings (cas d'ús RAG sobre plecs i normativa CTE).

### Integració amb la resta del teu stack

Aquest MCP encaixa amb tot el que ja tens muntat:

- **Servo MCP** + Ollama → bridge complet per a treball amb fitxers locals sense Claude.
- **MCPs APOGEA** (auditor-bim, BIM-Builder, Holded, Airtable, etc.) → Claude orquestra; Ollama fa les feines pesades de classificació i extracció dins de cada flow.
- **Skills personalitzades** (`tekton-memoria-instalaciones`, `bim-audit`, `holded-ventas-airtable`...) → cada skill pot delegar passos mecànics a Ollama via aquest MCP.

### Per al Quim i altres companys

Instal·lació pas a pas detallada al README en anglès més amunt. Si la part de configurar el `claude_desktop_config.json` no és clara, demana ajut directament a Agustí o al canal del Taller IA APOGEA.

### Llicència

MIT. Lliure d'ús, modificació i redistribució. Si fas un fork interessant, fes-m'ho saber.
