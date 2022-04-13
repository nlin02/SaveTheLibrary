const now = performance?.now?.bind(performance)
    ?? Date.now?.bind(Date)
    ?? (() => new Date().getTime())

/**
 * Provides consistent physics system behavior across varying framerates.
 */
export default class PhysicsTimer {
    timePerStep: number
    maxTimePerUpdate: number
    timeUntilNextStep: number
    stabilizationFactor: number
    private lastUpdateTime?: number

    step: () => void

    /**
     * @param step A function that will advance the physics system by one step when called.
     * @param timePerStep Desired milliseconds per physics system step. (Default: 1/60 sec)
     * @param maxTimePerUpdate Upper bound (in millis) on the time by which one call to update()
     *      will advance the physics system. This prevents exceptionally large values of dt from
     *      causing large physics jumps. If the game framerate drops below 1000/maxTimePerUpdate,
     *      motion will slow down instead of becoming any more jumpy. (Default: 100ms)
     * @param stabilizationFactor [0...1] When the actual time between calls to update is very close
     *      to but not exactly equal to timePerStep (or a multiple thereof), there will be sporadic
     *      changes in the frame rate, which may be bothersome for the player. The stabilization
     *      factor makes timeUntilNextStep tend slightly toward the 50% mark, which allows the game
     *      to speed up or slow down very slightly so as to have a stable physics update rate. A
     *      value of 0 applies no stabilization, trying to make the average update rate match
     *      timePerStep as closely as possible. A value of 1 forces a consistent number of steps per
     *      call to update() given a constant dt, no matter how much this alters the speed of the
     *      game. (Default: 0.1, which lets physics get about 3% slower in order to avoid glitches)
     */ 
    constructor(
        step: () => void,
        {
            timePerStep = 1000 / 60,
            maxTimePerUpdate = 100,
            stabilizationFactor = 0.1,
        } = {}
    ) {
        this.step = step
        this.timePerStep = timePerStep
        this.maxTimePerUpdate = maxTimePerUpdate
        this.stabilizationFactor = stabilizationFactor

        this.timeUntilNextStep = this.timePerStep / 2
    }

    /**
     * Advances the physics system by the given time in milliseconds. Call this from your game's
     * update function.
     * 
     * @param dt The elapsed time in milliseconds since the previous call to update(). If you or
     *      your game engine are not already computing dt, omit this parameter and PhysicsTimer will
     *      compute the actual time elapsed since the previous call to update().
     * @returns The number of physics steps taken.
     */
    update(dt?: number): number {
        dt = dt ?? this.computeDt()

        this.timeUntilNextStep -= Math.max(0, Math.min(dt, this.maxTimePerUpdate))

        let stepCount = 0
        while (this.timeUntilNextStep <= 0) {
            this.step()
            this.timeUntilNextStep += this.timePerStep
            stepCount++
        }

        this.stabilize()

        return stepCount
    }

    private computeDt(): number {
        const curTime = now()
        const prevTime = this.lastUpdateTime ?? curTime - this.timePerStep
        this.lastUpdateTime = curTime
        return curTime - prevTime
    }

    private stabilize() {
        if (this.stabilizationFactor > 0) {
            const phase = this.timeUntilNextStep / this.timePerStep * 2 - 1
            this.timeUntilNextStep =
                this.timeUntilNextStep * (1 - this.stabilizationFactor)
                + (this.timePerStep / 2) * this.stabilizationFactor
        }
    }
}

