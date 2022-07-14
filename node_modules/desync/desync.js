module.exports =
function desync(fn) {
  return function() {
    var ret
      , args = Array.prototype.slice.call(arguments, 0, -1)
      , cb = arguments[arguments.length - 1]
    try {
      ret = fn.apply(null, args)
    } catch (err) {
      return nextTick(function() { cb(err) })
    }
    return nextTick(function() { cb(null, ret) })
  }
}

var nextTick = (typeof process != 'undefined' && typeof process.nextTick == 'function')
             ? process.nextTick
             : require('next-tick')
