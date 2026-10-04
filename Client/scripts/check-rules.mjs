import { createGame } from '../src/game/engine.js'
import { TIERS, TIER_ORDER } from '../src/game/constants.js'

const failures = []
function expect(name, actual, expected) {
  if (actual !== expected) failures.push(`${name}: 기대 ${expected}, 실제 ${actual}`)
}

const probSum = TIER_ORDER.reduce((sum, key) => sum + TIERS[key].prob, 0)
expect('소환 확률 합', probSum, 100)

const game = createGame()
const unit = { tier: 'normal', level: 1 }
expect('일반 1레벨 피해', game.calculateDamage(unit), 5)
unit.level = 2
expect('일반 2레벨 피해', game.calculateDamage(unit), 8)
expect('일반 판매가', game.sellPriceOf('normal'), 6)
expect('레어 판매가', game.sellPriceOf('rare'), 9)
expect('서사 판매가', game.sellPriceOf('epic'), 30)

game.state.gold = 30
game.state.units.push({
  id: 1,
  tier: 'normal',
  level: 1,
  x: 350,
  y: 350,
  lastAttack: 0,
  color: '#ffffff'
})
game.massUpgradeSingle()
expect('1단위 강화 후 레벨', game.state.units[0].level, 2)
expect('1단위 강화 후 비용', game.state.currentEnhanceCost, 12)
expect('1단위 강화 후 골드', game.state.gold, 20)
expect('미래 소환 보너스', game.state.globalLevelBonus, 1)

game.state.units.push(
  { id: 2, tier: 'normal', level: 2, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 3, tier: 'normal', level: 2, x: 0, y: 0, lastAttack: 0, color: '#fff' }
)
game.synthesizeUnit(1)
expect('합성 후 유닛 수', game.state.units.length, 1)
expect('합성 결과 등급', game.state.units[0].tier, 'rare')
expect('합성 결과 레벨', game.state.units[0].level, 2)

game.state.currentLevel = 1
game.spawnEnemy(false, false)
expect('1레벨 일반 적 체력', game.state.enemies[0].health, 10)
game.state.enemies.splice(0, game.state.enemies.length)
game.state.currentLevel = 30
game.spawnEnemy(true, false)
expect('30레벨 보스 체력', game.state.enemies[0].health, Math.floor(10 * Math.pow(1.1, 29) * 10))

game.state.units.splice(0, game.state.units.length)
game.state.gold = 100
game.summonTenTimes()
expect('10연차 후 유닛 수', game.state.units.length, 11)
expect('10연차 후 골드', game.state.gold, 0)

const originalSetInterval = globalThis.setInterval
const originalClearInterval = globalThis.clearInterval
const timers = []
globalThis.setInterval = (fn, ms) => {
  const id = timers.length + 1
  timers.push({ id, fn, ms, cleared: false })
  return id
}
globalThis.clearInterval = (id) => {
  const timer = timers.find(item => item.id === id)
  if (timer) timer.cleared = true
}
try {
  const speedGame = createGame()
  speedGame.state.gameRunning = true
  speedGame.state.currentLevel = 1
  speedGame.state.gameSpeed = 1
  speedGame.nextRound()
  const activeBefore = timers.filter(item => !item.cleared)
  expect('일반 라운드 소환 타이머', activeBefore.length, 1)
  expect('1배속 소환 간격', activeBefore[0].ms, 1530)
  activeBefore[0].fn()
  expect('배속 전 소환', speedGame.state.enemies.length, 1)
  expect('배속 전 레벨', speedGame.state.currentLevel, 2)
  speedGame.setGameSpeed(2)
  const activeAfter = timers.filter(item => !item.cleared)
  expect('배속 후 소환 타이머', activeAfter.length, 1)
  expect('2배속 소환 간격', activeAfter[0].ms, 765)
  expect('배속 직후 기존 적 유지', speedGame.state.enemies.length, 1)
  activeAfter[0].fn()
  expect('배속 후 이어서 소환', speedGame.state.enemies.length, 2)
  expect('배속 후 같은 라운드', speedGame.state.currentLevel, 2)
} finally {
  globalThis.setInterval = originalSetInterval
  globalThis.clearInterval = originalClearInterval
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('규칙 확인 통과')
