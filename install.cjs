#!/usr/bin/env node
"use strict";

const { existsSync, mkdirSync, cpSync, readdirSync, writeFileSync } = require("fs");
const { join, dirname } = require("path");
const { homedir } = require("os");

const OC = join(homedir(), ".config", "opencode");
const SKILLS_SRC = join(__dirname, "skills");
const AGENTS_SRC = join(__dirname, "agents");
const SKILLS_DST = join(OC, "skills");
const AGENTS_DST = join(OC, "agents");
const SETUP_MARKER = join(OC, ".opencode-mimo-compose-setup");

function readdirRecursive(dir, base) {
  base = base || "";
  const entries = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? base + "/" + entry.name : entry.name;
    if (entry.isDirectory()) {
      entries.push(...readdirRecursive(join(dir, entry.name), rel));
    } else {
      entries.push(rel);
    }
  }
  return entries;
}

function installDir(src, dst, label) {
  if (!existsSync(src)) {
    console.log("  ⚠ " + label + " 源目录不存在: " + src);
    return;
  }
  mkdirSync(dst, { recursive: true });
  let added = 0;
  let skipped = 0;

  for (const entry of readdirRecursive(src)) {
    const srcFile = join(src, entry);
    const dstFile = join(dst, entry);
    if (existsSync(dstFile)) {
      skipped++;
      continue;
    }
    mkdirSync(dirname(dstFile), { recursive: true });
    cpSync(srcFile, dstFile);
    added++;
  }
  console.log("  ✓ " + label + ": " + added + " 个新增，跳过 " + skipped + " 个（已存在）");
}

function getPkgVersion() {
  try {
    return require("./package.json").version;
  } catch (_) {
    return "0.0.0";
  }
}

console.log("\n📦 opencode-mimo-compose 安装中...\n");
console.log("→ 目标: " + OC);

if (!existsSync(OC)) {
  console.error("❌ 未找到 OpenCode 配置目录，请先安装 OpenCode");
  process.exit(1);
}

installDir(SKILLS_SRC, SKILLS_DST, "skills");
installDir(AGENTS_SRC, AGENTS_DST, "agents");

// Write setup marker so plugin skips sync on next OpenCode startup
writeFileSync(SETUP_MARKER, getPkgVersion());
console.log("  ✓ 写入安装标记\n");

console.log("✅ 完毕！在 OpenCode 中选择 mimo-compose 即可使用\n");
