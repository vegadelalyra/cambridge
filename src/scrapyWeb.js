import axios from 'axios'
import { load } from 'cheerio'

// web scrape your word data from Cambridge dictionary
export default async function webScrape(userInput, test = false) {
    // send the HTTP get request with axios library, parse the data with cheerio
    const url = `https://dictionary.cambridge.org/dictionary/english/${userInput}`
    const res = await axios.get(url), $ = load(res.data)

    // retrieve all the desired data with high-level selectors in parallel
    const [wrd, [ipa, PoS, lvl, def, exp]] = await Promise.all([
        $('#cald4-1+ .dpos-h .dpos-h_hw').text(), // word, phrase or idiom name
        assBigFnThatScrapesAll()
    ])

    function assBigFnThatScrapesAll(){
        let CEFR = $('.dxref')
        CEFR = !!CEFR.length 
        ? CEFR.text().match(/.{1,2}/g).sort().at(-1)
        : ''
            
        // Gets the top CEFR level block with the shortest definition
        let lvl = !CEFR ? '' : `:has(.${CEFR})` 
        let topBlock = $(`.dsense_b > .def-block${lvl}, .phrase-block${lvl}`)
        .map( function() { return {
            def: $(this).find('.def').text(), 
            exp: $(this).find('.dexamp')
                .toArray().map(x => $(x).text())
        }}).toArray().reduce((a, b) => 
        a.def.split(' ').length <=
        b.def.split(' ').length ? a : b)

        // Top level shortest definition
        let def = topBlock.def
        def = def.at(-2) == ':' 
        ? def.slice(0, -2)
        : def.trim()

        // Get the shortest example if any
        let exp = topBlock.exp
        exp = !exp.length ? ''
        : exp.reduce((a, b) => 
        a.split(' ').length <= 
        b.split(' ').length ? a : b)  
        exp = exp.at(-1) == '.' 
        ? exp.slice(0, -1)
        : exp.trim()

        console.log(topBlock)
        return [1,2, CEFR, def, exp]        
    }

    console.log({
        word: wrd,
        IPA: ipa,
        PoS: PoS,
        lvl: lvl,
        def: def,
        exp: exp
    })
}