import Phaser from 'phaser'
import Game from './Game'

export default class LevelAlexandria extends Game {

    constructor() {
        let tilemapKey = "LevelAlexandria"
        let tilemapJSONFileLocation = "assets/tilemaps/AlexandriaMap.json"
        let levelTime = 800
    
        super(tilemapKey, tilemapJSONFileLocation, levelTime)
    }
}
