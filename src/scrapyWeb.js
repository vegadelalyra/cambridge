import axios from 'axios'
import { load } from 'cheerio'

// web scrape your word data from Cambridge dictionary
export default async function webScrape(userInput, test = false) {
    // send the HTTP get request with axios library, parse the data with cheerio
    const url = `https://dictionary.cambridge.org/dictionary/english/${userInput}`
    const res = await axios.get(url)
    let $ = load(res.data)
    let page = $('#page-content').html()
    $ = load(page)

    // retrieve all the desired data with high-level selectors in parallel
    const [wrd, ipa, PoS, lvl, def, exp] = await Promise.all([
        $('#cald4-1+ .dpos-h .dpos-h_hw').text(), // word, phrase or idiom name
        $('.us .lpl-1').text(), // IPA of the highest level
        $('.pos').first().text(), // Position of Speech of the highest level
        $('.A2').first().text(), // highest available CEFR (Common European Framework Reference) level
        $('.db').first().text(), // shortest definition with the highest CEFR level if any
        $('.dexamp').first().text(), // shortest example of the shortest definition with highest level
    ])

    console.log({
        word: wrd,
        IPA: ipa,
        PoS: PoS,
        lvl: lvl,
        def: def,
        exp: exp
    })
}