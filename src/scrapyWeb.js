import axios from 'axios'
import { load } from 'cheerio'

// web scrape your word data from Cambridge dictionary
export default async function webScrape(userInput, test = false) {
    const url = `https://dictionary.cambridge.org/dictionary/english/${userInput}`
    const res = await axios.get(url)
    const html = res.data
    const $ = load(html)

    const [wrd, ipa, PoS, def, exp] = await Promise.all([
        $('.dhw').text(),
        $('.us .dpron').text(),
        $('.pos').text(),
        $('.db').text(),
        $('.dexamp').text(),
    ])

    console.log({
        word: wrd,
        IPA: ipa,
        PoS: PoS,
        def: def,
        exp: exp
    })
}