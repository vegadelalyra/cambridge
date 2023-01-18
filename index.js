#!/usr/bin/env node
import yargs from 'yargs'

yargs(process.argv.slice(2))
.usage('\nLook up the most advanced definition of a word in the Cambridge dictionary.')
.command('$0', 'Search your word in Cambridge', ()=> {}, () => import('./src/commands/default.js'))
.command('sequentially', 'Test the speed of n scrapes', () => {}, () => import('./src/commands/test_sql.js'))
.command('in parallel', 'Test 100 times concurrently', () => {}, () => import('./src/commands/parallel.js'))
.argv