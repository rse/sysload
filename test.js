
const SysLoad = require(".")

const sysload = new SysLoad()

sysload.measure(100).then((load) => {
   console.log(load)
})

sysload.start()
setInterval(() => {
    console.log(sysload.average())
}, 1000)

