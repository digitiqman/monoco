var desync = require('./')
  , chai = require('chai')
  , should = require('chai').should()
chai.use(require('chai-spies'))

describe('desync', function() {
  it('should convey results', function(done) {
    var ret = {}
    function fn() {
      return ret
    }

    var fnAsync = desync(fn)
    fnAsync(cb)

    function cb(err, result) {
      should.not.exist(err)
      result.should.equal(ret)
      done()
    }
  })

  it('should catch errors', function(done) {
    var err = new TypeError('err')
    function fn() {
      throw err
    }

    var fnAsync = desync(fn)
    fnAsync(cb)

    function cb(err_, result) {
      err_.should.equal(err)
      should.not.exist(result)
      done()
    }
  })

  it('should convey arguments', function(done) {
    var args
    function fn() {
      args = [].slice.call(arguments)
    }

    var fnAsync = desync(fn)
    fnAsync(1, 2, 3, cb)

    function cb(err, result) {
      args.should.deep.equal([1, 2, 3])
      done()
    }
  })

  it('should run cb asynchronously', function(done) {
    var cb = chai.spy(done)
      , fnAsync = desync(function(){}, cb)

    fnAsync(cb)
    cb.should.not.have.been.called()
  })

  it('should run cb asynchronously in case of an error', function(done) {
    var cb = chai.spy(function() { done() })
      , fnAsync = desync(function(){ throw new Error('err') }, cb)

    fnAsync(cb)
    cb.should.not.have.been.called()
  })
})
