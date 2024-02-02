#!/usr/bin/env node
import yargs from 'yargs';

// Self-implementation of String.at() and Object.at() methods seeking Node's old versions compatibility
if (
  typeof String.prototype.at === 'undefined' ||
  typeof Object.prototype.at === 'undefined'
) {
  String.prototype.at = function (pos) {
    return pos >= 0 ? this[pos] : this[this.length + pos];
  };

  Object.prototype.at = function (pos) {
    return pos >= 0 ? this[pos] : this[this.length + pos];
  };
}

// Self-implementation of String.prototype.replaceAll() method seeking Node's old versions compatibility
if (typeof String.prototype.replaceAll === 'undefined') {
  function escapeRegex(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  String.prototype.replaceAll = function (match, replace) {
    const escapedMatch = escapeRegex(match);
    return this.replace(new RegExp(escapedMatch, 'g'), replace);
  };
}

yargs(process.argv.slice(2))
  .usage(
    '\nLook up the most advanced definition of a word in the Cambridge dictionary.'
  )
  .command(
    '$0',
    'Search your word in Cambridge',
    () => {},
    () => import('./src/commands/default.js')
  )
  .command(
    'sequentially',
    'Test the speed of n scrapes',
    () => {},
    () => import('./src/commands/test_sql.js')
  )
  .command(
    'in parallel',
    'Test 100 times concurrently',
    () => {},
    () => import('./src/commands/parallel.js')
  ).argv;
