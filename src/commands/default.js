import webScrape from '../scrapyWeb.js';
import { performance } from 'node:perf_hooks';

// User input validation handler
let userInput = process.argv.slice(2).join('-');
if (!userInput) while (true) await scrapeUserInput(true);

await scrapeUserInput();
// process.exit()

async function scrapeUserInput(waitForInput = false) {
  if (waitForInput)
    userInput = await import('./userInput.js').then(d => d.default());

  const cache = await import('../cache/hashTable.js').then(
    enciclo => enciclo.pedia
  );

  // cache dependencies
  let test = userInput.includes('-')
    ? userInput.replaceAll('-', '')
    : userInput;

  // Time testing
  try {
    const start = performance.now();
    !!cache[test]
      ? console.log(cache[test])
      : await Promise.all([webScrape(userInput)]);
    const end = performance.now();
    const elapsedTime = end - start;
    console.log(
      'Word scraped from Cambridge dictionary in roughly',
      Number(elapsedTime.toFixed()),
      'ms'
    );
  } catch (error) {
    // if none scrape matched, then alert user and exit app
    console.log(
      error,
      '\n',
      userInput,
      '\x1b[93mis not available in the Cambridge dictionary\n\x1b[37m'
    );
    return;
  }
}
