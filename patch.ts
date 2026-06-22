import * as fs from 'fs';
const pathStr = 'src/pages/ClientApp.tsx';
let content = fs.readFileSync(pathStr, 'utf8');

const anchor1 = `  if (!inv) return <div className="p-8 text-center text-slate-500 font-bold">{lang === "sw" ? "Inapakia..." : "Loading..."}</div>;`;
const startIdx = content.indexOf(anchor1);

const anchor2 = `    </>
  );
}`;
const endIdxToReplaceTo = content.indexOf(anchor2, startIdx);

const newBody = fs.readFileSync('replacement.txt', 'utf8');

const before = content.substring(0, startIdx);
const after = content.substring(endIdxToReplaceTo + anchor2.length);

const newContent = before + newBody + `\n  );\n}` + after;

fs.writeFileSync(pathStr, newContent);
console.log("Updated ClientApp.tsx via direct Node replacement");
