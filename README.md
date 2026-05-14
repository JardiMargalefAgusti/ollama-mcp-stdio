# ollama-mcp-stdio

Servidor **MCP** (Model Context Protocol) mínim que connecta **Claude Desktop** (o qualsevol client MCP) amb una instància local d'**Ollama** via stdio.

> Repo intern d'APOGEA. Pensat per al **Taller IA APOGEA** i per als equips d'enginyeria que vulguin invocar models locals (Qwen, Gemma, GLM, DeepSeek...) des de Claude sense passar per cap API externa.

## Per què

Claude (Opus) és potent però car en tokens. Per a tasques mecàniques i repetitives —classificar emails, extreure dades de PDFs, generar microcontingut en sèrie, fer primeres passades sobre informació confidencial—, és més eficient delegar-les a un model local via Ollama. Aquest servidor fa exactament aquest pont.

## Eines exposades

| Tool | Descripció |
|---|---|
| `ollama_list_models` | Llista models locals (i cloud si hi ha sessió) |
| `ollama_chat` | Conversa amb un model. Accepta `model`, `prompt` i `system` opcional |
| `ollama_generate` | Completar text en mode raw (sense format chat) |

## Requisits

- **Node.js ≥ 18**
- **Ollama** instal·lat i corrent ([ollama.com/download](https://ollama.com/download))
- Almenys un model descarregat: `ollama pull qwen3.5:9b` (o el que prefereixis)

## Instal·lació

```bash
git clone https://github.com/JardiMargalefAgusti/ollama-mcp-stdio.git
cd ollama-mcp-stdio
npm install
```

## Configuració a Claude Desktop

Edita `%APPDATA%\Claude\claude_desktop_config.json` (Windows) o `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) i afegeix:

```json
{
  "mcpServers": {
    "ollama": {
      "command": "node",
      "args": ["C:\\ruta\\al\\repo\\ollama-mcp-stdio\\index.js"]
    }
  }
}
```

Reinicia Claude Desktop. Hauries de veure les 3 eines disponibles al chat.

### Variables d'entorn opcionals

| Variable | Default | Descripció |
|---|---|---|
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | URL de l'API d'Ollama |

## Comprovació ràpida

Per validar que funciona sense Claude:

```bash
node index.js
```

I envia per stdin (manualment o amb un script):

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
```

## Patrons d'ús recomanats

**Classificació massiva.** Claude rep una llista de 50 emails i, en un sol torn, els classifica delegant cada un a `ollama_chat` amb un system prompt curt.

**Extracció estructurada.** Claude demana a `ollama_generate` que retorni un JSON amb camps específics d'un text llarg. Després valida i actua.

**Tasques confidencials.** Plecs de licitació, dades de client, contractes: la primera passada queda dins la xarxa local.

**Cascada Claude → Ollama → Claude.** Claude orquestra i sintetitza; Ollama fa la feina pesada repetitiva.

## Llicència

MIT — veure [LICENSE](LICENSE).
