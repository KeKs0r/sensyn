const Seneca = require('seneca')
var Assert = require('assert')

var b0, s0, s1, c0
var s0x = 0
var s1z = 0
var s0y = []
var s1y = []

var test_discover = {
  stop: true,
  guess: { active: true },
  multicast: { active: false },
  registry: { active: false }
}

function done (err) {
  if (err) {
    console.error(err)
    return process.exit(1)
  }
  process.exit(0)
}

b0 = Seneca({ tag: 'b0', log: 'test' }).error(done)

s0 = Seneca({ tag: 's0', log: 'test' })
  .error(done)
  .add('a:1', function (m) {
    this.good({ x: m.x + ++s0x })
  })
  .add('b:1', function (m) {
    s0y.push(m.y)
    this.good()
  })

s1 = Seneca({ tag: 's1', log: 'test' })
  .error(done)
  .add('b:1', function (m) {
    s1y.push(m.y)
    this.good()
  })
  .add('c:1', function (m) {
    this.good({ z: m.z + ++s1z })
  })

c0 = Seneca({ tag: 'c0', log: 'test' }).error(done)

b0.use('mesh', { isbase: true, discover: test_discover, sneeze: { silent: true } }).ready(function () {
  s0
    .use('mesh', {
      listen: [{ pin: 'a:1' }, { pin: 'b:1', model: 'observe' }],
      discover: test_discover
    })
    .ready(function () {
      s1
        .use('mesh', {
          listen: [{ pin: 'c:1' }, { pin: 'b:1', model: 'observe' }],
          discover: test_discover
        })
        .ready(function () {
          c0.use('mesh', { discover: test_discover, sneeze: { silent: true } }).ready(do_abc)
        })
    })
})

function do_abc () {
  c0.act('a:1,x:0', function (e, o) {
    Assert.equal(1, o.x)

    c0.act('a:1,x:0', function (e, o) {
      Assert.equal(2, o.x)

      c0.act('b:1,y:0')
      c0.act('b:1,y:1')
      c0.act('b:1,y:2')
      c0.act('b:1,y:3')

      setTimeout(function () {
        Assert.deepEqual([0, 1, 2, 3], s0y)
        Assert.deepEqual([0, 1, 2, 3], s1y)

        c0.act('c:1,z:0', function (e, o) {
          Assert.equal(1, o.z)

          c0.act('c:1,z:0', function (e, o) {
            Assert.equal(2, o.z)

            close()
          })
        })
      }, 111)
    })
  })
}

function close () {
  c0.close()
  s1.close()
  s0.close()
  b0.close()
  setTimeout(done, 555)
}
