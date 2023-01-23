import { launch } from 'puppeteer'
import fs from 'fs'

// web scrape your word data from Cambridge dictionary
export default async function webScrape(userInput, test = false) {
// SEQUENTIAL SIDE
    // headless browser 
    console.time('Opening browser')
    const browser = await launch({
        waitForInitialPage: false,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-sync',
            '--disable-translate',
            '--disable-web-security',
            '--disable-accelerated-2d-canvas',
            '--disable-extensions',
            '--remote-debugging-port=9222',
            '--remote-debugging-address=0.0.0.0',
        ]
    })

    console.timeEnd('Opening browser')
    console.time('opening new page')
    let page = await browser.pages()
    page = page[0]
    console.timeEnd('opening new page')

    console.time('Intercepting signals')
    // request only HTML from the website
    page.setRequestInterception(true)
    page.on('request', request => {
        if (request.resourceType() !== 'document') request.abort()
        else request.continue()
    })
    console.timeEnd('Intercepting signals')

    console.time('Going to link')
    // navigate and scrape
    await page.goto(
        `https://dictionary.cambridge.org/dictionary/english/${userInput}`, 
        { waitUntil: 'domcontentloaded' }
    ); browser.close()
    console.timeEnd('Going to link')

// END OF SEQUENTIAL SIDE
// START THE PARTY ! ~ CONCURRENT SIDE ~
    console.time('Scraping web in parallel')
    await Promise.all([
        page.evaluate(() => document.getElementsByClassName('dhw')[0].textContent),
        page.evaluate(() => document.getElementsByClassName('dpron')[0].textContent.replaceAll('/', '')).catch(() => ''),
        page.evaluate(() => document.getElementsByClassName('pos')[0].textContent),
        spot_lvl_def_exp()
    ]).then(values => {
        let cambridge = {
            wrd: values[0], 
            IPA : values[1],
            PoS : values[2],
            lvl : values[3][0],
            def : values[3][1],
            exp : values[3][2]
        }; 
        console.log(cambridge)
        console.timeEnd('Scraping web in parallel')
        if (test) return
        userInput = userInput.replaceAll('-', '')
        cambridge = `pedia.${userInput} = ` + JSON.stringify(cambridge) + '\n'
        const fileUrl = new URL('./cache/hashTable.js', import.meta.url)
        let filePath = new URL(fileUrl).pathname
        if (filePath.includes('/C:/')) filePath = filePath.slice(3)
        try { fs.appendFileSync(filePath, cambridge) 
        } catch { fs.appendFileSync('./src/cache/hashTable.js', cambridge) }
    }).catch(() => console
    .log(`\n\x1b[97m${userInput}\x1b[97m is not available in the Cambridge dictionary\n`))
    
    // SCRAPE HIGHEST LEVEL, THEN SHORTEST DEF, THEN SHORTEST EXP 
    async function spot_lvl_def_exp() {
    // SCRAPING LEVEL
        // Does the word have CEFR levels at all?
        let lvl = await page.$$eval(
            '.dxref', promises => {
                let lvl = promises.map(htmlEl => htmlEl.textContent)
                return lvl.sort().at(-1) ?? ''
            }
        ); if (lvl == '') return await spot_shortest_def_exp(`.ddef_block:has(.db)`)
        // If word have various def levels, choose the highest one.
        return spot_shortest_def_exp(`.ddef_block:has(.${lvl})`)
        // END OF SCRAPING LEVEL
    // SCRAPING DEFINITION && EXAMPLE IN PARALLEL
        async function spot_shortest_def_exp(level) {
            // getting all blocks that matches the scraped level
            const shortestBlock = await page.$$eval(level, async blocks => {
                let defLengths = blocks.map(block => {
                    return block.querySelector('.db').textContent.split(' ').length
                }); const block = blocks[defLengths.indexOf(Math.min(...defLengths))]

                const [ def, exp ] = await Promise.all([
                    curatingDef(),
                    curatingExp()
                ]); return { def, exp }

                function curatingDef () {
                    let def = block.querySelector('.db').textContent
                    return def.at(-1) == ' ' ? def.slice(0, -2) : def
                }

                function curatingExp () {
                    let guardClause = block.querySelectorAll('.dexamp')
                    if (!guardClause.length) return '' 
                    let exp = Array.from(guardClause)
                    .map(x => x.textContent)
                    .reduce((a, b) => a.split(' ').length <= b.split(' ').length ? a : b)
                    .trim()
                    
                    if (exp.at(-1) == '.') exp = exp.slice(0, -1)
                    if (exp.at(0) == '[') exp = exp.slice(6) 
                    return exp 
                }
            })
            return [lvl, shortestBlock.def, shortestBlock.exp]
        }
    }
}