import { launch } from 'puppeteer'

// web scrape your word data from Cambridge dictionary
export default async function webScrape(userInput) {
// SEQUENTIAL SIDE

    // headless browser 
    const browser = await launch({ waitForInitialPage: false })
    const page = await browser.newPage()

    // request only HTML from the website
    await page.setRequestInterception(true)
    page.on('request', (request) => {
        if (request.resourceType() === 'document') request.continue()
        else request.abort()
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
        page.$eval('.us .dpron', ipa => ipa.textContent.replaceAll('/', '')),
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
    }).catch(err => console
    .log(err, `\n${userInput} is not available in the Cambridge dictionary\n`))
    
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
            const shortestBlock = await page.$$eval(level, blocks => {
                // getting the block with the shortest def
                let defEx = blocks.map( block => {
                    let exs = block.querySelectorAll('.dexamp'), exsArr = []
                    if (exs) for (let ex of exs) exsArr.push(ex.textContent)

                    return {
                        def: block.querySelector('.db').textContent,
                        exp: exsArr.length > 1 ? exsArr : !exsArr[0] ? '' : exsArr[0]
                    }
                })
                return defEx.reduce((a, b) => {
                    return a.def.split(' ').length 
                    <= b.def.split(' ').length ? a : b
                })
            })
            // getting shortest definition and example concurrently
            const [def, exp] = await Promise.all([
                shortestBlock.def.at(-1) == ' '
                ? shortestBlock.def.slice(0, -2) 
                : shortestBlock.def,
                shortestBlock.exp instanceof Array 
                ? shortestBlock.exp.reduce((a, b) => { 
                    return a.split(' ').length <=
                    b.split(' ').length ? a : b
                }) : shortestBlock.exp
            ]); return [lvl, def, exp.at(-1) == '.' ? exp.slice(0, -1) : exp]
        }
    }
}