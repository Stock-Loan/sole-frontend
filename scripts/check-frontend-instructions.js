#!/usr/bin/env node
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const warnOnly = args.includes("--warn-only");
const jsonOutput = args.includes("--json");
const rootArgIndex = args.indexOf("--root");

const projectRoot = path.resolve(__dirname, "..");
const defaultSrcRoot = path.resolve(projectRoot, "src");
const srcRoot =
	rootArgIndex >= 0 && args[rootArgIndex + 1]
		? path.resolve(process.cwd(), args[rootArgIndex + 1])
		: defaultSrcRoot;

const allowedByLayer = {
	shared: new Set(["shared"]),
	entities: new Set(["shared", "entities"]),
	features: new Set(["shared", "entities", "features", "auth"]),
	areas: new Set(["shared", "entities", "features", "areas", "auth", "app"]),
};

const internalLayers = new Set([
	"app",
	"shared",
	"auth",
	"areas",
	"entities",
	"features",
]);

function isUnderRoot(filePath) {
	const rel = path.relative(srcRoot, filePath);
	return rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

function getLayerForFile(filePath) {
	const rel = path.relative(srcRoot, filePath).replace(/\\/g, "/");
	const [layer] = rel.split("/");
	return layer;
}

function resolveImportLayer(importPath, fromFile) {
	if (importPath.startsWith("@/")) {
		const rel = importPath.slice(2);
		const [layer] = rel.split("/");
		return internalLayers.has(layer) ? layer : null;
	}
	if (importPath.startsWith(".")) {
		const resolved = path.resolve(path.dirname(fromFile), importPath);
		if (!isUnderRoot(resolved)) return null;
		const rel = path.relative(srcRoot, resolved);
		const [layer] = rel.split(path.sep);
		return internalLayers.has(layer) ? layer : null;
	}
	return null;
}

function stripComments(input) {
	return input
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|\s)\/\/.*$/gm, "$1");
}

function collectFiles(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const results = [];
	for (const entry of entries) {
		if (entry.name.startsWith(".")) continue;
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...collectFiles(fullPath));
		} else if (entry.isFile()) {
			if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
				results.push(fullPath);
			}
		}
	}
	return results;
}

function buildLineIndex(text) {
	const starts = [0];
	for (let i = 0; i < text.length; i += 1) {
		if (text[i] === "\n") {
			starts.push(i + 1);
		}
	}
	return starts;
}

function getLineNumber(starts, index) {
	let low = 0;
	let high = starts.length - 1;
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		if (starts[mid] <= index) {
			if (mid === starts.length - 1 || starts[mid + 1] > index) {
				return mid + 1;
			}
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return 1;
}

const violations = [];

function report({
	file,
	line,
	rule,
	message,
	severity = "error",
}) {
	violations.push({ file, line, rule, message, severity });
}

function scanFile(filePath) {
	const content = fs.readFileSync(filePath, "utf8");
	if (content.includes("frontend-instructions-ignore")) {
		return;
	}
	const cleaned = stripComments(content);
	const lineIndex = buildLineIndex(cleaned);

	const layer = getLayerForFile(filePath);
	const allowSet = allowedByLayer[layer];

	const importPatterns = [
		/\bimport\s+(?:[^\n;]+?\s+from\s+)?["']([^"']+)["']/g,
		/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
		/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
	];

	for (const regex of importPatterns) {
		let match;
		while ((match = regex.exec(cleaned))) {
			const importPath = match[1];
			const targetLayer = resolveImportLayer(importPath, filePath);
			if (!targetLayer || !allowSet) continue;
			if (targetLayer === layer) continue;
			if (!allowSet.has(targetLayer)) {
				const line = getLineNumber(lineIndex, match.index);
				report({
					file: path.relative(projectRoot, filePath),
					line,
					rule: "layering/imports",
					message: `"${layer}" file imports from "${targetLayer}" via ${importPath}`,
				});
			}
		}
	}

	if (filePath.endsWith(".tsx")) {
		const lines = cleaned.split(/\r?\n/);
		for (let i = 0; i < lines.length; i += 1) {
			const lineText = lines[i];
			const propMatch = lineText.match(
				/\b(type|interface)\s+([A-Za-z0-9_]*Props)\b/,
			);
			if (propMatch) {
				report({
					file: path.relative(projectRoot, filePath),
					line: i + 1,
					rule: "types/no-inline-props",
					message: `Inline prop type "${propMatch[2]}" declared in .tsx`,
				});
			}
		}

		const fetchMatch = cleaned.match(/\bfetch\s*\(/);
		if (fetchMatch) {
			report({
				file: path.relative(projectRoot, filePath),
				line: getLineNumber(lineIndex, fetchMatch.index ?? 0),
				rule: "data/no-raw-fetch",
				message: "Direct fetch() usage found in .tsx (use entity/feature hooks)",
			});
		}

		const axiosMatch = cleaned.match(/\baxios\s*\./);
		if (axiosMatch) {
			report({
				file: path.relative(projectRoot, filePath),
				line: getLineNumber(lineIndex, axiosMatch.index ?? 0),
				rule: "data/no-raw-axios",
				message: "Direct axios usage found in .tsx (use entity/feature hooks)",
			});
		}

		const apiClientMatch = cleaned.match(/\bapiClient\s*\./);
		if (apiClientMatch) {
			report({
				file: path.relative(projectRoot, filePath),
				line: getLineNumber(lineIndex, apiClientMatch.index ?? 0),
				rule: "data/no-raw-axios",
				message: "Direct apiClient usage found in .tsx (use entity/feature hooks)",
			});
		}
	}
}

if (!fs.existsSync(srcRoot)) {
	console.error(`Source root not found: ${srcRoot}`);
	process.exit(2);
}

const files = collectFiles(srcRoot);
for (const filePath of files) {
	scanFile(filePath);
}

if (jsonOutput) {
	console.log(JSON.stringify({
		root: path.relative(process.cwd(), srcRoot),
		violations,
	}, null, 2));
} else {
	if (violations.length === 0) {
		console.log("No frontend instruction violations found.");
		console.log("");
		console.log("Total violations: 0");
	} else {
		const sorted = [...violations].sort((a, b) => {
			if (a.file !== b.file) return a.file.localeCompare(b.file);
			const aLine = a.line ?? 0;
			const bLine = b.line ?? 0;
			return aLine - bLine;
		});
		console.log("Frontend instruction violations:");
		sorted.forEach((issue, index) => {
			if (index > 0) {
				console.log("");
			}
			const location = issue.line
				? `${issue.file}:${issue.line}`
				: issue.file;
			const severity = issue.severity.toUpperCase();
			console.log(`- ${location}`);
			console.log(`  severity: ${severity}`);
			console.log(`  rule: ${issue.rule}`);
			console.log(`  message: ${issue.message}`);
		});
		console.log("");
		console.log(`Total violations: ${violations.length}`);
	}
}

const hasErrors = violations.some((issue) => issue.severity === "error");
if (hasErrors && !warnOnly) {
	process.exit(1);
}
