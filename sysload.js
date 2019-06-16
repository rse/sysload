/*!
**  SysLoad -- System Load Determination
**  Copyright (c) 2017-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  internal requirements  */
const os = require("os")

/*  the exported API class  */
module.exports = class SysLoad {
    /*  initialize internal state  */
    constructor (config = "std") {
        if (typeof config === "string") {
            if (config === "std") {
                /*  the standard time slot configuration  */
                this.config = {
                    "s1":                         1,
                    "s10":                   10 * 1,
                    "m1":                6 * 10 * 1,
                    "m10":          10 * 6 * 10 * 1,
                    "h1":       6 * 10 * 6 * 10 * 1,
                    "h10": 10 * 6 * 10 * 6 * 10 * 1
                }
            }
            else if (config === "unix") {
                /*  the Unix-style time slot configuration  */
                this.config = {
                    "m5":   5 * 60,
                    "m10": 10 * 60,
                    "m15": 15 * 60
                }
            }
            else
                throw new Error("invalid time slot configuration (expected \"std\" or \"unix\")")
        }
        else if (typeof config === "object")
            this.config = config
        else
            throw new Error("invalid time slot configuration (expected string or object)")
        this.measuring = false
        this.loads = null
    }

    /*  measure once over a certain duration  */
    measure (duration = 100) {
        return new Promise((resolve /*, reject */) => {
            /*  determine absolute CPU times once  */
            const cpuTimes = () => {
                let idle  = 0
                let total = 0
                let cpus = os.cpus()
                for (let i = 0; i < cpus.length; i++) {
                    for (let type in cpus[i].times)
                        total += cpus[i].times[type]
                    idle += cpus[i].times.idle
                }
                return {
                    total: total / cpus.length,
                    idle:  idle  / cpus.length
                }
            }

            /*  determine CPU times at start  */
            let start = cpuTimes()
            setTimeout(() => {
                /*  determine CPU times at end  */
                let end = cpuTimes()

                /*  calculate the difference  */
                let diff = { total: 0, idle: 0 }
                if (end.total > start.total) {
                    /*  regular case  */
                    diff.total = end.total - start.total
                    diff.idle  = end.idle  - start.idle
                }
                else {
                    /*  special case: integer overflow  */
                    diff.total = Math.MAX_SAFE_INTEGER - start.total + end.total
                    diff.idle  = Math.MAX_SAFE_INTEGER - start.idle  + end.idle
                }

                /*  calculate the system load  */
                let load = 100 - (100 * diff.idle / diff.total)

                /*  reduce resolution  */
                load = Math.trunc(load * 10) / 10

                resolve(load)
            }, duration)
        })
    }

    /*  start continuous measurement  */
    start () {
        /*  sanity check usage context  */
        if (this.measuring)
            throw new Error("continuous measurement already in progress (stop first)")

        /*  indicate measurement  */
        this.measuring = true

        /*  the measurement intervals  */
        let measurementDuration = 1000

        /*  initialize load values and provide function for accounting subsequent values  */
        this.loads = {}
        Object.keys(this.config).forEach((slot) => {
            this.loads[slot] = []
        })
        const account = (slot, duration, load) => {
            this.loads[slot].push(load)
            if (this.loads[slot].length > Math.round(duration / measurementDuration))
                this.loads[slot].shift()
        }

        /*  continuously perform measurements  */
        const handler = async () => {
            if (!this.measuring)
                return

            /*  perform a single measurement over the measurement duration  */
            let load = await this.measure(measurementDuration)

            /*  account the measured load for different average slots  */
            Object.keys(this.config).forEach((slot) => {
                account(slot, this.config[slot] * 1000, load)
            })

            this.timer = setTimeout(handler, 0)
        }
        this.timer = setTimeout(handler, 0)
    }

    /*  stop continuous measurement  */
    stop () {
        /*  sanity check usage context  */
        if (!this.measuring)
            throw new Error("continuous measurement not started (start first)")

        /*  indicate that the measuring should stop  */
        this.measuring = false
    }

    /*  retrieve averaged system load values  */
    average () {
        /*  sanity check usage context  */
        if (!this.measuring)
            throw new Error("continuous measurement not started (start first)")

        /*  calculate a single average load value  */
        const calcAverage = (slot) => {
            if (this.loads[slot].length === 0)
                return 0.0
            let load = this.loads[slot].reduce((sum, val) =>
                sum + val, 0) / this.loads[slot].length
            load = Math.trunc(load * 10) / 10
            return load
        }

        /*  provide the averaged load values  */
        let result = {}
        Object.keys(this.config).forEach((slot) => {
            result[slot] = calcAverage(slot)
        })
        return result
    }
}

