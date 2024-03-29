import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs';

// web scrape your word data from Cambridge dictionary
export default async function webScrape(userInput, test = false) {
  // send the HTTP get request with axios library, parse the data with cheerio
  const url = `https://dictionary.cambridge.org/dictionary/english/${userInput}`;
  // headers required on HTTP request to avoid ERROR: socket hang up from Cambridge server
  const headersToAvoidBugs = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  };
  const res = await axios.get(url, {
    headers: headersToAvoidBugs,
  });
  const $ = load(res.data);

  // retrieve all the desired data with high-level selectors in parallel
  const [wrd, [ipa, PoS, lvl, def, exp]] = await Promise.all([
    $('.dpos-h_hw:first').text(), // word, idiom or phrase name
    ScrapingCambridge(), // scrape ipa, pos, lvl, def, exp
  ]);
  let cambridge = {
    word: wrd,
    IPA: ipa,
    PoS: PoS,
    lvl: lvl,
    def: def,
    exp: exp,
  };
  console.log(cambridge);

  // Cache handler
  if (test) return; // disabled on test environment
  userInput = userInput.replaceAll('-', '');
  cambridge = `pedia.${userInput} = ` + JSON.stringify(cambridge) + '\n';
  const hashTableFile = new URL('cache/hashTable.js', import.meta.url);
  try {
    fs.appendFileSync(hashTableFile, cambridge);
  } catch (e) {
    console.error(e);
  }

  // My finest scrapy web function!
  async function ScrapingCambridge() {
    let CEFR = $('.dxref');
    CEFR = !CEFR.length
      ? ''
      : CEFR.text()
          .match(/.{1,2}/g)
          .sort()
          .at(-1);

    // Gets the top CEFR level block with the shortest definition
    let lvl = !CEFR ? '' : `:has(.${CEFR})`;
    let topBlock = $(`.dsense_b > .def-block${lvl}, .phrase-block${lvl}`)
      .map(function () {
        return {
          def: $(this).find('.def').text(),
          exp: $(this)
            .find('.dexamp')
            .toArray()
            .map(x => $(x).text()),
          the: $(this)
            .parents()
            .eq(2)
            .prev()
            .map(function () {
              return {
                ipa: !!$(this).has('.us .dpron').length
                  ? $(this).find('.us .dpron:first').text()
                  : $(this).find('.uk .dpron:first').text(),
                pos: $(this).find('.dpos:first').text(),
              };
            })
            .toArray()[0],
        };
      })
      .toArray()
      .reduce((a, b) =>
        a.def.split(' ').length <= b.def.split(' ').length ? a : b
      );

    // GETTING ALL DATA IN PARALLEL
    const [ipa, pos, def, exp] = await Promise.all([
      // Spot out the IPA and PoS of top level definition
      topBlock.the?.ipa.slice(1, -1) ?? '',
      topBlock.the?.pos ?? '',
      getDf(),
      getEx(),
    ]);
    // Top level shortest definition
    function getDf() {
      let def = topBlock.def;
      if (def.includes('\n')) def = def.replaceAll('\n', '').trim();
      def = def.replace(/\s+/g, ' '); // -2 for the last index we want, -1 to adjust length/index dif
      return (def = def.at(-2) == ':' ? def.slice(0, -2) : def.trim());
    }
    // Get the shortest example if any
    function getEx() {
      let exp = topBlock.exp;
      exp = !exp.length
        ? ''
        : exp.reduce((a, b) =>
            a.split(' ').length <= b.split(' ').length ? a : b
          );
      return (exp = exp.at(-1) == '.' ? exp.slice(0, -1) : exp.trim());
    }
    return [ipa, pos, CEFR, def, exp]; // VICTORY!!!
  }
}
