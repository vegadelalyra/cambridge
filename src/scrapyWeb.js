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

    const [wrd, IPA, PoS, [lvl, def, exp]] = await Promise.all([
        page.$eval('.dhw', word => word.textContent),
        page.$eval('.us .dpron', ipa => ipa.textContent.replaceAll('/', '')),
        page.$eval('.pos', pos => pos.textContent),
        spot_lvl_def_exp()
    ])
    .then(() => {
        browser.close() 
        const cambridge = {
        word: wrd,
        IPA: IPA,
        PoS: PoS,
        level: lvl,
        def: def.at(-1) == ' '
        ? def.slice(0, -2)
        : def,
        exp: exp.at(-1) == '.' 
        ? exp.trim().slice(0, -1)
        : exp.trim()
        }
        console.log(cambridge)
    }).catch(() => console
    .log(`\n${userInput} is not available in the Cambridge dictionary\n`))
    
    

    // SCRAPE HIGHEST LEVEL, THEN SHORTEST DEF, THEN SHORTEST EXP 
    async function spot_lvl_def_exp() {
    // SCRAPING LEVEL
        // Does the word have CEFR levels at all?
        let lvl = await page.$$('.dxref') 
        if (lvl.length == 0
        ) return await spot_shortest_def_exp(`.ddef_block:has(.db)`)
        lvl = new Set(lvl.map(htmlEl => htmlEl.textContent))
        // If the word have only one level, go with it
        if (lvl.length == 1
        ) return await spot_shortest_def_exp(`.ddef_block:has(.${lvl[0]})`)

        // If word have various def levels, choose the highest one.
        let CEFR = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1']
        lvl = CEFR.find(higher => lvl.has(higher))
        spot_shortest_def_exp(`.ddef_block:has(.${lvl})`)
        // END OF SCRAPING LEVEL
    // SCRAPING DEFINITION && EXAMPLE IN PARALLEL
        async function spot_shortest_def_exp(level) {
            // getting all blocks that matches the scraped level
            let block = await page.$$eval(level, block => {
                // leaving only the block with the shortest definition
                return block.reduce((a, b) => {
                    return a.querySelector('.db').textContent.split(' ').length <=
                    b.querySelector('.db').textContent.split(' ').length ? a : b
                })
            })
            // getting shortest definition and example concurrently
            const [def, exp] = await Promise.all([
                block.querySelector('.db').textContent,
                Array.from(
                    block.querySelectorAll('.dexamp')
                    .values()).reduce((a, b) => { 
                    return a.textContent.split(' ').length <=
                    b.textContent.split(' ').length ? a : b
                }).catch(() => '')
            ])
    // END OF SCRAPING DEFINITION
    // SCRAPING EXAMPLE
            // // getting shortest example
            // try {
            //     exp = Array.from(
            //         block.querySelectorAll('.dexamp')
            //         .values()).reduce((a, b) => { 
            //         return a.textContent.split(' ').length <=
            //         b.textContent.split(' ').length ? a : b
            //     })
            // } catch { exp = '' }
    // END OF SCRAPING EXAMPLE
    // RETURNING LVL, DEF, EXP
            return [lvl, def, exp]
        }
    }
    // scrape the shortest definition & example of the word
    // CEFR = lvl == '' ? '.ddef_block:has(.db)' : `.ddef_block:has(.${lvl})` 
    // const leveled_blocks = await page.$$eval(CEFR, blocks => {
    //     let shortest_def = blocks.reduce((a, b) => {
    //         return a.querySelector('.db').textContent.split(' ').length <= 
    //         b.querySelector('.db').textContent.split(' ').length ? a : b 
    //     }); let shortest_exp

    //     try {
    //         shortest_exp = Array.from(
    //             shortest_def.querySelectorAll(
    //             '.dexamp').values()).reduce((a, b) => { 
    //             return a.textContent.split(' ').length <= 
    //             b.textContent.split(' ').length ? a : b 
    //         })
    //     } catch { shortest_exp = '' }
        
    //     return [

    //         shortest_def.querySelector('.db').textContent,
    //         shortest_exp?.textContent || ''
    //     ]
    // })

    // address output
    // const cambridge = {
    //     word: wrd,
    //     IPA: await page.$eval('.us .dpron', ipa => ipa.textContent.replaceAll('/', '')), 
    //     PoS: await page.$eval('.pos', pos => pos.textContent),
    //     level: lvl,
    //     def: leveled_blocks.def.at(-1) == ' '
    //     ? leveled_blocks.def.slice(0, -2)
    //     : leveled_blocks.def,
    //     exp: leveled_blocks.exp.at(-1) == '.' 
    //     ? leveled_blocks.exp.trim().slice(0, -1)
    //     : leveled_blocks.exp.trim()
    // }; 
}