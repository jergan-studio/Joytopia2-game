import { loadWorkspace, jsonPartToJS } from './engine/workspace.js';

const canvas = document.createElement('canvas');
canvas.id = 'joytopia-canvas';
document.querySelector('#game').appendChild(canvas);
const ctx = canvas.getContext('2d');

let world = null;
let player = null;
let parts = [];
let keys = new Set();
let last = performance.now();
let velocityY = 0;
let grounded = false;

const Joytopia = globalThis.Joytopia = {
  Player: null,
  Workspace: null,
  spawn() {
    if (!player) return;
    const spawn = parts.find(p => p.type === 'Spawn');
    player.x = spawn?.x ?? 100;
    player.y = (spawn?.y ?? 380) - player.height;
    velocityY = 0;
  },
  broadcast(message) {
    console.log('[Joytopia]', message);
    window.dispatchEvent(new CustomEvent('joytopia:broadcast', { detail: message }));
  }
};

async function init() {
  world = await loadWorkspace('./workspace/Workspace.json');
  parts = world.parts.map(jsonPartToJS);
  player = jsonPartToJS(world.player || {
    name: 'jergplr', type: 'Player', position: { x: 100, y: 100 }, size: { width: 32, height: 48 }
  });
  player.name = 'jergplr';
  Joytopia.Player = player;
  Joytopia.Workspace = world;
  applySky(world.sky);
  Joytopia.spawn();
  await import('./workspace/ScriptService/main.js').catch(e => console.warn('LESC ScriptService:', e));
  requestAnimationFrame(loop);
}

async function applySky(skyPath) {
  if (!skyPath) return;
  try {
    const sky = await fetch('./workspace/' + skyPath).then(r => r.json());
    document.body.style.background = `linear-gradient(${sky.gradient?.top || sky.background}, ${sky.gradient?.bottom || sky.background})`;
  } catch (e) { console.warn('Sky could not be loaded:', e); }
}

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function collides(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function update(dt) {
  if (!player) return;
  const speed = 220;
  let dx = 0;
  if (keys.has('a') || keys.has('arrowleft')) dx -= speed * dt;
  if (keys.has('d') || keys.has('arrowright')) dx += speed * dt;
  player.x += dx;

  if ((keys.has(' ') || keys.has('space')) && grounded) {
    velocityY = -430;
    grounded = false;
  }
  velocityY += 1100 * dt;
  player.y += velocityY * dt;
  grounded = false;

  for (const part of parts) {
    if (!part.collision || part.type === 'Spawn') continue;
    if (collides(player, part) && velocityY >= 0 && player.y + player.height - velocityY * dt <= part.y) {
      player.y = part.y - player.height;
      velocityY = 0;
      grounded = true;
    }
  }

  player.x = Math.max(0, Math.min(innerWidth - player.width, player.x));
  if (player.y > innerHeight + 200) Joytopia.spawn();
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const part of parts) {
    if (!part.visible || part.type === 'Spawn') continue;
    ctx.fillStyle = part.color;
    ctx.fillRect(part.x, part.y, part.width, part.height);
  }

  ctx.fillStyle = player.color || '#fff';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#111';
  ctx.fillRect(player.x + 7, player.y + 10, 5, 5);
  ctx.fillRect(player.x + player.width - 12, player.y + 10, 5, 5);
}

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.033);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

addEventListener('keydown', e => { keys.add(e.key.toLowerCase()); if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault(); });
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('resize', resize);
resize();
init().catch(e => console.error('Joytopia 2 failed to start:', e));
