
// 22https://opengameart.org/content/running-unicorn-0
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#111100',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 900 }

        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


const UNICORN_SPEED = 350
UNICORN_COST = 3
const GROUND_LEVEL = 580
const GROUND_DEPTH = 20



var game = new Phaser.Game(config);

var score = 0
var scoreText;

var mainCamera

const DIAMOND_STAGE = 0
const BANK_STAGE = 1
const HOUSE_STAGE = 2
var stage = 0


function preload() {
    this.load.image('space', 'assets/space3.png');
    this.load.image('diamond', 'assets/diamond.png');
    this.load.image('grass', 'assets/grass.png');    
    this.load.image('bank', 'assets/bank.png');
    this.load.image('house', 'assets/house.png');    
    this.load.image('red', 'assets/red.png');
    this.load.image('sky', 'assets/sky.png');
    this.load.spritesheet('unicorn', 'assets/unicorn.png', { frameWidth: 17, frameHeight: 16 });
}



function minimumStage(minStage) {
    if (stage < minStage) {
        switch(minStage) {      
            case DIAMOND_STAGE:
                break;
            case BANK_STAGE:
                panCameraTo(630, GROUND_LEVEL / 2)
                break;
            case HOUSE_STAGE:
                panCameraTo(800, GROUND_LEVEL / 2 - 100)
                break;
        }
        stage = minStage
    }
}


function panCameraTo(newX, newY) {
    mainCamera.pan(newX, newY, 2500, 'Linear', false, function (camera, progress, dx, dy) {
        base = (GROUND_LEVEL + GROUND_DEPTH)
        my = base / 2 - ((base / 2 - newY) * progress)
        camera.setZoom(((base / 2)) / (base - my))
    });
}

function create() {
    mainCamera = this.cameras.main

    var sky = this.add.image(400, 300, 'sky').setScale(10);
    //sky.setInteractive();

    var particles = this.add.particles('red');

    var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 2, end: 0 },
        blendMode: 'ADD'
    });
    var cam = this.cameras.main


    ground = this.physics.add.staticGroup();

    groundShards = this.physics.add.group();
    flyingShards = this.physics.add.group();


    diamond = this.physics.add.image(400, -200, 'diamond');
    diamond.setSize(4, 4, true);
    diamond.setScale(.5)
    diamond.setInteractive()
    emitter.startFollow(diamond);
    diamond.on('pointerdown', function (pointer, targets) {
        var shard = flyingShards.create(400, 500, 'diamond');
        shard.setBounce(0);
        //shard.setCollideWorldBounds(true);
        shard.setBlendMode(Phaser.BlendModes.ADD);
        shard.setAlpha(0.5);
        shard.setScale(.05)
        shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
        shard.setInteractive()       
        minimumStage(BANK_STAGE)

        shard.on('pointerdown', function (pointer, targets) {
            if (groundShards.contains(shard)) {
                groundShards.remove(shard)
                flyingShards.add(shard)
                shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900))
            }
        })
    });


    bank = this.physics.add.image(915, 520, 'bank');
    bank.setSize(bank.width - 200, bank.height - 200, true);
    bank.setScale(.25)
    bank.setImmovable(true);
    bank.body.allowGravity = false;

    house = this.physics.add.image(1200, 520, 'house');
    house.setSize(house.width - 200, house.height - 200, true);
    house.setScale(.35)
    house.setImmovable(true);
    house.body.allowGravity = false;



    unicorns = this.physics.add.group();
    returningUnicorns = this.physics.add.group();


    //
    // setup collisions
    //
    this.physics.add.collider(flyingShards, ground, function (shard, platform) {
        flyingShards.remove(shard)
        groundShards.add(shard)
        shard.setVelocity(0, 0)
    });
    this.physics.add.collider(bank, flyingShards, function (bank, shard) {
        shard.disableBody(true, true);
        updateScore(1)
    });
    this.physics.add.collider(groundShards, ground);
    this.physics.add.collider(diamond, ground);
    this.physics.add.collider(unicorns, ground);
    this.physics.add.collider(returningUnicorns, ground);
    this.physics.add.collider(unicorns, groundShards, function (unicorn, shard) {
        shard.setVelocity(0, 0)
        flyingShards.add(shard)
        groundShards.remove(shard)
        shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
        unicorns.remove(unicorn)
        returningUnicorns.add(unicorn)
        unicorn.setVelocityX(UNICORN_SPEED)
        unicorn.setFlipX(!unicorn.flipX)
    });



    grass = this.add.tileSprite(-2048, GROUND_LEVEL, 4096, GROUND_DEPTH, "grass");
    //ground.setScale(1.5)
    //let ground = this.add.rectangle(-2048, GROUND_LEVEL, 4096, GROUND_DEPTH, 0xffffff);
    grass.setOrigin(0, 0); // i dont understand this
    ground.add(grass)



    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('unicorn', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });



    var scoreIcon = this.add.image(900, 30, 'diamond');
    scoreIcon.setBlendMode(Phaser.BlendModes.ADD);
    scoreIcon.setAlpha(0.5);
    scoreIcon.setScale(.1)
    scoreText = this.add.text(930, 8, '0', { fontSize: '48px', fill: '#000' });
    scoreText.setText("0")

    //unicornButton = this.physics.add.sprite(900, 50, 'unicorn');
    unicornButton = this.add.sprite(900, 100, 'unicorn');
    //unicornButton = this.add.sprite(100, 70, 'unicorn');
    //unicornButton.frame = 0
    unicornButton.setScale(3)
    unicornButton.setFlipX(true);
    unicornButton.setInteractive()
    unicornButton.visible = false
    costText = this.add.text(930, 100, UNICORN_COST, { fontSize: '24px', fill: '#000' });
    costText.visible = false
    costIcon = this.add.image(975, 110, 'diamond');
    costIcon.setBlendMode(Phaser.BlendModes.ADD);
    costIcon.setAlpha(0.5);
    costIcon.setScale(.05)
    costIcon.visible = false




    phys = this.physics
    unis = unicorns
    unicornButton.on('pointerdown', function (pointer, targets) {
        if (score >= UNICORN_COST) {
            updateScore(-UNICORN_COST)

            unicorn = phys.add.sprite(1100, 450, 'unicorn');
            unis.add(unicorn)

            //var unicorn = unicorns.create(400, 450, 'unicorn');

            unicorn.setBounce(0);
            unicorn.setScale(4)
            unicorn.setFlipX(true);
            unicorn.setVelocity(-350, 0)
            unicorn.anims.play('right', true);

            UNICORN_COST += 3
            costText.setText(UNICORN_COST)

        }
    });

}

function updateScore(delta) {
    score += delta
    if (score >= UNICORN_COST) {
        minimumStage(HOUSE_STAGE)
        unicornButton.visible = true
        costText.visible = true
        costIcon.visible = true
    }
    scoreText.setText(score);
}

function update() {

    unicorns.children.iterate(function (uni) {
        // make the unicorn turn around if it is off the world boundaries
        if (typeof uni !== 'undefined' && uni.x < 0) {
            unicorns.remove(uni)
            returningUnicorns.add(uni)
            uni.body.setVelocityX(UNICORN_SPEED)
            uni.setFlipX(false)
        }
    });
    returningUnicorns.children.iterate(function (uni) {
        // make the unicorn turn around if it is off the world boundaries
        if (typeof uni !== 'undefined' && uni.x > 1200) {
            returningUnicorns.remove(uni)
            unicorns.add(uni)
            uni.body.setVelocityX(-UNICORN_SPEED)
            uni.setFlipX(true)
        }
    });

}



