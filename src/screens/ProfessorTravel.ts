import TimeTravelScreen from './TimeTravelScreen'

export default class ProfessorTravel extends TimeTravelScreen {

    constructor() {
        let sceneKey = 'prof-travel'
        let hasProfessor = true
        let nextScene = 'win'
        let previousSound = 'housemusic'
    
        super(sceneKey, hasProfessor, nextScene, previousSound)
    }
}