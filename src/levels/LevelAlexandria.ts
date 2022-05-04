import Phaser from 'phaser'
import Game from './Game'

export default class LevelAlexandria extends Game {

    constructor() {
        let tilemapKey = "LevelAlexandria"
        let tilemapJSONFileLocation = "assets/tilemaps/NewAlexandriaMap.json"
        let levelTime = 800
        let musicKey = 'egyptmusic'

        let foregroundImageKey = 'sphinx'
        let midgroundImageKey = 'pyramids'
        let backgroundImageKey = 'orangeblue'
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime, musicKey, foregroundImageKey, midgroundImageKey,backgroundImageKey)
    }
}
