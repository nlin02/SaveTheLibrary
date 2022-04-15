import {makeAutoObservable} from 'mobx'

class TimerState { 
    remainingTime = 100  // divide by zero to stop timer

    constructor() {
        makeAutoObservable(this)
    }

}

export const timer = new TimerState()