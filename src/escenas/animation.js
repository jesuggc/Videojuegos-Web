import Witch from '../objetos/witch.js';
import Wolf from '../objetos/wolf.js';
import Knight from '../objetos/knight.js';
import FireFlower from '../objetos/fireFlower.js';
import LightningFlower from '../objetos/lightningFlower.js';
import IceFlower from '../objetos/iceFlower.js';
import PoisonFlower from '../objetos/poisonFlower.js';

export default class Animation extends Phaser.Scene {
	constructor() {
		super({ key: 'animation' });
	}


	create() {
		const config = {
            mute: false,
            volume: 0.15,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
			//pauseOnBlur : false,
            delay: 0,
          }; 
          
        this.soundForest = this.sound.add("forestSoundtrack", config);
		this.soundForest.play()

		this.map = this.make.tilemap({
			key: 'tilemap',
			tileWidth: 16,
			tileHeight: 16,
			width: 64,
			height: 32
		});



		const ts1 = this.map.addTilesetImage('ground', 		'patronGround');
		const ts2 = this.map.addTilesetImage('trees', 		'patronTrees'); 
		const ts3 = this.map.addTilesetImage('witchHouse', 	'patronHouse'); 
		const ts4 = this.map.addTilesetImage('cliff', 		'patronCliff'); 
		const ts5 = this.map.addTilesetImage('rocks', 		'patronRocks'); 
		const ts6 = this.map.addTilesetImage('graves', 		'patronGraves'); 
		const ts7 = this.map.addTilesetImage('decoration', 	'patronDecoration');
		const ts8 = this.map.addTilesetImage('water', 		'patronWater'); 
		const ts9 = this.map.addTilesetImage('square', 		'patronSquare'); 
		const ts10 = this.map.addTilesetImage('bridge', 	'patronBridge');

		this.suelo = this.map.createLayer('Suelo',  		[ ts1,ts4, ts8, ts9, ts10]);
		this.suelo2 = this.map.createLayer('Suelo2',  		[ ts1,ts2,ts3,ts4,ts5,ts6,ts7, ts8, ts9, ts10 ]);
		this.colisiones = this.map.createLayer('Colliders',	[ ts1,ts2,ts3,ts4,ts5,ts6,ts7, ts8, ts9, ts10 ]).setCollisionByExclusion(-1);
		this.arboles = this.map.createLayer('Arboles 1',	[ ts2,ts7, ts9, ts10]).setDepth(2);
		this.arboles2 = this.map.createLayer('Arboles 2', 	[ ts2,ts7, ts9,ts10]).setDepth(2);
		this.arboles3 = this.map.createLayer('Arboles 3', 	[ ts2,ts7, ts9,ts10]).setDepth(2);

		this.spawnDist = 260;
		this.nnprob = 1;
		this.poolSize = 55; 
		this.enemiesSize = 0; 
		this.initialEnemies = 9;
		this.enemiesJump = 3;
		this.spawn = false;
		
		this.witch = new Witch(this,532, 3195);		
		this.fireflower = new FireFlower(this,390,355,'fireFlower');
		this.lightningflower = new LightningFlower(this, 4549, 392, 'lightningFlower');
		this.iceflower = new IceFlower(this, 344, 1427, 'iceFlower');
		this.poisonflower = new PoisonFlower(this, 4280, 1843, 'poisonFlower');
		
		
		this.enemyPool = this.add.group();
		for (var i = 0; i < this.poolSize; i++) {
			this.enemyPool.add(new Wolf(this, 0, 0));
			this.enemyPool.add(new Knight(this, 0, 0));
		}
		this.updatePoolSize(this.initialEnemies);
		
		this.physics.add.collider(this.witch, this.colisiones);
		this.physics.add.collider(this.enemyPool, this.witch, function(enemy, witch) { enemy.attack(); }, null, this);
		this.physics.add.collider(this.enemyPool, this.colisiones);
		this.physics.add.collider(this.enemyPool,this.enemyPool);
		this.physics.add.collider(this.fireflower, this.witch, this.fireflower.recogerFlor, null, this.fireflower);
		this.physics.add.collider(this.lightningflower, this.witch, this.lightningflower.recogerFlor, null, this.lightningflower);
		this.physics.add.collider(this.iceflower, this.witch, this.iceflower.recogerFlor, null, this.iceflower);
		this.physics.add.collider(this.poisonflower, this.witch, this.poisonflower.recogerFlor, null, this.poisonflower);
	
		
		if(Math.random() < this.nnprob) {
			this.noname1 = this.add.image(2680, 250, 'noname').setScale(0.3);
			this.noname3 = this.add.image(2680, 270, 'noname').setScale(0.3);
			this.noname4 = this.add.image(2680, 290, 'noname').setScale(0.3);
			this.noname5 = this.add.image(2680, 310, 'noname').setScale(0.3);
			this.noname2= this.add.image(2700, 270, 'noname2').setScale(0.3);
		}

		// TEXTO DE NIVEL
		this.levelText = this.add.text(160, 115, 'Level: ',{fontFamily: 'titulo'}).setResolution(100).setStroke(0x000000,2).setScrollFactor(0).setDepth(3);

		// BARRA DE EXP
		this.expbar = this.add.rectangle(320,80,350,10,0x0000ff).setScrollFactor(0).setDepth(2);

		// CASTLE DOOR
		this.castleDoor = this.add.rectangle( 1850, 750,20,30,0x000000).setDepth(1).setVisible(false);
		this.physics.add.existing(this.castleDoor)
		this.physics.add.overlap(this.witch, this.castleDoor, this.castleScene,null,this)
		
		// BARRA DE VIDA
		this.lifebar = this.add.rectangle(320,100,350,15,0xff0000).setScrollFactor(0).setDepth(3);
		this.lifebarS = this.add.rectangle(328,100,366,15,0x000000).setScrollFactor(0).setDepth(2);

		// BOTON DE PAUSA
		var button = this.add.image(500,280,'pause_button1').setInteractive().setScrollFactor(0).setScale(0.4).setDepth(3);
		button.on('pointerup', () => { 
			var button2 = this.add.image(500,280,'pause_button').setInteractive().setScrollFactor(0).setScale(0.4).setDepth(3);
			this.time.addEvent({delay: 100, callback: function(){
				button.setVisible(false);
				button2.setVisible(true);	
				button.setVisible(true);
				button2.setVisible(false);	
			}, callbackScope: this});
			this.pauseScene();
		 })
		
		// CAMARA 
		this.cameras.main.roundPixels = true;
		this.cameras.main.zoom = 1.75;
		this.cameras.main.startFollow(this.witch);

		this.events.on('resume', ( sys, skill) =>{ if (skill) this.witch[skill.skillSelected]() })	
	}

