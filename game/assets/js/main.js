const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1400;

let game;
let player = null;
let targetMarker = null;
let targetPos = null;
let monsters = [];

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#1b1b1b",
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

game = new Phaser.Game(config);

function preload() {
  // 지금 버전은 외부 이미지 리소스 없이 도형으로만 구현합니다.
}

function create() {
  const scene = this;

  monsters = [];

  drawWorld(scene);
  createPlayer(scene, 1200, 700);
  createMonsters(scene);

  targetMarker = scene.add
    .circle(0, 0, 10, 0xffef75, 0.6)
    .setVisible(false)
    .setDepth(50);

  scene.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  scene.cameras.main.startFollow(player.container, true, 0.08, 0.08);
  scene.cameras.main.setZoom(1);

  scene.input.on("pointerdown", function (pointer) {
    const worldPoint = pointer.positionToCamera(scene.cameras.main);

    targetPos = {
      x: worldPoint.x,
      y: worldPoint.y
    };

    targetMarker.setPosition(targetPos.x, targetPos.y);
    targetMarker.setScale(0.3);
    targetMarker.setAlpha(0.8);
    targetMarker.setVisible(true);

    scene.tweens.add({
      targets: targetMarker,
      scale: 2.4,
      alpha: 0,
      duration: 260,
      onComplete: function () {
        targetMarker.setVisible(false);
      }
    });
  });

  window.addEventListener("resize", function () {
    if (game && game.scale) {
      game.scale.resize(window.innerWidth, window.innerHeight);
    }
  });
}

function update(time, delta) {
  updatePlayer(delta);
  updateMonsters(time);
  updateMinimap();
  updateUI();
}

/* =========================
   WORLD
========================= */

function drawWorld(scene) {
  const g = scene.add.graphics();

  g.fillStyle(0x4b7a37, 1);
  g.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // 잔디 타일 느낌
  for (let x = 0; x < WORLD_WIDTH; x += 64) {
    for (let y = 0; y < WORLD_HEIGHT; y += 64) {
      const color = Phaser.Math.Between(0, 100) > 50 ? 0x578a41 : 0x436f32;
      g.fillStyle(color, 0.35);
      g.fillRect(x, y, 62, 62);
    }
  }

  // 가로 흙길
  g.fillStyle(0x9b7b4a, 1);
  g.fillRoundedRect(250, 520, 1850, 160, 40);

  // 세로 흙길
  g.fillRoundedRect(1120, 140, 170, 1100, 50);

  // 길 디테일
  for (let i = 0; i < 700; i++) {
    const rx = Phaser.Math.Between(250, 2100);
    const ry = Phaser.Math.Between(520, 680);
    g.fillStyle(0x755532, 0.28);
    g.fillCircle(rx, ry, Phaser.Math.Between(1, 4));
  }

  for (let i = 0; i < 380; i++) {
    const rx = Phaser.Math.Between(1120, 1290);
    const ry = Phaser.Math.Between(140, 1240);
    g.fillStyle(0x755532, 0.28);
    g.fillCircle(rx, ry, Phaser.Math.Between(1, 4));
  }

  drawTrees(scene);
  drawRocks(scene);
  drawFence(scene);
  drawFlowers(scene);
}

function drawTrees(scene) {
  const positions = [
    [170, 330],
    [300, 240],
    [460, 200],
    [2080, 310],
    [2220, 950],
    [2040, 1160],
    [340, 1100],
    [520, 1220],
    [1800, 180],
    [1940, 1080]
  ];

  positions.forEach(function (pos, index) {
    const x = pos[0];
    const y = pos[1];

    const container = scene.add.container(x, y);

    const shadow = scene.add.ellipse(0, 28, 70, 22, 0x000000, 0.2);
    const trunk = scene.add.rectangle(0, 12, 18, 58, 0x70451f);
    const crown1 = scene.add.circle(
      0,
      -30,
      46,
      index % 2 === 0 ? 0x376d2f : 0x2f6228
    );
    const crown2 = scene.add.circle(-26, -8, 30, 0x47843c);
    const crown3 = scene.add.circle(28, -6, 32, 0x3a7331);

    container.add([shadow, trunk, crown1, crown2, crown3]);
  });
}

function drawRocks(scene) {
  const rocks = [
    [930, 1140],
    [1060, 1170],
    [990, 1240],
    [1580, 390],
    [1660, 350],
    [1730, 300],
    [1800, 1020],
    [1450, 1000],
    [120, 820]
  ];

  rocks.forEach(function (pos) {
    const x = pos[0];
    const y = pos[1];

    const container = scene.add.container(x, y);

    const shadow = scene.add.ellipse(0, 12, 46, 16, 0x000000, 0.22);
    const body = scene.add.ellipse(0, 0, 44, 34, 0x8b8b8b);
    const highlight = scene.add.ellipse(-10, -8, 14, 8, 0xb6b6b6, 0.8);

    container.add([shadow, body, highlight]);
  });
}

