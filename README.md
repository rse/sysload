
SysLoad
=======

**System Load Determination**

<p/>
<img src="https://nodei.co/npm/sysload.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/sysload.png" alt=""/>

Abstract
--------

This is a small [Node](https://nodejs.org/) module for conveniently
determining the systen load, once or continuously.

Installation
------------

```sh
$ npm install sysload
```

Usage
-----

```js
const SysLoad = require("sysload")

const sysload = new SysLoad()

sysload.measure(100).then((load) => {
   console.log(load)
})

sysload.start()
setInterval(() => {
    console.log(sysload.average())
}, 1000)
```

Application Programming Interface
---------------------------------

FIXME

License
-------

Copyright (c) 2016-2017 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

