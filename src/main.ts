import Phaser from 'phaser'

import UI from './header/StatusDisplay'
import GameOver from './screens/GameOverScreen'
import TitleScene from './screens/HomeScreen'
import Win from './screens/WinScreen'
import LevelAlexandria from './levels/LevelAlexandria'
import LevelHouse from './levels/LevelHouse'
import LevelDungeon from './levels/LevelDungeon'
import LevelTest from './levels/LevelTest'

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'matter',
		matter: {
			debug: true
		}
	},
	scene: [TitleScene, LevelAlexandria, LevelHouse, LevelDungeon, LevelTest, UI, GameOver, Win]
}

export default new Phaser.Game(config)
