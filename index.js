import yargs from 'yargs'

yargs(process.argv.slice(2))
.usage('\nLook up the most advanced definition of a word in the Cambridge dictionary.')
.command('$0', 'Search your word in Cambridge', ()=> {}, () => import('./src/commands/default.js'))
.command('test', 'Test the speed of 10 scrapes', () => {}, () => import('./src/commands/test.js'))
.argv