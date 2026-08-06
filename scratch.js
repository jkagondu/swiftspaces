const fs = require('fs');
const code = fs.readFileSync('src/app/manager/page.tsx', 'utf8');
const lines = code.split('\n');
let divCount = 0;
for (let i = 498; i <= 745; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  divCount += opens - closes;
  if (opens !== closes || opens > 0 || closes > 0) {
     console.log(`Line ${i+1}: net ${opens - closes} (total ${divCount}). Line: ${line}`);
  }
}
