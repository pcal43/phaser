
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
const GROUND_LEVEL = 590
const GROUND_DEPTH = 10

var game = new Phaser.Game(config);

var score = 0
var scoreText;

function preload() {
    this.load.image('space', 'assets/space3.png');
    this.load.image('diamond', 'assets/diamond.png');
    this.load.image('bank', 'assets/bank.png');
    this.load.image('red', 'assets/red.png');
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('unicorn', 'assets/unicorn.png', { frameWidth: 17, frameHeight: 16 });
}


function panCameraTo(camera, newX, newY) {
    camera.pan(newX, newY, 2500, 'Linear', true, function (camera, progress, dx, dy) {
        my = GROUND_LEVEL / 2 - ((GROUND_LEVEL / 2 - newY) * progress)
        camera.setZoom(((GROUND_LEVEL / 2)) / (GROUND_LEVEL - my))
    });
}

function create() {
    var sky = this.add.image(400, 300, 'sky').setScale(10);
    //sky.setInteractive();

    var particles = this.add.particles('red');

    var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 2, end: 0 },
        blendMode: 'ADD'
    });
    var cam = this.cameras.main


    platforms = this.physics.add.staticGroup();

    groundShards = this.physics.add.group();
    flyingShards = this.physics.add.group();


    diamond = this.physics.add.image(400, -200, 'diamond');
    diamond.setSize(4, 4, true);
    diamond.setScale(.5)
    diamond.setInteractive()
    emitter.startFollow(diamond);
    var firstShard = true
    diamond.on('pointerdown', function (pointer, targets) {
        var shard = flyingShards.create(400, 500, 'diamond');
        shard.setBounce(0);
        //shard.setCollideWorldBounds(true);
        shard.setBlendMode(Phaser.BlendModes.ADD);
        shard.setAlpha(0.5);
        shard.setScale(.05)
        shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900));
        shard.setInteractive()
        if (firstShard) {
            panCameraTo(cam, 630, GROUND_LEVEL / 2)
            firstShard = false
        }

        //cam.pan(630, , 2000);

        shard.on('pointerdown', function (pointer, targets) {
            if (groundShards.contains(shard)) {
                groundShards.remove(shard)
                flyingShards.add(shard)
                shard.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-500, -900))
            }
        })
        //cam.zoomTo(.75)
    });


    banks = this.physics.add.group();
    //bank = this.physics.add.image(900, 520, 'bank');
    bank = banks.create(915, 520, 'bank');
    //banks.add(bank)            
    bank.setSize(bank.width - 200, bank.height - 200, true);
    bank.setScale(.25)
    bank.setImmovable(true);
    bank.body.allowGravity = false;


    this.physics.add.collider(flyingShards, banks, function (shard, bank) {
        shard.disableBody(true, true);
        updateScore(1)
    });



    unicorns = this.physics.add.group();
    returningUnicorns = this.physics.add.group();


    this.physics.add.collider(flyingShards, platforms, function (shard, platform) {
        flyingShards.remove(shard)
        groundShards.add(shard)
        shard.setVelocity(0, 0)
    });

    this.physics.add.collider(groundShards, platforms);
    this.physics.add.collider(diamond, platforms);
    this.physics.add.collider(unicorns, platforms);
    this.physics.add.collider(returningUnicorns, platforms);
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



    let ground = this.add.rectangle(-2048, GROUND_LEVEL, 4096, GROUND_DEPTH, 0xffffff);
    ground.setOrigin(0, 0);
    platforms.add(ground)



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



    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    //this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function updateScore(delta) {
    score += delta
    if (score >= UNICORN_COST) {
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



