
var config = { //objeto config, determina las propiedades del juego
    type : Phaser.AUTO, //indica que usar para mostar el juego (CANVAS, WebGL, AUTO)
    width : 800,        //anchura en la que se muestra el juego
    height : 600,       //altura en la que se muestra el juego
    scene : {
        preload : preload,
        create : create,
        update : update
    },
    physics : {
        default : 'arcade', //tipo de fisica
        arcade : {
            gravity : {y : 300}, //gravedad
            debug : true
        }
    }
};

//variables globales
let game = new Phaser.Game(config); 
let score = 0;
let scoreImages;
let bounceActive = false;
let totalCoins = 5; 
let collectedCoins = 0;
let keyVisible = false;
let lastDirection = 'right'; //estado inicial de la dirección

function displayScore(x, y, score) {
    //elimina los dígitos anteriores
    scoreImages.clear(true, true);

    const scoreString = score.toString();
    const digits = scoreString.split('');

    digits.forEach((digit, index) => {
        const scoreImage = this.add.image(x + index * 18, y, digit);
        scoreImages.add(scoreImage);
    });
}


function preload (){  
    
    let url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js'
    const scoreNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    scoreNumbers.forEach((num, index) => {
        this.load.image(num, `assets/items/score/score0${index}.png`);
    });

    this.load.image('background', 'assets/background/background01.png');
    this.load.image('platform01', 'assets/background/platform01.png');
    this.load.image('platform02', 'assets/background/platform02.png');
    this.load.image('platform03', 'assets/background/platform03.png');
    this.load.image('platform03_2', 'assets/background/platform03_2.png');
    this.load.image('platform04', 'assets/background/platform04.png');
    this.load.image('cloud', 'assets/background/cloud.png');
    this.load.image('mushroom01', 'assets/background/mushroom01.png');
    this.load.image('mushroom02', 'assets/background/mushroom02.png');
    this.load.image('key', 'assets/items/key.png');
    this.load.spritesheet('coins', 'assets/items/coin_sprite.png', {frameWidth : 18, frameHeight : 18});
    this.load.spritesheet('character', 'assets/character/character_Walk.png', {frameWidth : 32, frameHeight : 32});
    this.load.spritesheet('character_reverse', 'assets/character/character_Walk_reverse.png', {frameWidth : 32, frameHeight : 32});
    this.load.spritesheet('character_idle', 'assets/character/character_idle.png', {frameWidth : 32, frameHeight : 32});
    this.load.spritesheet('character_idle_reverse', 'assets/character/character_idle_reverse.png', {frameWidth : 32, frameHeight : 32});
    this.load.spritesheet('character_jump', 'assets/character/character_Jump.png', {frameWidth : 32, frameHeight : 32});
    this.load.spritesheet('character_jump_reverse', 'assets/character/character_jump_reverse.png', {frameWidth : 32, frameHeight : 32});
    this.load.spritesheet('character_death', 'assets/character/character_Death.png', {frameWidth : 32, frameHeight : 32});
    this.load.spritesheet('enemy', 'assets/enemies/enemy_sprite.png', {frameWidth : 24, frameHeight : 24});
    this.load.audio('music', ['assets/audio/powerUp.mp3']);
    this.load.plugin('rexvirtualjoystickplugin', url, true);

}

