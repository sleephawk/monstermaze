import Phaser from "phaser";

const gameState = {};

function preload() {
  this.load.image("man-left", "Assets/man-left.png");
  this.load.image("man-right", "Assets/man-right.png");
}

function create() {
  const sceneW = 4000;
  const sceneH = 4000;

  // World bounds
  this.physics.world.setBounds(0, 0, sceneW, sceneH);

  // man in middle
  gameState.man = this.physics.add.sprite(sceneW / 2, sceneH / 2, "man-right");
  gameState.man.setScale(0.5);
  gameState.man.setCollideWorldBounds(true);

  gameState.walls = [];

  // Generate static walls
  for (let i = 0; i < 200; i++) {
    // Random position
    let x = Math.random() * sceneW;
    let y = Math.random() * sceneH;

    // Random size (you can tweak for maze feel)
    let w = Phaser.Math.Between(100, 200);
    let h = Phaser.Math.Between(100, 600);

    // Create wall as physics-enabled rectangle
    const wall = this.add.rectangle(x, y, w, h, 0xffbf00);
    this.physics.add.existing(wall, true); // true = static body

    gameState.walls.push(wall);
    this.physics.add.collider(gameState.man, wall);
  }

  gameState.cursors = this.input.keyboard.createCursorKeys();

  this.cameras.main.startFollow(gameState.man, true, 0.1, 0.1);
  this.cameras.main.setBounds(0, 0, sceneW, sceneH);
}

function update() {
  const btns = gameState.cursors;
  const man = gameState.man;

  man.setVelocity(0);

  if (btns.left.isDown) {
    man.setTexture("man-left");
    man.setVelocityX(-200);
  } else if (btns.right.isDown) {
    man.setTexture("man-right");
    man.setVelocityX(200);
  }

  if (btns.up.isDown) {
    man.setVelocityY(-200);
  } else if (btns.down.isDown) {
    man.setVelocityY(200);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 720,
  backgroundColor: 0x1c1c1c,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: { preload, create, update },
};

const game = new Phaser.Game(config);
