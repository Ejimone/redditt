const fs = require('fs');
const json = JSON.parse(fs.readFileSync('posts.json', 'utf8'));

let content = fs.readFileSync('/Users/evidence/redditt/redit/backend/src/seed.ts', 'utf8');

// replace seededPosts array
const startStr = "const seededPosts = [";
const start = content.indexOf(startStr);
const endStr = "];\n\n  for (const post of seededPosts) {";
const end = content.indexOf(endStr) + 2;

const newArr = `const seededPosts = ${JSON.stringify(json, null, 2)};`;
content = content.substring(0, start) + newArr + content.substring(end);

// remove the ugly loop
const loopStart = content.indexOf("for (let i = 0; i < 150; i++) {");
const logStart = content.indexOf("strapi.log.info(\"Seeded mass");

content = content.substring(0, loopStart) + content.substring(logStart);

// delete db and trigger fresh run by changing count to 0
content = content.replace("if (subredditCount > 50) {", "if (subredditCount > 1000) { // force seed");

fs.writeFileSync('/Users/evidence/redditt/redit/backend/src/seed.ts', content);