function drawFence(scene) {
  const g = scene.add.graphics();

  g.lineStyle(6, 0x73512b, 1);

  const posts = [
    [90, 930],
    [130, 880],
    [180, 910],
    [240, 860],
    [290, 900],
    [350, 850]
  ];

  posts.forEach(function (pos) {
    const x = pos[0];
    const y = pos[1];
    g.strokeLineShape(new Phaser.Geom.Line(x, y, x, y + 70));
  });

  g.strokeLineShape(new Phaser.Geom.Line(90, 950, 180, 900));
  g.strokeLineShape(new Phaser.Geom.Line(180, 920, 290, 880));
  g.strokeLineShape(new Phaser.Geom.Line(130, 895, 240, 845));
  g.strokeLineShape(new Phaser.Geom.Line(240, 870, 350, 830));

  // 표지판
  g.strokeLineShape(new Phaser.Geom.Line(390, 830, 390, 910));

  g.lineStyle(10, 0x8a6236, 1);
  g.strokeLineShape(new Phaser.Geom.Line(390, 840, 460, 820));
  g.strokeLineShape(new Phaser.Geom.Line(390, 870, 445, 860));
}

function drawFlowers(scene) {
  const g = scene.add.graphics();

  const colors = [0xffffff, 0xffe24f, 0xd48cff];

  for (let i = 0; i < 160; i++) {
    const x = Phaser.Math.Between(60, WORLD_WIDTH - 60);
    const y = Phaser.Math.Between(60, WORLD_HEIGHT - 60);
    const color = colors[Phaser.Math.Between(0, colors.length - 1)];

    g.fillStyle(color, 0.85);
    g.fillCircle(x, y, 2);
    g.fillCircle(x + 3, y + 2, 2);
    g.fillCircle(x - 2, y + 2, 2);
  }
}

/* =========================
   PLAYER
========================= */

