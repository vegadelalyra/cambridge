// Time testing
let lvl2 = ['A1', 'A1']
let CEFR2 = ['C2', 'C1', 'B2', 'B1', 'A2']
let cat = ['C', 'B', 'A']
lvl2 = new Set(lvl2)
console.log(lvl2);
lvl2 = CEFR2.find(x => lvl2.has(x))
console.log('lvl2', lvl2)

let miau = 3 - 4 ? console.log('miau', miau)
: console.log('wow', miau)
// // last approach
// lvl = lvl.map(htmlEl => htmlEl.textContent)
// let CEFR = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1']
// for (let i = 0; i < CEFR.length; i++) {
//     if (!lvl.includes(CEFR[i])) continue
//     lvl = lvl.filter(x => x == CEFR[i])
//     break