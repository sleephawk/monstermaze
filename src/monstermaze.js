import Phaser from "phaser";

const gameState = {
  level: 1,
};

function preload() {
  this.load.image("man-left", "Assets/man-left.png");
  this.load.image("man-right", "Assets/man-right.png");
  this.load.image("monster", "Assets/monster.png");
  this.load.image("disc", "Assets/disc.png");
  this.load.audio("bgm", "Assets/music/darkwoods.wav");
}

function create() {
  const sceneW = 4000;
  const sceneH = 4000;

  this.physics.world.setBounds(0, 0, sceneW, sceneH);

  // Play background music
  if (!gameState.music) {
    gameState.music = this.sound.add("bgm", { volume: 0.5, loop: true });
    gameState.music.play();
  }

  // Walls
  gameState.walls = [];
  for (let i = 0; i < 200; i++) {
    let x = Math.random() * sceneW;
    let y = Math.random() * sceneH;
    let w = 100;
    let h = Phaser.Math.Between(100, 600);

    const wall = this.add.rectangle(x, y, w, h, 0xffbf00);
    this.physics.add.existing(wall, true);
    gameState.walls.push(wall);
  }

  // Helper: safe spawn positions
  function getSafeSpawn(scene, w = 50, h = 50) {
    let tries = 0;
    while (tries < 1000) {
      const x = Phaser.Math.Between(50, sceneW - 50);
      const y = Phaser.Math.Between(50, sceneH - 50);
      let overlap = false;

      for (let wall of gameState.walls) {
        const wx = wall.x,
          wy = wall.y;
        const ww = wall.width,
          wh = wall.height;
        if (
          x < wx + ww / 2 + w / 2 &&
          x > wx - ww / 2 - w / 2 &&
          y < wy + wh / 2 + h / 2 &&
          y > wy - wh / 2 - h / 2
        ) {
          overlap = true;
          break;
        }
      }
      if (!overlap) return { x, y };
      tries++;
    }
    return { x: sceneW / 2, y: sceneH / 2 };
  }

  // Player
  const manPos = getSafeSpawn(this, 32, 32);
  gameState.man = this.physics.add.sprite(manPos.x, manPos.y, "man-right");
  gameState.man.setCollideWorldBounds(true);
  gameState.man.setScale(0.5);

  // Player vs walls collision
  gameState.walls.forEach((wall) => {
    this.physics.add.collider(gameState.man, wall);
  });

  // Monsters
  gameState.monsters = this.physics.add.group();
  for (let i = 0; i < 20; i++) {
    const monsterPos = getSafeSpawn(this, 32, 32);
    const monster = gameState.monsters.create(
      monsterPos.x,
      monsterPos.y,
      "monster"
    );

    monster.setCollideWorldBounds(true);
    monster.setBounce(1);
    monster.setVelocity(
      Phaser.Math.Between(-100, 100),
      Phaser.Math.Between(-100, 100)
    );

    // Scale increases by 0.5 each level
    monster.setScale(0.5 + (gameState.level - 1) * 0.5);
  }

  // Monsters collide with walls
  gameState.walls.forEach((wall) => {
    gameState.monsters.children.each((monster) => {
      this.physics.add.collider(monster, wall);
    });
  });

  // Monsters collide with each other
  this.physics.add.collider(gameState.monsters, gameState.monsters);

  // Restart scene on collision with monster (increments level)
  this.physics.add.collider(gameState.man, gameState.monsters, () => {
    gameState.level += 1;
    this.scene.restart();
  });

  // Disc collectible
  const discPos = getSafeSpawn(this, 32, 32);
  gameState.disc = this.physics.add.sprite(discPos.x, discPos.y, "disc");
  gameState.disc.setScale(0.5);

  this.physics.add.overlap(gameState.man, gameState.disc, () => {
    // Random colors
    const color1 = Phaser.Display.Color.RandomRGB().color;
    const color2 = Phaser.Display.Color.RandomRGB().color;

    // Apply colors
    gameState.walls.forEach((wall) => {
      wall.fillColor = color1;
    });
    this.cameras.main.setBackgroundColor(color2);

    // Move disc to new safe position
    const newPos = getSafeSpawn(this, 32, 32);
    gameState.disc.setPosition(newPos.x, newPos.y);
  });

  // Input
  gameState.cursors = this.input.keyboard.createCursorKeys();

  // Camera
  this.cameras.main.startFollow(gameState.man, true, 0.1, 0.1);
  this.cameras.main.setBounds(0, 0, sceneW, sceneH);

  // 🔘 Reset button (y = 50)
  const resetButton = this.add
    .text(20, 50, "RESET", {
      font: "24px Arial",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    })
    .setScrollFactor(0)
    .setInteractive();

  resetButton.on("pointerdown", () => {
    this.scene.restart(); // level does NOT increment here
  });

  // Level display (y = 50)
  gameState.levelText = this.add
    .text(150, 50, `Level: ${gameState.level}`, {
      font: "24px Arial",
      fill: "#ffffff",
    })
    .setScrollFactor(0);
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

  // Update level display
  if (gameState.levelText) {
    gameState.levelText.setText(`Level: ${gameState.level}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 720,
  backgroundColor: 0x1c1c1c,
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scene: { preload, create, update },
};

const game = new Phaser.Game(config);
