// A handful of npm packages (e.g. es-errors, hasown, and — until we swapped
// it out — @ffprobe-installer/ffprobe) ship a tsconfig.json with a trailing
// comma, which is invalid JSON. Something in Next.js's build process reads
// every tsconfig.json it can find under node_modules, and chokes with
// "Cannot parse JSON" the moment it hits one of these.
//
// Rather than chase each offending package individually, this script runs
// after every `npm install` and quietly fixes any tsconfig.json under
// node_modules that has this kind of trivial syntax error (trailing comma
// before a closing } or ]). It never touches files that are already valid.

const fs = require("fs");
const path = require("path");

function findTsconfigs(dir, results) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTsconfigs(full, results);
    } else if (entry.name === "tsconfig.json") {
      results.push(full);
    }
  }
}

// Strips // line comments and /* block comments */ from a JSON-with-comments
// string, without touching // or /* that appear inside actual string values
// (e.g. a URL in a comment, or in a legit string value).
function stripJsonComments(input) {
  let output = "";
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (inLineComment) {
      if (ch === "\n") {
        inLineComment = false;
        output += ch;
      }
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      output += ch;
      if (ch === "\\") {
        // preserve the escaped char as-is
        output += next;
        i++;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      output += ch;
    } else if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
    } else if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
    } else {
      output += ch;
    }
  }

  return output;
}

function stripTrailingCommas(input) {
  return input.replace(/,(\s*[}\]])/g, "$1");
}

const nodeModulesDir = path.join(__dirname, "..", "node_modules");
const files = [];
findTsconfigs(nodeModulesDir, files);

let fixedCount = 0;

for (const file of files) {
  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  try {
    JSON.parse(content);
    continue; // already valid, leave it alone
  } catch {
    const candidate = stripTrailingCommas(stripJsonComments(content));
    try {
      JSON.parse(candidate);
      fs.writeFileSync(file, candidate);
      fixedCount++;
    } catch {
      // Not a shape we know how to fix — leave it, but don't crash the install.
    }
  }
}

console.log(
  `fix-broken-tsconfigs: scanned ${files.length} tsconfig.json file(s) in node_modules, repaired ${fixedCount}`
);
