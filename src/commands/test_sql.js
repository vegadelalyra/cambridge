import webScrape from "../scrapyWeb.js"

// Time testing
let n = 0, avg = [], userInput = process.argv.slice(3)[0]
const cap = process.argv.slice(4)[0] ||  10
if (!userInput) userInput = await import('./userInput.js').then(d => d.default())
if (!/^[a-zA-Z]+$/.test(userInput)) {
    console.log('\nEnter ONE valid ENGLISH WORD\n') 
    process.exit()
} 

function endOfTest() {
    avg = avg.reduce((acc, val) => acc + val, 0) / avg.length
    console.log(
        n, n <= 1 ? 'test' : 'tests', 'done.', 
        'Word scraped from Cambridge dictionary in roughly', 
        avg, 'ms'
    ); process.exit()
}

process.on('SIGINT', endOfTest)

do {
    const start = performance.now()
    await Promise.all([webScrape(userInput)])
    const end = performance.now()
    
    const elapsedTime = end - start
    console.log(
        'Test n°', n + 1, 
        'Elapsed time: ', elapsedTime, 'ms'
    ); avg.push(elapsedTime); n++
    if (n == 1000) break
} while ( cap == '!' || n < cap )

endOfTest()