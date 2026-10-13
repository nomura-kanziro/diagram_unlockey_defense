export const CENTER_X = 350
export const CENTER_Y = 350
export const OUTER_RADIUS = 280
export const INNER_RADIUS = 140
export const SPAWN_PORTAL_ANGLE = -Math.PI / 2
export const MAX_UNITS = 100

export const TIERS = {
  normal: { name: '일반', color: '#ffffff', baseDmg: 5, inc: 3, prob: 47, sellable: true, class: 'normal' },
  rare: { name: '레어', color: '#00ff88', baseDmg: 10, inc: 6, prob: 29, sellable: true, class: 'rare' },
  advanced: { name: '고급', color: '#aa00ff', baseDmg: 18, inc: 9, prob: 15, sellable: true, class: 'advanced' },
  relic: { name: '유물', color: '#ff8800', baseDmg: 26, inc: 14, prob: 5, sellable: true, class: 'relic' },
  epic: { name: '서사', color: '#00aaff', baseDmg: 33, inc: 19, prob: 2.2, sellable: true, class: 'epic' },
  legendary: { name: '전설', color: '#ffcc00', baseDmg: 70, inc: 35, prob: 1.1, sellable: false, class: 'legendary', aoe: true },
  seongryeong: { name: '성령', color: '#00ffcc', baseDmg: 35, inc: 15, prob: 0.5, sellable: false, class: 'seongryeong', aoe: true, ignoreDef: true },
  mythic: { name: '신화', color: '#ff0000', baseDmg: 155, inc: 85, prob: 0.1, sellable: false, class: 'mythic', aoe: true, wide: true },
  heaven: { name: '대천', color: '#00cc66', baseDmg: 180, inc: 100, prob: 0.065, sellable: false, class: 'heaven', aoe: true, wide: true },
  origin: { name: '태초', color: '#00ffff', baseDmg: 250, inc: 150, prob: 0.025, sellable: false, class: 'origin', aoe: true, infinite: true },
  apocalypse: { name: '종말', color: '#666666', baseDmg: 15000, inc: 0, prob: 0.009, sellable: false, class: 'apocalypse', aoe: true, infinite: true, ignoreDef: true },
  mobius: { name: '뫼비우스', color: '#88ddff', baseDmg: 150, inc: 100, prob: 0.001, sellable: false, class: 'mobius', aoe: true, infinite: true, ignoreDef: true }
}

export const TIER_ORDER = ['normal', 'rare', 'advanced', 'relic', 'epic', 'legendary', 'seongryeong', 'mythic', 'heaven', 'origin', 'apocalypse', 'mobius']

export const SYNTHESIS_MAP = {
  normal: 'rare',
  rare: 'advanced',
  advanced: 'relic',
  relic: 'epic',
  epic: 'legendary',
  legendary: 'mythic',
  mythic: 'heaven',
  heaven: 'origin'
}

export const BOSS_LEVELS = [30, 65, 87, 104, 122, 145, 174, 180, 190, 195, 199, 200]

export function isBossLevel(level) {
  return BOSS_LEVELS.includes(level)
}

export const SHAPES = ['circle', 'triangle', 'square']

export const SHAPE_LABEL = {
  circle: '원형',
  triangle: '삼각형',
  square: '사각형'
}

export const CIRCLE_ONLY_TIERS = ['apocalypse', 'mobius']

export function shapeForTier(tierKey, roll = Math.random()) {
  if (CIRCLE_ONLY_TIERS.includes(tierKey)) return 'circle'
  if (SHAPES.includes(roll)) return roll
  const index = Math.min(SHAPES.length - 1, Math.floor(Number(roll) * SHAPES.length))
  return SHAPES[index]
}

export const SHAPE_COLLECTION_TIERS = ['normal', 'rare', 'advanced', 'relic', 'epic', 'legendary', 'mythic']

export const COLLECTION_DEFS = [
  { id: 'circle', title: '원형 컬렉션', kind: 'shape', shape: 'circle', rewardTier: 'heaven', detail: '원형 일반~신화(성령 제외) → 대천 원형' },
  { id: 'triangle', title: '삼각형 컬렉션', kind: 'shape', shape: 'triangle', rewardTier: 'heaven', detail: '삼각형 일반~신화(성령 제외) → 대천 삼각형' },
  { id: 'square', title: '사각형 컬렉션', kind: 'shape', shape: 'square', rewardTier: 'heaven', detail: '사각형 일반~신화(성령 제외) → 대천 사각형' },
  { id: 'advanced', title: '고급 컬렉션', kind: 'spread', tier: 'advanced', gold: 150, detail: '세 모양의 고급 → 150골드' },
  { id: 'relic', title: '유물 컬렉션', kind: 'spread', tier: 'relic', gold: 250, detail: '세 모양의 유물 → 250골드' },
  { id: 'epic', title: '서사 컬렉션', kind: 'spread', tier: 'epic', gold: 300, rewardTier: 'legendary', detail: '세 모양의 서사 → 무작위 전설 + 300골드' },
  { id: 'legendary', title: '전설 컬렉션', kind: 'spread', tier: 'legendary', gold: 400, rewardTier: 'mythic', detail: '세 모양의 전설 → 400골드 + 무작위 신화' },
  { id: 'seongryeong', title: '성령 컬렉션', kind: 'spread', tier: 'seongryeong', extraTier: 'apocalypse', gold: 500, rewardTier: 'origin', detail: '세 모양의 성령 + 종말 → 500골드 + 무작위 태초' }
]