	update(time,delta){
		if(this.witch.health <= 0) this.gameOverScene();
		this.spawn = this.enemiesSize !== 0;
	}

	generateRandomY(){
		let leftL = this.witch.y - this.spawnDist;
		let rightL = this.witch.y + this.spawnDist;
		return Math.random()*(rightL - leftL) + leftL;
	}

	generateRandomX(y){
		let h = this.witch.x;
		let k = this.witch.y;
		let b = -2 * this.witch.x;
		let c = h**2 + y**2 + k**2 - this.spawnDist**2 - 2 * y * k;
		let x = (-b+ Math.sqrt(b**2-4*c))/2;	
		let x1 = (-b- (Math.sqrt(b**2-4*c)))/2;
		if (Math.random()>0.5) return x;
		else return x1;
	}

	levelUp(){
		this.levelUpScene();
		this.updatePoolSize(this.enemiesJump);
	}

	updatePoolSize(nSize){
		this.enemiesSize+= nSize;
		for (let i = 0; i < nSize; i++) this.enemyPool.getFirstDead().respawn();
	}

	levelUpEnemies(){
		this.enemyPool.children.entries.forEach(enemigo=>enemigo.levelUp())
	}
	
	levelUpScene(){
		this.scene.pause();
		this.scene.launch('levelUp', {witch: this.witch, backScene: 'animation'});
	}
	
	gameOverScene(){
		this.scene.pause();
		this.scene.launch('gameover');
	}

	pauseScene(){
		this.scene.pause();
		this.scene.launch('pause', {witch: this.witch, backScene: 'animation', music : this.soundForest})
	}

	castleScene(){
		this.scene.stop();
		this.soundForest.stop()
		this.scene.launch('castle', {witch: this.witch});
	}

	getRandomAlive() {
		const aliveMembers = this.enemyPool.getChildren().filter((child) => child.active && child.visible);
		if (aliveMembers.length === 0) {
		  return null;
		}
		const randomIndex = Phaser.Math.Between(0, aliveMembers.length - 1);
		return aliveMembers[randomIndex];
	}
	  
	
}
