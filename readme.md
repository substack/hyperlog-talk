# hyperlog

a nice javascript library for p2p data replication

---
# logs

very useful for p2p data replication

---
# merkle DAG

append-only data structure

each document points at the hash of its ancestors

like git!

---
# add

``` js
var hyperlog = require('hyperlog')
var level = require('level')
```

---
# add

``` js
var hyperlog = require('hyperlog')
var level = require('level')

var log = hyperlog(level('/tmp/log.db'), { valueEncoding: 'json' })
```

---
# add

``` js
var hyperlog = require('hyperlog')
var level = require('level')

var log = hyperlog(level('/tmp/log.db'), { valueEncoding: 'json' })

var value = process.argv[2]
var prev = process.argv.slice(3)

log.add(prev, value, function (err, node) {
  console.log(node.key)
})
```

---
# createReadStream

to list out all documents:

``` js
var hyperlog = require('hyperlog')
var level = require('level')

var log = hyperlog(level('/tmp/log.db'), { valueEncoding: 'json' })
log.createReadStream().on('data', console.log)
```

---
# replicate

p2p sync!

``` js
var hyperlog = require('hyperlog')
var level = require('level')

var log = hyperlog(level('/tmp/log.db'), { valueEncoding: 'json' })
process.stdin.pipe(log.replicate()).pipe(process.stdout)
```

---
# dupsh

you can use `npm install -g dupsh` to test replication over stdin/stdout

```
$ dupsh CMDA CMDB
```

pipes CMDA's stdout into CMDB's stdin
and pipes CMDB's stdout into CMDA's stdin

---
# dupsh

speaking a symmetric p2p protocol over stdout/stdin

```
$ dupsh 'node kv.js sync -d /tmp/a' 'node kv.js sync -d /tmp/b'
```

---
# dupsh

swap either one for another command that speaks stdin/stdout

```
$ dupsh 'node kv.js sync -d /tmp/a' 'nc -l 5000'
```

---
# dupsh

swap either one for another command that speaks stdin/stdout

```
$ dupsh 'node kv.js sync -d /tmp/a' 'nc localhost 5000'
```

---
# kappa architecture

a log is the source of truth

materialized views create indexes derived from the log data

---
# hyperlog-index

provides a materialized view API:

provide your own storage mechanism

``` js
var dex = indexer({
  log: log,
  db: sub(idb, 'i'),
  map: function (row, next) {
    // ... call next() after you've stored some data...
  }
})
```

---
# hyperlog-index kv store

multi-value register conflict strategy
p2p key/value store!

``` js
var dex = indexer({
  log: log,
  db: sub(idb, 'i'),
  map: function (row, next) {
    db.get(row.value.k, function (err, doc) {
      if (!doc) doc = {}
      row.links.forEach(function (link) {
        delete doc[link]
      })
      doc[row.key] = row.value.v
      db.put(row.value.k, doc, next)
    })
  }
})
```

---
# or do this:

```
var hyperkv = require('hyperkv')
var kv = hyperkv({
  log: hyperlog(level(...)),
  db: level(...)
})
```

---
# catching up

``` js
dex.ready(function () {
  // here the log is fully "caught up"
  // so you can answer questions about the up-to-date log
})
```

---
# database migrations

```
$ rm -rf db/index
```

and the logs will automatically catch up with the new logic!

---
# some things I've built with hyperlogs

* osm-p2p-db - p2p offline map database
* swarmchat - p2p irc-style webrtc chat hosted on neocities

