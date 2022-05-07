import Game from './Game'

export default class LevelTomb extends Game {
    
    constructor() {
        let tilemapKey = "LevelTomb"
        let tilemapJSONFileLocation = "assets/tilemaps/TombMap.json"
        let levelTime = 800
        let musicKey = 'tombmusic'
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime, musicKey)
    }
}