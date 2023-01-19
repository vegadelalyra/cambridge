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
        spot_lvl_def_exp(),

    ]).catch(() => {
        console.log(`\n${userInput} is not available in the Cambridge dictionary\n`) 
        process.exit()
    })
    

    // SCRAPE HIGHEST LEVEL, THEN SHORTEST DEF, THEN SHORTEST EXP 
    async function spot_lvl_def_exp(CEFR = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1']) {
        // Validates if word ever have level.
        if ((await page.$('.dxref')) == null) return 'spotdef(.ddef_block:has(.db))'
        if ((await page.$$('.dxref')).length == 1) return 'spotdef(.ddef_block:has(.${lvl}))'
        
        // If word have various def levels, choose the highest one.
        return async function spot_highest_lvl(lvl = 0) {
            try {
                lvl = await page.$eval(`.${CEFR[lvl]}`, level => level.textContent) 
                return spot_shortest_def(lvl)
            } catch { return spot_highest_lvl(lvl + 1) }
        }
    }
    // scrape the shortest definition & example of the word
    CEFR = lvl == '' ? '.ddef_block:has(.db)' : `.ddef_block:has(.${lvl})` 
    const leveled_blocks = await page.$$eval(CEFR, blocks => {
        let shortest_def = blocks.reduce((a, b) => {
            return a.querySelector('.db').textContent.split(' ').length <= 
            b.querySelector('.db').textContent.split(' ').length ? a : b 
        }); let shortest_exp

        try {
            shortest_exp = Array.from(
                shortest_def.querySelectorAll(
                '.dexamp').values()).reduce((a, b) => { 
                return a.textContent.split(' ').length <= 
                b.textContent.split(' ').length ? a : b 
            })
        } catch { shortest_exp = '' }
        
        return [

            shortest_def.querySelector('.db').textContent,
            shortest_exp?.textContent || ''
        ]
    })


    // address output
    const cambridge = {
        word: wrd,
        IPA: await page.$eval('.us .dpron', ipa => ipa.textContent.replaceAll('/', '')), 
        PoS: await page.$eval('.pos', pos => pos.textContent),
        level: lvl,
        def: leveled_blocks.def.at(-1) == ' '
        ? leveled_blocks.def.slice(0, -2)
        : leveled_blocks.def,
        exp: leveled_blocks.exp.at(-1) == '.' 
        ? leveled_blocks.exp.trim().slice(0, -1)
        : leveled_blocks.exp.trim()
    }; await browser.close() 
    return console.log(cambridge)
}