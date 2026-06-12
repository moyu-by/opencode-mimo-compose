import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = join(__dirname, "..", "agents");

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { data: {}, body: content };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w[\w-]*)\s*:\s*(.+)$/);
    if (kv) {
      const val = kv[2].trim();
      if (val === "true") data[kv[1]] = true;
      else if (val === "false") data[kv[1]] = false;
      else if (val === "allow" || val === "deny") data[kv[1]] = val;
      else data[kv[1]] = val;
    }
  }
  return { data, body: m[2] };
}

function loadAgents() {
  const agents = {};
  try {
    const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const content = readFileSync(join(AGENTS_DIR, file), "utf-8");
      const { data, body } = parseFrontmatter(content);
      const name = file.replace(".md", "");
      agents[name] = {
        description: data.description || name,
        mode: data.mode || "subagent",
        prompt: body,
        permissions: data.permission || {},
      };
    }
  } catch (e) {
    console.error("[mimo-compose] Failed to load agent definitions:", e.message);
  }
  return agents;
}

/** @type {import("@opencode-ai/plugin").Plugin} */
export async function server(input, _options) {
  const agents = loadAgents();

  return {
    config: async (opencodeConfig) => {
      if (!opencodeConfig.agent) opencodeConfig.agent = {};
      for (const [name, agent] of Object.entries(agents)) {
        const mode = agent.mode === "primary" ? "primary" : "subagent";
        opencodeConfig.agent[name] = {
          prompt: agent.prompt,
          description: agent.description,
          mode,
        };
      }
    },
  };
}

export default server;
