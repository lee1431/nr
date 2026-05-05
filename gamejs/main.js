const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#1b1b1b",
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let monsters;
let playerName;
let hpText;
let coordText;
let effectCircle;
let uiLayer;

function preload() {
  // 이번 예제는 외부 이미지 없이 Graphics로만 구현
}

function create() {
  const scene = this;

  // 월드 크기
  this.worldWidth = 2200;
  this.worldHeight = 1400;

  // 배경 생성
  drawFieldBackground(this);

  // 오브젝트들
  drawTrees(this);
  drawRocks(this);

  // 플레이어
  player = this.add.container(500, 400);

  const playerShadow = this.add.ellipse(0, 18, 28, 14, 0x000000, 0.35);
  const playerBody = this.add.rectangle(0, 0, 26, 36, 0x4ea5ff);
  const playerCape = this.add.rectangle(0, 10, 22, 10, 0x224488);
  const playerHead = this.add.circle(0, -26, 10, 0xffd4a3);

  player.add([playerShadow, playerBody, playerCape, playerHead]);

  playerName = this.add.text(0, -55, "Lv.1 Adventurer", {
    fontSize: "14px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 4,
  }).setOrigin(0.5);

  player.add(playerName);

  // 플레이어 hitbox용 zone
  const playerZone = this.add.zone(0, 0, 26, 36);
  this.physics.add.existing(playerZone);
  player.add(playerZone);

  // 몬스터 그룹
  monsters = this.add.group();

  createMonster(this, 780, 500, "Forest Wolf", 0x8b5a2b);
  createMonster(this, 920, 650, "Goblin", 0x5aa35a);
  createMonster(this, 640, 760, "Red Slime", 0xcc4444);
  createMonster(this, 1100, 460, "Skeleton", 0xd9d9d9);

  // 카메라
  this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
  this.cameras.main.startFollow(player, true, 0.08, 0.08);
  this.cameras.main.setZoom(1);

  // 입력
  cursors = this.input.keyboard.createCursorKeys();

  // 마우스 클릭 이펙트
  effectCircle = this.add.circle(0, 0, 12, 0xffff66, 0.5).setVisible(false);

  this.input.on("pointerdown", (pointer) => {
    const worldPoint = pointer.positionToCamera(this.cameras.main);

    effectCircle.setPosition(worldPoint.x, worldPoint.y);
    effectCircle.setScale(0.4);
    effectCircle.setAlpha(0.8);
    effectCircle.setVisible(true);

    this.tweens.add({
      targets: effectCircle,
      scale: 2.2,
      alpha: 0,
      duration: 250,
      onComplete: () => {
        effectCircle.setVisible(false);
      },
    });
  });

  // UI 레이어
  uiLayer = this.add.container(0, 0).setScrollFactor(0);

  drawUI(this);

  // 좌표 표시
  coordText = this.add.text(20, 20, "", {
    fontSize: "16px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 3,
  }).setScrollFactor(0);

  // 상태 텍스트
  hpText = this.add.text(30, 610, "HP 100 / 100", {
    fontSize: "18px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 3,
  }).setScrollFactor(0);

  uiLayer.add([coordText, hpText]);
}

function update() {
  const speed = 3.2;
  let vx = 0;
  let vy = 0;

  if (cursors.left.isDown) vx = -speed;
  else if (cursors.right.isDown) vx = speed;

  if (cursors.up.isDown) vy = -speed;
  else if (cursors.down.isDown) vy = speed;

  player.x += vx;
  player.y += vy;

  // 월드 경계
  player.x = Phaser.Math.Clamp(player.x, 20, this.worldWidth - 20);
  player.y = Phaser.Math.Clamp(player.y, 20, this.worldHeight - 20);

  // 간단한 걷기 연출
  const moving = vx !== 0 || vy !== 0;
  player.list[1].y = moving ? Math.sin(this.time.now * 0.015) * 2 : 0; // body
  player.list[2].y = 10 + (moving ? Math.cos(this.time.now * 0.015) * 2 : 0); // cape

  coordText.setText(`X: ${Math.floor(player.x)}  Y: ${Math.floor(player.y)}`);

  // 몬스터 살짝 둥둥
  monsters.getChildren().forEach((m) => {
    m.yBase ??= m.y;
    m.y = m.yBase + Math.sin((this.time.now * 0.002) + m.floatOffset) * 3;

    const dist = Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y);

    if (dist < 80) {
      m.nameText.setColor("#ffcc66");
      m.hpBarFill.width = 36;
    } else {
      m.nameText.setColor("#ffffff");
      m.hpBarFill.width = 52;
    }
  });
}

function drawFieldBackground(scene) {
  const g = scene.add.graphics();

  // 기본 바닥
  g.fillStyle(0x3f6b2f, 1);
  g.fillRect(0, 0, scene.worldWidth, scene.worldHeight);

  // 타일 느낌 격자
  for (let x = 0; x < scene.worldWidth; x += 64) {
    for (let y = 0; y < scene.worldHeight; y += 64) {
      const c = Phaser.Math.Between(0, 100) > 50 ? 0x4b7a37 : 0x446f33;
      g.fillStyle(c, 0.35);
      g.fillRect(x, y, 62, 62);
    }
  }

  // 흙길
  g.fillStyle(0x8a6a42, 1);
  g.fillRoundedRect(180, 250, 1600, 120, 20);
  g.fillRoundedRect(900, 120, 120, 900, 20);

  // 길 텍스처 느낌
  for (let i = 0; i < 200; i++) {
    const rx = Phaser.Math.Between(180, 1780);
    const ry = Phaser.Math.Between(250, 370);
    g.fillStyle(0x6f5334, 0.35);
    g.fillCircle(rx, ry, Phaser.Math.Between(2, 5));
  }

  for (let i = 0; i < 120; i++) {
    const rx = Phaser.Math.Between(900, 1020);
    const ry = Phaser.Math.Between(120, 1020);
    g.fillStyle(0x6f5334, 0.35);
    g.fillCircle(rx, ry, Phaser.Math.Between(2, 5));
  }
}

