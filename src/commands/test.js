import webScrape from "../scrapyWeb.js"

// Time testing
let n = 0, avg = [], userInput = process.argv.slice(3)[0]
if (!userInput) userInput = await import('./userInput.js').then(d => d.default())
if (!/^[a-zA-Z]+$/.test(userInput)) {
    console.log('\nEnter ONE valid ENGLISH WORD\n') 
    process.exit()
}

do {
    const start = performance.now()
    
    // Your code goes here
    await webScrape(userInput)

    const end = performance.now()
    const elapsedTime = end - start
    console.log('Elapsed time: ', elapsedTime, 'ms')
    avg.push(elapsedTime); n++
} while ( n < 10 )

avg = avg.reduce((acc, val) => acc + val, 0) / avg.length
console.log('Word scraped from Cambridge dictionary in roughly', avg, 'ms')
process.exit()