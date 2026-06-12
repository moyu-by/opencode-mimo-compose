import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  cpSync,
} from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = join(__dirname, "..", "agents");
const SKILLS_SRC = join(__dirname, "..", "skills");
const OC = join(homedir(), ".config", "opencode");
const SKILLS_DST = join(OC, "skills");

let _skillsEnsured = false;

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
      };
    }
  } catch (_) {}
  return agents;
}

function readdirRecursive(dir, base = "") {
  const entries = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        entries.push(...readdirRecursive(join(dir, entry.name), rel));
      } else {
        entries.push(rel);
      }
    }
  } catch (_) {}
  return entries;
}

function ensureSkills() {
  if (_skillsEnsured) return;
  _skillsEnsured = true;
  if (!existsSync(SKILLS_SRC)) return;
  try {
    mkdirSync(SKILLS_DST, { recursive: true });
    for (const entry of readdirRecursive(SKILLS_SRC)) {
      const src = join(SKILLS_SRC, entry);
      const dst = join(SKILLS_DST, entry);
      if (!existsSync(dst)) {
        mkdirSync(dirname(dst), { recursive: true });
        cpSync(src, dst);
      }
    }
  } catch (_) {}
}

/** @type {import("@opencode-ai/plugin").Plugin} */
export async function server(input, _options) {
  ensureSkills();
  const agents = loadAgents();

  return {
    config: async (opencodeConfig) => {
      if (!opencodeConfig.agent) opencodeConfig.agent = {};
      for (const [name, agent] of Object.entries(agents)) {
        opencodeConfig.agent[name] = {
          prompt: agent.prompt,
          description: agent.description,
          mode: agent.mode === "primary" ? "primary" : "subagent",
        };
      }
    },
  };
}

export default server;
