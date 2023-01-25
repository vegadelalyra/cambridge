import webScrape from "../scrapyWeb.js"

// Time testing
let userInput = process.argv.slice(4)[0]
if (!userInput) userInput = await import('./userInput.js').then(d => d.default())
if (!/^[a-zA-Z]+$/.test(userInput)) {
console.log('\nEnter ONE valid ENGLISH WORD\n'); process.exit()
} 

const promises = Array(10).fill().map(async (_, i) => {
    console.time(`Concurrence n°${i}`)
    await webScrape(userInput, true)
    console.timeEnd(`Concurrence n°${i}`)
}); await Promise.all(promises)