function createPlayer(scene, x, y) {
  const container = scene.add.container(x, y).setDepth(20);

  const shadow = scene.add.ellipse(0, 30, 36, 16, 0x000000, 0.28);

  const sword = scene.add.rectangle(-18, 14, 4, 34, 0xd0d7df);
  sword.setRotation(0.9);

  const legs = scene.add.rectangle(0, 18, 16, 26, 0x3b2b1d);
  const body = scene.add.rectangle(0, -2, 26, 34, 0x6b4b2c);
  const armor = scene.add.rectangle(0, -4, 18, 20, 0x8e7750);
  const head = scene.add.circle(0, -28, 11, 0xf0c39a);
  const hair = scene.add.ellipse(0, -33, 21, 10, 0x4d2c16);

  const name = scene.add
    .text(0, -58, "Lv. 1 Adventurer", {
      fontSize: "18px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    })
    .setOrigin(0.5);

  const hpBg = scene.add.rectangle(0, -36, 92, 10, 0x222222).setOrigin(0.5);
  const hpFill = scene.add
    .rectangle(-46, -36, 90, 8, 0x32cc4b)
    .setOrigin(0, 0.5);

  container.add([
    shadow,
    sword,
    legs,
    body,
    armor,
    head,
    hair,
    name,
    hpBg,
    hpFill
  ]);

  player = {
    container: container,
    legs: legs,
    sword: sword,
    hpFill: hpFill,
    speed: 220
  };
}

function updatePlayer(delta) {
  if (!player || !targetPos) {
    return;
  }

  const dt = delta / 1000;
  const dx = targetPos.x - player.container.x;
  const dy = targetPos.y - player.container.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 4) {
    targetPos = null;
    player.legs.y = 18;
    player.sword.rotation = 0.9;
    return;
  }

  const vx = (dx / dist) * player.speed;
  const vy = (dy / dist) * player.speed;

  player.container.x += vx * dt;
  player.container.y += vy * dt;

  player.container.x = Phaser.Math.Clamp(player.container.x, 20, WORLD_WIDTH - 20);
  player.container.y = Phaser.Math.Clamp(player.container.y, 20, WORLD_HEIGHT - 20);

  const bob = Math.sin(performance.now() * 0.02) * 2;
  player.legs.y = 18 + bob;
  player.sword.rotation = 0.9 + Math.sin(performance.now() * 0.02) * 0.1;
}

/* =========================
   MONSTERS
========================= */

function createMonsters(scene) {
  monsters.push(makeSlime(scene, 760, 520));
  monsters.push(makeWolf(scene, 1580, 420));
  monsters.push(makeSpore(scene, 1720, 830));
}

function makeSlime(scene, x, y) {
  const container = scene.add.container(x, y).setDepth(15);

  const shadow = scene.add.ellipse(0, 20, 46, 16, 0x000000, 0.25);
  const body = scene.add.ellipse(0, 0, 54, 42, 0x6ed74f);
  const shine = scene.add.circle(-10, -10, 7, 0xb8ffad, 0.7);
  const eye1 = scene.add.circle(-10, 0, 3, 0x222222);
  const eye2 = scene.add.circle(10, 0, 3, 0x222222);

  // Phaser arc 대신 작은 입 모양 도형으로 처리
  const mouth = scene.add.rectangle(0, 10, 18, 3, 0x2b6b24);
  mouth.setScale(1, 0.7);

  const name = scene.add
    .text(0, -52, "Lv. 1 Green Slime", {
      fontSize: "18px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    })
    .setOrigin(0.5);

  const hpBg = scene.add.rectangle(0, -30, 104, 10, 0x222222).setOrigin(0.5);
  const hpFill = scene.add
    .rectangle(-52, -30, 102, 8, 0xcc2d2d)
    .setOrigin(0, 0.5);

  container.add([
    shadow,
    body,
    shine,
    eye1,
    eye2,
    mouth,
    name,
    hpBg,
    hpFill
  ]);

  return {
    container: container,
    type: "slime",
    baseY: y,
    floatOffset: Math.random() * Math.PI * 2
  };
}

function makeWolf(scene, x, y) {
  const container = scene.add.container(x, y).setDepth(15);

  const shadow = scene.add.ellipse(0, 24, 62, 16, 0x000000, 0.25);
  const body = scene.add.ellipse(0, 0, 76, 34, 0x696969);
  const head = scene.add.ellipse(34, -8, 24, 18, 0x636363);

  const ear1 = scene.add.triangle(42, -22, 0, 0, 8, -14, 16, 0, 0x565656);
  const ear2 = scene.add.triangle(28, -20, 0, 0, 8, -14, 16, 0, 0x565656);

  const leg1 = scene.add.rectangle(-18, 18, 7, 22, 0x4a4a4a);
  const leg2 = scene.add.rectangle(4, 18, 7, 22, 0x4a4a4a);

  const tail = scene.add.rectangle(-38, -10, 6, 24, 0x5a5a5a);
  tail.setRotation(-0.9);

  const eye = scene.add.circle(40, -10, 2, 0xffe1a1);

  const name = scene.add
    .text(0, -58, "Lv. 2 Gray Wolf", {
      fontSize: "18px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    })
    .setOrigin(0.5);

  const hpBg = scene.add.rectangle(0, -36, 104, 10, 0x222222).setOrigin(0.5);
  const hpFill = scene.add
    .rectangle(-52, -36, 102, 8, 0xcc2d2d)
    .setOrigin(0, 0.5);

  container.add([
    shadow,
    tail,
    leg1,
    leg2,
    body,
    head,
    ear1,
    ear2,
    eye,
    name,
    hpBg,
    hpFill
  ]);

  return {
    container: container,
    type: "wolf",
    baseY: y,
    floatOffset: Math.random() * Math.PI * 2
  };
}

function makeSpore(scene, x, y) {
  const container = scene.add.container(x, y).setDepth(15);

  const shadow = scene.add.ellipse(0, 22, 44, 16, 0x000000, 0.25);
  const cap = scene.add.ellipse(0, -6, 64, 34, 0xb56a28);

  const capDot1 = scene.add.circle(-14, -10, 4, 0xf5d1a1);
  const capDot2 = scene.add.circle(10, -4, 4, 0xf5d1a1);
  const capDot3 = scene.add.circle(20, -14, 3, 0xf5d1a1);

  const body = scene.add.ellipse(0, 18, 34, 28, 0xd9c08c);
  const eye1 = scene.add.circle(-6, 16, 2, 0x222222);
  const eye2 = scene.add.circle(6, 16, 2, 0x222222);

  const leg1 = scene.add.rectangle(-10, 32, 4, 12, 0xc7a773);
  const leg2 = scene.add.rectangle(10, 32, 4, 12, 0xc7a773);

  const name = scene.add
    .text(0, -54, "Lv. 1 Sporeling", {
      fontSize: "18px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    })
    .setOrigin(0.5);

  const hpBg = scene.add.rectangle(0, -32, 104, 10, 0x222222).setOrigin(0.5);
  const hpFill = scene.add
    .rectangle(-52, -32, 102, 8, 0xcc2d2d)
    .setOrigin(0, 0.5);

  container.add([
    shadow,
    cap,
    capDot1,
    capDot2,
    capDot3,
    body,
    eye1,
    eye2,
    leg1,
    leg2,
    name,
    hpBg,
    hpFill
  ]);

  return {
    container: container,
    type: "spore",
    baseY: y,
    floatOffset: Math.random() * Math.PI * 2
  };
}

function updateMonsters(time) {
  monsters.forEach(function (monster) {
    monster.container.y =
      monster.baseY + Math.sin(time * 0.002 + monster.floatOffset) * 2.5;
  });
}

/* =========================
   HTML UI SYNC
========================= */

function updateMinimap() {
  if (!player) {
    return;
  }

  const miniPlayer = document.getElementById("mini-player");

  if (!miniPlayer) {
    return;
  }

  const px = (player.container.x / WORLD_WIDTH) * 100;
  const py = (player.container.y / WORLD_HEIGHT) * 100;

  miniPlayer.style.left = px + "%";
  miniPlayer.style.top = py + "%";
}

function updateUI() {
  if (!player) {
    return;
  }

  const coordLine = document.getElementById("coord-line");

  if (coordLine) {
    coordLine.textContent =
      "X: " +
      Math.floor(player.container.x) +
      " / Y: " +
      Math.floor(player.container.y);
  }
}
