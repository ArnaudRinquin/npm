var fs = require('graceful-fs')
var path = require('path')

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var test = require('tap').test

var common = require('../common-tap')

var root = path.join(__dirname, 'install-preinstall')
var pkg = path.resolve(root, 'package-with-preinstall')

var localPaths = {
  author: 'Milton the Aussie',
  name: 'remove-local-modules',
  version: '0.0.0',
  scripts: {
    // preinstall: 'echo lol',
    // preinstall: 'rm -rf node_modules/package-local-dependency',
    postinstall: 'test -d node_modules/package-local-dependency'
  },
  dependencies: {
    'package-local-dependency': 'file:./package-local-dependency'
  }
}

var localDependency = {
  name: 'package-local-dependency',
  version: '0.0.0',
  description: 'A local dependency that we always remove in preinstall'
}

test('setup', function (t) {
  setup()
  t.end()
})

test('preinstall runs before missing deps are listed', function (t) {
  common.npm(
    [
      'install', '.'
    ],
    { cwd: pkg },
    function (err, code) {
      t.ifError(err, 'error should not exist')
      t.notOk(code, 'npm install exited with non 0')
      var dependencyPackageJson = path.resolve(
        pkg,
        'node_modules/package-local-dependency/package.json'
      )
      t.ok(
        JSON.parse(fs.readFileSync(dependencyPackageJson, 'utf8')),
        'package was found missing and installed'
      )
      t.end()
    }
  )
})

test('cleanup', function (t) {
  cleanup()
  t.end()
})

function cleanup () {
  rimraf.sync(root)
}

function setup () {
  test('setup', function (t) {
    rimraf.sync(pkg)
    mkdirp.sync(pkg)
    fs.writeFileSync(
      path.join(pkg, 'package.json'),
      JSON.stringify(localPaths, null, 2)
    )

    mkdirp.sync(path.join(pkg, 'package-local-dependency'))
    fs.writeFileSync(
      path.join(pkg, 'package-local-dependency', 'package.json'),
      JSON.stringify(localDependency, null, 2)
    )
//
    t.end()
  })
}
