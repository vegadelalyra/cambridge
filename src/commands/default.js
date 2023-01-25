import webScrape from "../scrapyWeb.js"

// User input validation handler
let userInput = process.argv.slice(2).join('-')
if (!userInput) userInput = await import('./userInput.js').then(d => d.default())
if (!/^[a-zA-Z-]+$/.test(userInput)) {
    console.log('\n\x1b[91mEnter a valid ENGLISH WORD or ENGLISH IDIOM\x1b[37m\n'); process.exit()
}; const cache = await import('../cache/hashTable.js').then(enciclo => enciclo.pedia)

// cache dependencies
let test = userInput.includes('-') 
? userInput.replaceAll('-', '') 
: userInput

// Time testing
const start = performance.now()
!!cache[test] 
? console.log(cache[test])
: await Promise.all([webScrape(userInput)])
const end = performance.now()
const elapsedTime = end - start
console.log(
    'Word scraped from Cambridge dictionary in roughly', 
    Number(elapsedTime.toFixed()), 'ms'
); process.exit()