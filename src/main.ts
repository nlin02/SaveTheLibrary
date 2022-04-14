import Phaser from 'phaser'

import Game from './scenes/Game'
import Game2 from './scenes/Game2'
import UI from './scenes/Header'
import GameOver from './screens/GameOverScreen'
import TitleScene from './screens/HomeScreen'
import Win from './screens/WinScreen'

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
	scene: [TitleScene, Game, Game2, UI, GameOver, Win]
}

export default new Phaser.Game(config)
