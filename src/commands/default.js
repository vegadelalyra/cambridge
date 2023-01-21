import webScrape from "../scrapyWeb.js"

// User input handler
let userInput = process.argv.slice(2)
if (!userInput) userInput = await import('./userInput.js').then(d => d.default())
if (userInput instanceof Array) userInput = userInput.join('-')
if (!/^[a-zA-Z-]+$/.test(userInput)) {
    console.log('\nEnter a valid ENGLISH WORD or ENGLISH IDIOM\n') 
    process.exit()
}; const cache = await import('../cache/hashTable.js').then(enciclo => enciclo.pedia)

// Time testing
const start = performance.now()
!!cache[userInput] 
? console.log(cache[userInput])
: await Promise.all([webScrape(userInput)])
const end = performance.now()

const elapsedTime = end - start
console.log('Word scraped from Cambridge dictionary in roughly', elapsedTime, 'ms')
process.exit()