function create () {

    //background
    this.add.image(400, 300, 'background'); //añade la imagen al canvas en la posición x:400, y:300 
    
    //platform
    platforms = this.physics.add.staticGroup(); //crea un grupo de plataformas estaticas
    platforms.create(102, 479, 'platform03').setScale(0.9).refreshBody().setVisible(false); //crea una plataforma en la posición x:400, y:568, escala:1, y la refresca
    platforms.create(481, 479, 'platform03_2').setScale(0.9).refreshBody().setVisible(false);
    platforms.create(319, 515, 'platform01').setScale(0.9).refreshBody().setVisible(false);
    platforms.create(650, 462, 'platform04').setScale(0.9).refreshBody().setVisible(false);
    [ [237, 497], [401, 497] ].forEach(([x, y]) => 
        platforms.create(x, y, 'platform02').setScale(0.9).refreshBody()
    );
    
    //mushrooms
    mushrooms = this.physics.add.staticGroup();
    mushrooms.create(229, 390, 'mushroom01').setScale(0.9).refreshBody().setVisible(false).setName('bounce');
    mushrooms.create(319, 444, 'mushroom02').setScale(0.9).refreshBody().setVisible(false).setName('bounce');

    //cloud
    clouds = this.physics.add.staticGroup();
    [ [120, 340], [445, 317], [337, 353], [530, 282] ].forEach(([x, y]) =>
        clouds.create(x, y, 'cloud').setScale(1).refreshBody()
    );

    //coins
    coins = this.physics.add.staticGroup();
    [ [322, 400], [230, 300], [335, 300], [440, 260], [100, 300] ].forEach(([x, y]) => 
        coins.create(x, y, 'coins').setScale(1).refreshBody()
    );
    
    //key
    key = this.physics.add.staticGroup();
    keySprite = key.create(767, 400, 'key').setScale(1).refreshBody().setVisible(false);

    //player
    player = this.physics.add.sprite(50, 380, 'character_idle'); // usa la animación de idle por defecto y crea un personaje en la ubicación x:400, y:568
    player.setCollideWorldBounds(true); //para que el personaje colisione con el mundo
    player.setBounce(0.2); //para que el personaje rebote en la plataforma
    player.setVelocityX(0);

    //enemigos
    enemy = this.physics.add.sprite(670, 422, 'enemy');
    enemy.setCollideWorldBounds(true);
    moveEnemy(enemy, 90, 580, 700);

    //animaciones
    this.anims.create({
        key : 'left',
        frames : this.anims.generateFrameNumbers('character_reverse', {start : 0, end : 5}),
        frameRate : 10,
        repeat : -1
    });

    this.anims.create({
        key : 'right',
        frames : this.anims.generateFrameNumbers('character', {start : 5, end : 0}),
        frameRate : 10,
        repeat : -1
    });

    this.anims.create({
        key : 'idle',
        frames : this.anims.generateFrameNumbers('character_idle', {start : 0, end : 3}),
        frameRate : 10,
        repeat : -1
    });

    this.anims.create({
        key : 'idle_reverse',
        frames : this.anims.generateFrameNumbers('character_idle_reverse', {start : 3, end : 0}),
        frameRate : 10,
        repeat : -1
    });

    this.anims.create({
        key : 'jump',
        frames : this.anims.generateFrameNumbers('character_jump', {start : 3, end : 5}),
        frameRate : 5,
        repeat : -1
    });

    this.anims.create({
        key : 'jump_reverse',
        frames : this.anims.generateFrameNumbers('character_jump_reverse', {start : 4, end : 2}),
        frameRate : 5,
        repeat : -1
    });

    this.anims.create({
        key : 'death',
        frames : this.anims.generateFrameNumbers('character_death', {start : 0, end : 7}),
        frameRate : 10,
    });

    this.anims.create({
        key : 'enemy',
        frames : this.anims.generateFrameNumbers('enemy', {start : 0, end : 1}),
        frameRate : 10,
        repeat : -1
    });

    this.anims.create({
        key : 'coins',
        frames : this.anims.generateFrameNumbers('coins', {start : 0, end : 1}),
        frameRate : 5,
        repeat : -1
    });

    
    this.physics.add.collider(player, platforms);
    //this.physics.add.collider(player, mushrooms);
    this.physics.add.collider(player, mushrooms, (player, mushroom) => {
        if (player.body.touching.down && mushroom.name === 'bounce') {
            player.setVelocityY(-110);
            bounceActive = true;
        }
    });
    this.physics.add.collider(player, clouds);
    this.physics.add.collider(enemy, platforms);
    this.physics.add.collider(player, enemy, playerHitEnemy, null, this);
    this.physics.add.overlap(player, coins, collectCoin, null, this);
    this.physics.add.overlap(player, key, collectKey, null, this);

    this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
        x: 90,
        y: 535,
        radius: 40,
        base: this.add.circle(0, 0, 40, 0x888888),
        thumb: this.add.circle(0, 0, 10, 0xcccccc),
    });

    this.joystickCursors = this.joyStick.createCursorKeys();
    cursor = this.input.keyboard.createCursorKeys();

    scoreImages = this.add.group();
    displayScore.call(this, 16, 16, score);

    //console.log(this.sound.get('music')); 

    backgroundMusic = this.sound.add('music');
    this.sound.setVolume(0.4);
    if (backgroundMusic) {
        backgroundMusic.setLoop(true);
        backgroundMusic.play();
    } else {
        console.error('No se pudo cargar el archivo de audio');
    }
}

function update() {
    let cursors = this.joystickCursors;

    if (cursor.left.isDown || cursors.left.isDown) {
        player.setVelocityX(-150);
        if (player.body.touching.down) {
            player.anims.play('left', true);
        }
        lastDirection = 'left';
    } 
    else if (cursor.right.isDown || cursors.right.isDown) {
        player.setVelocityX(150);
        if (player.body.touching.down) {
            player.anims.play('right', true);
        }
        lastDirection = 'right';
    } else {
        player.setVelocityX(0);
        if (player.body.touching.down) {
            if (lastDirection === 'left') {
                player.anims.play('idle_reverse', true);
            } else {
                player.anims.play('idle', true);
            }
        }
    }

    if ((cursor.space.isDown || cursors.up.isDown) && (player.body.touching.down || bounceActive === true)) {
        player.setVelocityY(-160);  
        if (lastDirection === 'left') {
            player.anims.play('jump_reverse', true);
        } else {
            player.anims.play('jump', true);
        }
        bounceActive = false; 
    }

    coins.children.iterate(function (coin) {
        coin.anims.play('coins', true);
    });
    
    enemy.anims.play('enemy', true);
    enemy.update();
    
}

//función para detectar colisiones entre el personaje y las monedas
function collectKey(player, key) {
    if (keyVisible) {
        key.disableBody(true, true);
        this.add.text(400, 300, 'You Win!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        player.setVelocity(0, 0);
        this.physics.pause();
    }
}

//función para detectar colisiones entre el personaje y los enemigos
function moveEnemy(enemy, speed, minX, maxX) {
    enemy.setVelocityX(speed);
    // Función para invertir la dirección cuando el enemigo alcanza un límite
    enemy.update = function() {
        //si el enemigo llega al borde izquierdo
        if (enemy.x <= minX) {
            enemy.setVelocityX(speed); //mover a la derecha
            enemy.anims.play('enemy', true);
            enemy.flipX = true;
        }

        //si el enemigo llega al borde derecho
        if (enemy.x >= maxX) {
            enemy.setVelocityX(-speed); //mover a la izquierda
            enemy.anims.play('enemy', true);
            enemy.flipX = false;
        }
    };
}

function collectCoin(player, coin) {
    coin.disableBody(true, true);
    score += 5;
    collectedCoins++;
    displayScore.call(this, 16, 16, score);

    if (collectedCoins === totalCoins && !keyVisible) {
        keySprite.setVisible(true);
        keyVisible = true;
    }
}


function playerHitEnemy(player, enemy) {
    player.anims.play('death', true);
    this.physics.pause();
    
}