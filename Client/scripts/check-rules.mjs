import { createGame } from '../src/game/engine.js'
import { TIERS, TIER_ORDER, MAX_UNITS, SHAPES, SHAPE_COLLECTION_TIERS, shapeForTier } from '../src/game/constants.js'

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
expect('1단위 강화 1회 후 비용', game.state.currentEnhanceCost, 10)
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

function makeUnit(id, tier) {
  return { id, tier, level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' }
}

const mixed = createGame()
const sharedId = 7
mixed.state.units.push(
  makeUnit(sharedId, 'normal'),
  makeUnit(sharedId, 'normal'),
  makeUnit(sharedId, 'normal'),
  makeUnit(sharedId, 'rare'),
  makeUnit(sharedId, 'rare'),
  makeUnit(sharedId, 'rare')
)
mixed.synthesizeUnit(sharedId)
expect('겹친 id로는 다른 등급을 합치지 않음', mixed.state.units.length, 6)
const clickedRare = mixed.state.units.find(u => u.tier === 'rare')
mixed.onUnitAction(clickedRare, 'synthesize')
expect('레어 합성 후 일반 유지', mixed.state.units.filter(u => u.tier === 'normal').length, 3)
expect('레어 합성 후 레어 소모', mixed.state.units.filter(u => u.tier === 'rare').length, 0)
expect('레어 합성 결과', mixed.state.units.filter(u => u.tier === 'advanced').length, 1)

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

const attackGame = createGame()
const attacker = { tier: 'normal', level: 1 }
expect('1배속 공격 간격', attackGame.getAttackInterval(attacker), 1000)
attackGame.state.gameSpeed = 2
expect('2배속 공격 간격', attackGame.getAttackInterval(attacker), 500)
attackGame.state.gameSpeed = 6
expect('6배속 공격 간격', attackGame.getAttackInterval(attacker), 166)
attackGame.state.gameSpeed = 1
attacker.level = 2
expect('2레벨 1배속 공격 간격', attackGame.getAttackInterval(attacker), 940)
attackGame.state.gameSpeed = 4
expect('2레벨 4배속 공격 간격', attackGame.getAttackInterval(attacker), 235)
attackGame.state.gameSpeed = 1
attacker.level = 20
expect('상한 1배속 공격 간격', attackGame.getAttackInterval(attacker), 200)
attackGame.state.gameSpeed = 4
expect('상한 4배속 공격 간격', attackGame.getAttackInterval(attacker), 50)

const costGame = createGame()
costGame.state.gold = 100
costGame.state.units.push(makeUnit(900, 'normal'))
costGame.massUpgradeSingle()
costGame.massUpgradeSingle()
expect('1단위 2회 후 비용', costGame.state.currentEnhanceCost, 10)
costGame.massUpgradeSingle()
expect('1단위 3회 후 비용', costGame.state.currentEnhanceCost, 11)
expect('1단위 3회 후 횟수', costGame.state.singleEnhanceCount, 0)
const random = Math.random
try {
  Math.random = () => 0.99
  costGame.massUpgradeFive()
  expect('5단위 실패 후 비용', costGame.state.currentEnhanceCost, 14)
  expect('5단위 실패 후 레벨', costGame.state.units[0].level, 5)
  Math.random = () => 0
  costGame.massUpgradeFive()
  expect('5단위 성공 후 비용', costGame.state.currentEnhanceCost, 17)
  expect('5단위 성공 후 레벨', costGame.state.units[0].level, 10)
} finally {
  Math.random = random
}

const capGame = createGame()
capGame.state.gold = 1000
for (let i = 0; i < MAX_UNITS; i++) capGame.state.units.push(makeUnit(1000 + i, 'normal'))
capGame.summonUnit()
expect('최대 마리에서 추가 소환 안 됨', capGame.state.units.length, MAX_UNITS)
expect('최대 마리', MAX_UNITS, 100)
capGame.state.units.pop()
capGame.summonUnit()
expect('한 마리 빈 자리에서 소환', capGame.state.units.length, MAX_UNITS)
const tenGame = createGame()
tenGame.state.gold = 100
for (let i = 0; i < 90; i++) tenGame.state.units.push(makeUnit(3000 + i, 'normal'))
tenGame.summonTenTimes()
expect('90마리에서 10연차 거절', tenGame.state.units.length, 90)
expect('10연차 거절 후 골드', tenGame.state.gold, 100)

expect('종말 모양', shapeForTier('apocalypse', 'triangle'), 'circle')
expect('뫼비우스 모양', shapeForTier('mobius', 'square'), 'circle')
expect('굴림 0 모양', shapeForTier('normal', 0), 'circle')
expect('굴림 중간 모양', shapeForTier('normal', 0.5), 'triangle')
expect('굴림 끝 모양', shapeForTier('normal', 0.99), 'square')
const shaped = createGame()
shaped.state.units.push(
  { id: 1, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 2, tier: 'normal', shape: 'triangle', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 3, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' }
)
shaped.synthesizeUnit(shaped.state.units[0])
expect('다른 모양은 합성하지 않음', shaped.state.units.length, 3)
expect('사각형 2개로는 합성 없음', shaped.state.units.filter(unit => unit.tier === 'rare').length, 0)
shaped.state.units.push(
  { id: 4, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' }
)
shaped.synthesizeUnit(shaped.state.units.find(unit => unit.shape === 'square'))
expect('사각형 합성 결과', shaped.state.units.filter(unit => unit.tier === 'rare' && unit.shape === 'square').length, 1)
expect('삼각형은 남음', shaped.state.units.filter(unit => unit.tier === 'normal' && unit.shape === 'triangle').length, 1)
expect('카드 모양 이름', shaped.unitCard(shaped.state.units.find(unit => unit.tier === 'rare')).shapeLabel, '사각형')

function putUnit(game, shape, tier, id) {
  game.state.units.push({ id, tier, shape, level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' })
}

const shapeCollection = createGame()
let nextCollectionId = 1
for (const tier of SHAPE_COLLECTION_TIERS) {
  if (tier === 'mythic') continue
  putUnit(shapeCollection, 'circle', tier, nextCollectionId++)
}
expect('신화 없는 원형 컬렉션', shapeCollection.collectionView().find(item => item.id === 'circle').ready, false)
putUnit(shapeCollection, 'circle', 'mythic', nextCollectionId++)
expect('원형 컬렉션 준비', shapeCollection.collectionView().find(item => item.id === 'circle').ready, true)
shapeCollection.claimCollection('circle')
expect('원형 컬렉션 대천', shapeCollection.state.units.filter(unit => unit.tier === 'heaven' && unit.shape === 'circle').length, 1)
expect('원형 컬렉션 달성', shapeCollection.state.claimedCollections.circle, true)
shapeCollection.claimCollection('circle')
expect('원형 컬렉션 한 번', shapeCollection.state.units.filter(unit => unit.tier === 'heaven').length, 1)

const spread = createGame()
spread.state.gold = 0
for (const shape of SHAPES) putUnit(spread, shape, 'advanced', nextCollectionId++)
spread.claimCollection('advanced')
expect('고급 컬렉션 골드', spread.state.gold, 150)
spread.claimCollection('advanced')
expect('고급 컬렉션 한 번', spread.state.gold, 150)

const spirit = createGame()
spirit.state.gold = 0
for (const shape of SHAPES) putUnit(spirit, shape, 'seongryeong', nextCollectionId++)
const savedRandom = Math.random
Math.random = () => 0
spirit.claimCollection('seongryeong')
Math.random = savedRandom
expect('성령 컬렉션 골드', spirit.state.gold, 500)
expect('성령 컬렉션 태초', spirit.state.units.filter(unit => unit.tier === 'origin' && unit.shape === 'circle').length, 1)
spirit.claimCollection('seongryeong')
expect('성령 컬렉션 한 번', spirit.state.units.filter(unit => unit.tier === 'origin').length, 1)

const blocked = createGame()
for (const tier of SHAPE_COLLECTION_TIERS) putUnit(blocked, 'square', tier, nextCollectionId++)
while (blocked.state.units.length < MAX_UNITS) putUnit(blocked, 'circle', 'normal', nextCollectionId++)
blocked.claimCollection('square')
expect('자리 없으면 컬렉션 유지', blocked.state.claimedCollections.square, false)
expect('자리 없으면 대천 없음', blocked.state.units.some(unit => unit.tier === 'heaven'), false)

const splash = createGame()
splash.state.enemyDefense = 100
splash.state.units.push({
  id: 1,
  tier: 'mobius',
  shape: 'circle',
  level: 1,
  x: 350,
  y: 350,
  lastAttack: 0,
  color: '#88ddff'
})
splash.state.enemies.push(
  { id: 1, x: 350, y: 350, health: 10000, maxHealth: 10000, isBoss: false, isDeathmatch: false },
  { id: 2, x: 450, y: 350, health: 10000, maxHealth: 10000, isBoss: false, isDeathmatch: false },
  { id: 3, x: 550, y: 350, health: 10000, maxHealth: 10000, isBoss: false, isDeathmatch: false }
)
splash.performAttacks()
expect('뫼비우스 주 피해', splash.state.enemies[0].health, 9850)
expect('뫼비우스 무한 스플래시', splash.state.enemies[1].health, 9880)
expect('뫼비우스 범위 밖', splash.state.enemies[2].health, 10000)

const seller = createGame()
seller.state.gold = 30
seller.state.units.push(
  { id: 1, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 2, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 3, tier: 'normal', shape: 'triangle', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 4, tier: 'rare', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 5, tier: 'legendary', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' }
)
expect('판매 묶음 수', seller.sellBundleView('square', 'normal').count, 2)
expect('판매 묶음 금액', seller.sellBundleView('square', 'normal').total, 12)
seller.sellMatchingUnits('square', 'normal')
expect('사각형 일반만 판매', seller.state.units.filter(unit => unit.tier === 'normal' && unit.shape === 'square').length, 0)
expect('삼각형 일반 유지', seller.state.units.filter(unit => unit.shape === 'triangle').length, 1)
expect('사각형 레어 유지', seller.state.units.filter(unit => unit.tier === 'rare').length, 1)
expect('전설 유지', seller.state.units.filter(unit => unit.tier === 'legendary').length, 1)
expect('묶음 판매 골드', seller.state.gold, 42)
seller.sellMatchingUnits('square', 'legendary')
expect('전설은 묶음 판매 불가', seller.state.units.filter(unit => unit.tier === 'legendary').length, 1)
expect('거절 후 골드', seller.state.gold, 42)
seller.state.units.push(
  { id: 6, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 7, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 8, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 9, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 10, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 11, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' },
  { id: 12, tier: 'normal', shape: 'square', level: 1, x: 0, y: 0, lastAttack: 0, color: '#fff' }
)
expect('합성 묶음 횟수', seller.synthBundleView('square', 'normal').sets, 2)
seller.synthesizeMatchingUnits('square', 'normal')
expect('사각형 일반 나머지', seller.state.units.filter(unit => unit.tier === 'normal' && unit.shape === 'square').length, 1)
expect('사각형 레어 합성', seller.state.units.filter(unit => unit.tier === 'rare' && unit.shape === 'square').length, 3)
expect('삼각형은 합성되지 않음', seller.state.units.filter(unit => unit.shape === 'triangle' && unit.tier === 'normal').length, 1)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('규칙 확인 통과')
