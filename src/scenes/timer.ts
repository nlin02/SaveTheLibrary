import {makeAutoObservable} from 'mobx'

class TimerState { 
    sharedText = 100

    constructor() {
        makeAutoObservable(this)
    }

}

export const timer = new TimerState()