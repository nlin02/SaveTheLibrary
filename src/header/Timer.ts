import {makeAutoObservable} from 'mobx'

class TimerState { 
    sharedText = 100/0   // divide by zero to stop timer

    constructor() {
        makeAutoObservable(this)
    }

}

export const timer = new TimerState()