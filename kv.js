var minimist = require('minimist')
var argv = minimist(process.argv.slice(2))

var hyperlog = require('hyperlog')
var hyperkv = require('hyperkv')
var level = require('level')
var sub = require('subleveldown')

var db = level(argv.d)
var log = hyperlog(sub(db, 'log'), { valueEncoding: 'json' })
var kv = hyperkv({ log: log, db: sub(db, 'kv') })

if (argv._[0] === 'put') {
  kv.put(argv._[1], argv._[2], function (err, value) {
    if (err) console.error(err)
  })
} else if (argv._[0] === 'get') {
  kv.get(argv._[1], function (err, value) {
    if (err) console.error(err)
    else console.log(value)
  })
} else if (argv._[0] === 'sync') {
  process.stdin.pipe(log.replicate()).pipe(process.stdout)
}
