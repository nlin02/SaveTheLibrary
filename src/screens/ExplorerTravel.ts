import TimeTravelScreen from './TimeTravelScreen'

export default class ExplorerTravel extends TimeTravelScreen {

    constructor() {
        let sceneKey = 'solo-travel'
        let hasProfessor = false
        let nextScene = "LevelTomb"
        let previousSound = 'housemusic'
    
        super(sceneKey, hasProfessor, nextScene, previousSound)
    }
}