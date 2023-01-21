import { launch } from 'puppeteer'

// web scrape your word data from Cambridge dictionary
export default async function webScrape(userInput) {
// SEQUENTIAL SIDE

    // headless browser 
    const browser = await launch({ waitForInitialPage: false, ignoreHTTPSErrors: true })
    const page = await browser.newPage()

    // request only HTML from the website
    await page.setRequestInterception(true)
    page.on('request', (request) => {
        if (request.resourceType() !== 'document') request.abort()
        else request.continue()
    })

    // navigate and scrape
    await page.goto(
        `https://dictionary.cambridge.org/dictionary/english/${userInput}`, 
        { waitUntil: 'domcontentloaded' }
    ) 
// END OF SEQUENTIAL SIDE

// START THE PARTY ! ~ CONCURRENT SIDE ~

    await Promise.all([
        page.$eval('.dhw', word => word.textContent),
        page.$eval('.us .dpron', ipa => ipa.textContent
        .replaceAll('/', '')).catch(() => ''),
        page.$eval('.pos', pos => pos.textContent),
        spot_lvl_def_exp(),
    ]).then(values => {
         browser.close()
        return console.log({
            word: values[0], 
            IPA : values[1],
            PoS : values[2],
            CEFR: values[3][0],
            def : values[3][1],
            exp : values[3][2]
        })
    }).catch(() => console
    .log(`\n${userInput} is not available in the Cambridge dictionary\n`))
    
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