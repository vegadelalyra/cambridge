import { launch } from 'puppeteer'

// web scrape your word data from Cambridge dictionary
export default async function webScrape(userInput) {
    // headless browser 
    const browser = await launch({ waitForInitialPage: false, headless: false })
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
    ); let wrd 
    
    try { wrd = await page.$eval('.dhw', wrd => wrd.textContent) }
    catch { 
        console.log(`\n${userInput} is not available in the Cambridge dictionary\n`) 
        process.exit()
    }

    // scrape the highest english level of the word
    let CEFR = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'], lvl = await loopTilStopLvl()
    async function loopTilStopLvl(lvl = 0) {
        if (lvl == 6) return ''
        try { return await page.$eval(`.${CEFR[lvl]}`, level => level.textContent) } 
        catch { return loopTilStopLvl(lvl + 1) }
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
        
        return shortest_def = {
            def : shortest_def.querySelector('.db').textContent,
            exp : shortest_exp?.textContent || ''
        }
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