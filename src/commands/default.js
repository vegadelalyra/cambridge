import webScrape from "../scrapyWeb.js"

// User input handler
let userInput = process.argv.slice(2)[0]
if (!userInput) userInput = await import('./userInput.js').then(d => d.default())
if (!/^[a-zA-Z]+$/.test(userInput)) {
    console.log('\nEnter ONE valid ENGLISH WORD\n') 
    process.exit()
}

// Time testing
const start = performance.now()
// Your code goes here
await webScrape(userInput)
const end = performance.now()

const elapsedTime = end - start
console.log('Word scraped from Cambridge dictionary in roughly', elapsedTime, 'ms')
process.exit()