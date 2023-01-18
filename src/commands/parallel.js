import webScrape from "../scrapyWeb.js"

// Time testing
let userInput = process.argv.slice(4)[0]
if (!userInput) userInput = await import('./userInput.js').then(d => d.default())
if (!/^[a-zA-Z]+$/.test(userInput)) {
console.log('\nEnter ONE valid ENGLISH WORD\n'); process.exit()
} 

const start = performance.now()
const promises = Array(10).fill().map(async (_, i) => {
    const firstPromise = performance.now()
    await webScrape(userInput)
    const currentPromise = performance.now()
    const compensate = currentPromise - firstPromise
    const end = performance.now()
    const elapsedTime = end - start - compensate
    console.log(
        'Test', i + 1, 'Elapsed time', 
        elapsedTime, 'ms'
    )
}); await Promise.all(promises)