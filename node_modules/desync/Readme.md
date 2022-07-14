[![Build Status](https://travis-ci.org/nathan7/desync.png)](https://travis-ci.org/nathan7/desync)

# desync

  wrap an synchronous function in an async one

## Installation

    $ npm install desync

    $ component install nathan7/desync

## desync(fn)
returns a function that takes one more argument - a callback with signature function(err, result). The callback is guaranteed to be called asynchronously.
desync will pass the return value of fn as the result. desync will catch thrown exceptions and pass them to the callback.

## License

  MIT
