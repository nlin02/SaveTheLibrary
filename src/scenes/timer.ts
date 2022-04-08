import {makeAutoObservable} from 'mobx'

class TimerState { 
    sharedText = 0

    constructor() {
        makeAutoObservable(this)
    }

}

export const timer = new TimerState()