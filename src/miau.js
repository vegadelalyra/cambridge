// Time testing
let lvl2 = ['C2', 'C1', 'A1', 'A1', 'A2', 'B1', 'B1', 'A2', 'B1', 'B1', 'B2', 'B2']
// lvl2 = new Set(lvl2)
console.log(lvl2.sort().at(-1));

// // last approach
// lvl = lvl.map(htmlEl => htmlEl.textContent)
// let CEFR = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1']
// for (let i = 0; i < CEFR.length; i++) {
//     if (!lvl.includes(CEFR[i])) continue
//     lvl = lvl.filter(x => x == CEFR[i])
//     break