function drawTrees(scene) {
  const positions = [
    [240, 180], [320, 160], [1460, 180], [1560, 220],
    [1800, 360], [260, 1040], [420, 1120], [1700, 980],
    [1880, 1080], [1200, 1180], [1400, 1260]
  ];

  positions.forEach(([x, y]) => {
    const shadow = scene.add.ellipse(x, y + 28, 42, 18, 0x000000, 0.25);
    const trunk = scene.add.rectangle(x, y + 10, 14, 36, 0x6b4423);
    const leaves1 = scene.add.circle(x, y - 20, 28, 0x2f7d32);
    const leaves2 = scene.add.circle(x - 18, y - 5, 22, 0x3d9140);
    const leaves3 = scene.add.circle(x + 18, y - 5, 22, 0x2b6e2e);
    scene.add.container(0, 0, [shadow, trunk, leaves1, leaves2, leaves3]);
  });
}

function drawRocks(scene) {
  const rocks = [
    [600, 240], [1180, 300], [820, 980], [1530, 870], [300, 700]
  ];

  rocks.forEach(([x, y]) => {
    const shadow = scene.add.ellipse(x, y + 10, 28, 10, 0x000000, 0.2);
    const rock = scene.add.ellipse(x, y, 30, 20, 0x888888, 1);
    const shine = scene.add.ellipse(x - 6, y - 4, 10, 6, 0xaaaaaa, 0.8);
    scene.add.container(0, 0, [shadow, rock, shine]);
  });
}

function createMonster(scene, x, y, name, color) {
  const c = scene.add.container(x, y);

  const shadow = scene.add.ellipse(0, 16, 26, 12, 0x000000, 0.3);
  const body = scene.add.ellipse(0, 0, 28, 24, color, 1);
  const eye1 = scene.add.circle(-6, -2, 2, 0x111111);
  const eye2 = scene.add.circle(6, -2, 2, 0x111111);

  const hpBarBg = scene.add.rectangle(0, -28, 54, 6, 0x222222).setOrigin(0.5);
  const hpBarFill = scene.add.rectangle(-26, -28, 52, 4, 0xcc3333).setOrigin(0, 0.5);

  const nameText = scene.add.text(0, -48, name, {
    fontSize: "12px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 3,
  }).setOrigin(0.5);

  c.add([shadow, body, eye1, eye2, hpBarBg, hpBarFill, nameText]);

  c.floatOffset = Math.random() * Math.PI * 2;
  c.nameText = nameText;
  c.hpBarFill = hpBarFill;

  monsters.add(c);
}

function drawUI(scene) {
  const g = scene.add.graphics().setScrollFactor(0);

  // 하단 메인 UI
  g.fillStyle(0x1a1a1a, 0.92);
  g.fillRoundedRect(180, 560, 920, 140, 18);

  g.lineStyle(3, 0x8b7b5a, 1);
  g.strokeRoundedRect(180, 560, 920, 140, 18);

  // 좌측 상태창
  g.fillStyle(0x262626, 1);
  g.fillRoundedRect(20, 560, 140, 140, 14);
  g.strokeRoundedRect(20, 560, 140, 140, 14);

  // 우측 미니맵 느낌
  g.fillStyle(0x262626, 1);
  g.fillRoundedRect(1120, 20, 140, 140, 14);
  g.strokeRoundedRect(1120, 20, 140, 140, 14);

  // HP/MP 바
  g.fillStyle(0x3a3a3a, 1);
  g.fillRoundedRect(30, 580, 120, 18, 8);
  g.fillRoundedRect(30, 605, 120, 18, 8);

  g.fillStyle(0xcc3333, 1);
  g.fillRoundedRect(30, 580, 108, 18, 8);

  g.fillStyle(0x3377cc, 1);
  g.fillRoundedRect(30, 605, 85, 18, 8);

  // 스킬 슬롯
  const startX = 360;
  const y = 610;
  const size = 54;
  const gap = 10;

  for (let i = 0; i < 8; i++) {
    const x = startX + i * (size + gap);

    g.fillStyle(0x2c2c2c, 1);
    g.fillRoundedRect(x, y, size, size, 10);
    g.lineStyle(2, 0xa38f68, 1);
    g.strokeRoundedRect(x, y, size, size, 10);
  }

  // 스킬 텍스트
  for (let i = 0; i < 8; i++) {
    const label = scene.add.text(387 + i * 64, 639, String(i + 1), {
      fontSize: "18px",
      color: "#d8c9a5",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0);

    uiLayer?.add(label);
  }

  // 상태 텍스트들
  const title = scene.add.text(32, 645, "Adventurer", {
    fontSize: "18px",
    color: "#f2e6c9",
    stroke: "#000000",
    strokeThickness: 3,
  }).setScrollFactor(0);

  const mpLabel = scene.add.text(30, 628, "MP 70 / 100", {
    fontSize: "16px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 3,
  }).setScrollFactor(0);

  const miniMapText = scene.add.text(1190, 85, "MINIMAP", {
    fontSize: "16px",
    color: "#d8c9a5",
    stroke: "#000000",
    strokeThickness: 3,
  }).setOrigin(0.5).setScrollFactor(0);

  if (uiLayer) {
    uiLayer.add([g, title, mpLabel, miniMapText]);
  }
}
