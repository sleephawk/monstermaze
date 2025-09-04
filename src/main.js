import Phaser from "phaser";

const gameState = {};

function preload() {
  this.load.image("bird-left", "Assets/bird-left.png");
  this.load.image("bird-right", "Assets/bird-right.png");
}

function create() {
  const sceneW = 4000;
  const sceneH = 4000;

  // World bounds
  this.physics.world.setBounds(0, 0, sceneW, sceneH);

  // Bird in middle
  gameState.bird = this.physics.add.sprite(
    sceneW / 2,
    sceneH / 2,
    "bird-right"
  );
  gameState.bird.setCollideWorldBounds(true);

  gameState.walls = [];

  // Generate drifting, rotating walls
  for (let i = 0; i < 100; i++) {
    let x, y;

    do {
      x = Phaser.Math.Between(50, sceneW - 50);
      y = Phaser.Math.Between(50, sceneH - 50);
    } while (
      x > sceneW / 2 - 200 &&
      x < sceneW / 2 + 200 &&
      y > sceneH / 2 - 200 &&
      y < sceneH / 2 + 200
    );

    const w = Phaser.Math.Between(40, 120);
    const h = Phaser.Math.Between(40, 150);

    // Create wall as physics-enabled rectangle
    const wall = this.add.rectangle(x, y, w, h, 0x2e2e2e);
    this.physics.add.existing(wall);

    // Make body dynamic
    const body = wall.body;
    body.setCollideWorldBounds(true);
    body.setBounce(1); // bounce off world edges
    body.setImmovable(true); // bird bounces off, walls don’t get shoved around

    // Random velocity + rotation speed
    body.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    wall.rotationSpeed = Phaser.Math.FloatBetween(-0.01, 0.01);

    gameState.walls.push(wall);
    this.physics.add.collider(gameState.bird, wall);
  }

  // Door still static, easy to pass through
  gameState.door = this.add.rectangle(
    sceneW - 200,
    sceneH - 200,
    80,
    120,
    0x3a5f5f
  );
  this.physics.add.existing(gameState.door, true);

  gameState.cursors = this.input.keyboard.createCursorKeys();

  this.cameras.main.startFollow(gameState.bird, true, 0.1, 0.1);
  this.cameras.main.setBounds(0, 0, sceneW, sceneH);
}

function update() {
  const btns = gameState.cursors;
  const bird = gameState.bird;

  bird.setVelocity(0);

  if (btns.left.isDown) {
    bird.setTexture("bird-left");
    bird.setVelocityX(-200);
  } else if (btns.right.isDown) {
    bird.setTexture("bird-right");
    bird.setVelocityX(200);
  }

  if (btns.up.isDown) {
    bird.setVelocityY(-200);
  } else if (btns.down.isDown) {
    bird.setVelocityY(200);
  }

  // Rotate each wall slowly
  gameState.walls.forEach((wall) => {
    wall.rotation += wall.rotationSpeed;
  });

  // Check overlap with door
  if (
    Phaser.Geom.Intersects.RectangleToRectangle(
      bird.getBounds(),
      gameState.door.getBounds()
    )
  ) {
    console.log("🎉 You found the door!");
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 800,
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
