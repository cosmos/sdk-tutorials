const fs = require("fs");

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

var HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escapeHtml(str) {
  if (/[&<>"]/.test(str)) {
    return str.replace(/[&<>"]/g, replaceUnsafeChar);
  }
  return str;
}

module.exports = (md) => {
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, options] = args;
    const token = tokens[idx];
    if (fs.existsSync(token.src)) {
      token.content = fs.readFileSync(token.src, "utf8");
    }
    const base64 = Buffer.from(escapeHtml(token.content)).toString("base64");
    const lang = token.info.match(/([a-z0-9]+)/)?.pop();
    const filename = token.info.match(/\[(.*)\]/)?.pop();

    var args = `class="codeblock" language="${lang}" base64="${base64}"`;
    if (filename) {
      args += ` url="${filename}"`;
    }

    return `
    <tm-code-block ${args}></tm-code-block>
    `;
  };
};
