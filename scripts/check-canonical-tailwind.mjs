/**
 * Fails when Tailwind classes can be rewritten as canonical utilities
 * (same engine as the IntelliSense suggestCanonicalClasses warning).
 *
 * Usage:
 *   node scripts/check-canonical-tailwind.mjs
 *   node scripts/check-canonical-tailwind.mjs --fix
 */
import { __unstable__loadDesignSystem } from "@tailwindcss/node"
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const FIX = process.argv.includes("--fix")
const cssPath = path.join(ROOT, "app/globals.css")
const ds = await __unstable__loadDesignSystem(fs.readFileSync(cssPath, "utf8"), {
  base: path.dirname(cssPath),
})

const EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".css"])
const SKIP = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "scripts",
  "ui-mockup",
])

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (EXT.has(path.extname(entry.name))) out.push(full)
  }
  return out
}

function extractCandidates(source) {
  const candidates = new Set()
  const utilRe =
    /(?:!)?(?:(?:[\w-]+(?:-\[[^\]]+\])?|\[[^\]]+\]):)*(?:[\w-]+-\[[^\]]+\])(?:\/[\w.%-]+)?/g
  for (const match of source.matchAll(utilRe)) {
    const token = match[0]
    if (token.includes("${")) continue
    candidates.add(token)
  }
  const propRe = /(?<![\w-])\[[a-z-]+:[^\]]+\]/gi
  for (const match of source.matchAll(propRe)) {
    candidates.add(match[0])
  }
  return candidates
}

const violations = []

for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, "utf8")
  const candidates = [...extractCandidates(original)]
  if (candidates.length === 0) continue

  const canonical = ds.canonicalizeCandidates(candidates, { rem: 16 })
  const replacements = []
  for (let i = 0; i < candidates.length; i++) {
    const from = candidates[i]
    const to = canonical[i]
    if (to && to !== from) replacements.push([from, to])
  }
  if (replacements.length === 0) continue

  const rel = path.relative(ROOT, file)
  for (const [from, to] of replacements) {
    violations.push({ file: rel, from, to })
  }

  if (FIX) {
    replacements.sort((a, b) => b[0].length - a[0].length)
    let next = original
    for (const [from, to] of replacements) {
      next = next.split(from).join(to)
    }
    if (next !== original) fs.writeFileSync(file, next)
  }
}

if (violations.length === 0) {
  console.log("All Tailwind classes are canonical.")
  process.exit(0)
}

console.error(
  `Found ${violations.length} non-canonical Tailwind class(es)${FIX ? " (fixed)" : ""}:\n`,
)
for (const { file, from, to } of violations) {
  console.error(`  ${file}: ${from} → ${to}`)
}

if (!FIX) {
  console.error(
    "\nRun `npm run lint:tailwind:fix` to rewrite them, or use the canonical form when adding classes.",
  )
  process.exit(1)
}
