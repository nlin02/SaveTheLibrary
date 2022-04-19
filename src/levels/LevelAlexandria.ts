import Phaser from 'phaser'
import Game from '../levels/Game'

export default class LevelAlexandria extends Game {

    constructor() {

        let tilemapKey = "LevelAlexandria"
        let tilemapJSONFileLocation = "assets/Level1.json"
    
        super(tilemapKey, tilemapJSONFileLocation)
    }
}
