'use strict';

var assert = require('assert');
var rewire = require('rewire');
var fs     = require('./mock_fs');

var move = rewire('../lib/move');

describe('move', function () {

  before(function () {
    move.__set__('fs', fs);
  });

  it('should move a file from one place to another', function (done) {

    var from = '/test/move/a.js';
    var to = '/test/move/b.js';

    fs.write(from, 'some text').then(function () {
      return move(from, to);
    }).then(function () {
      return fs.read(to);
    }).then(function (contents) {
      assert.equal(contents, 'some text');
      return fs.read(from);
    }).catch(function (err) {
      assert.equal(err, from);
      done();
    }).done();

  });

  describe('.parse', function () {

    it('should fix required dependency', function () {

      var from = '/test/move/parse/a.js';
      var to   = '/test/move/b.js';

      var contents = [
        'require("./foo");',
        'require("../bar");',
        'require("../../qux");'
      ].join('\n');

      var expected = [
        'require("./parse/foo");',
        'require("./bar");',
        'require("../qux");'
      ].join('\n');

      var output = move.parse(from, to, contents);
      assert.equal(output, expected);

    });

  });

});
