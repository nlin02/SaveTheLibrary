import Game from './Game'

export default class LevelAlexandria extends Game {

    constructor() {
        let tilemapKey = "LevelAlexandria"
        let tilemapJSONFileLocation = "assets/TileMaps/AlexandriaMap.json"
        let levelTime = 900
        let musicKey = 'egyptmusic'

        let foregroundImageKey = 'sphinx'
        let midgroundImageKey = 'pyramids'
        let backgroundImageKey = 'orangeblue'
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime, musicKey, foregroundImageKey, midgroundImageKey,backgroundImageKey)
    }
}