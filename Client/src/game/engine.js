import { reactive } from 'vue'
import {
  CENTER_X,
  CENTER_Y,
  OUTER_RADIUS,
  INNER_RADIUS,
  SPAWN_PORTAL_ANGLE,
  TIERS,
  TIER_ORDER,
  SYNTHESIS_MAP,
  isBossLevel,
  MAX_UNITS,
  SHAPE_LABEL,
  shapeForTier
} from './constants.js'

export function createGame() {
  const state = reactive({
    gold: 30,
    currentLevel: 1,
    timeLeft: 30,
    roundTime: 90,
    enemies: [],
    units: [],
    gameRunning: false,
    started: false,
    enemyDefense: 0,
    logMessages: [],
    bottomLogs: [],
    isPrepPhase: true,
    gameSpeed: 1,
    globalDamageMultiplier: 1,
    lastBuffTime: 0,
    globalLevelBonus: 0,
    currentEnhanceCost: 10,
    singleEnhanceCount: 0,
    explanationOpen: false,
    buffCooldownText: ''
  })

  let canvas = null
  let ctx = null
  let lastTime = Date.now()
  let roundStartTime = Date.now()
  let spawnInterval = null
  let spawnedCount = 0
  let spawnTarget = 0
  let spawning = false
  let nextUnitId = 1
  let rafId = 0
  let buffCooldownTimer = null

  function nextId() {
    nextUnitId += 1
    return nextUnitId
  }

  function resolveUnit(unitOrId) {
    if (unitOrId && typeof unitOrId === 'object') {
      return state.units.includes(unitOrId) ? unitOrId : null
    }
    const matches = state.units.filter(u => u.id === unitOrId)
    return matches.length === 1 ? matches[0] : null
  }

  function addLog(msg) {
    const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const formatted = `[${time}] ${msg}`
    state.logMessages.unshift(formatted)
    if (state.logMessages.length > 12) state.logMessages.pop()
    state.bottomLogs.unshift(formatted)
    if (state.bottomLogs.length > 15) state.bottomLogs.pop()
  }

  function getTierFromProb() {
    const rand = Math.random() * 100
    let cumulative = 0
    for (const tierKey of TIER_ORDER) {
      cumulative += TIERS[tierKey].prob
      if (rand <= cumulative) return tierKey
    }
    return 'normal'
  }

  function calculateDamage(unit) {
    const tier = TIERS[unit.tier]
    let dmg = tier.baseDmg + (unit.level - 1) * tier.inc
    dmg = Math.floor(dmg * state.globalDamageMultiplier)
    return dmg
  }

  function getAscensionInfo(unit) {
    if (unit.tier === 'epic') return { target: 'legendary', cost: 100, rate: 100, name: '전설' }
    if (unit.tier === 'legendary') return { target: 'mythic', cost: 125, rate: 50, name: '신화' }
    if (unit.tier === 'mythic') return { target: 'heaven', cost: 150, rate: 35, name: '대천' }
    return null
  }

  function getTierCount(tierKey) {
    return state.units.filter(u => u.tier === tierKey).length
  }

  function canPerformApocalypseCombo() {
    return getTierCount('origin') >= 1 &&
      getTierCount('heaven') >= 2 &&
      getTierCount('mythic') >= 2 &&
      getTierCount('seongryeong') >= 3
  }

  function canPerformMobiusCombo() {
    return getTierCount('apocalypse') >= 2 &&
      getTierCount('origin') >= 2 &&
      state.globalDamageMultiplier === 3
  }

  function getAttackInterval(unit) {
    const baseInterval = 1000
    const reduction = (unit.level - 1) * 60
    const unscaled = Math.max(200, baseInterval - reduction)
    return Math.max(1, Math.floor(unscaled / state.gameSpeed))
  }

  function placeInInnerCircle() {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * (INNER_RADIUS - 30) + 30
    return {
      x: CENTER_X + Math.cos(angle) * dist,
      y: CENTER_Y + Math.sin(angle) * dist
    }
  }

  function _createRandomUnit() {
    const tierKey = getTierFromProb()
    const tier = TIERS[tierKey]
    const pos = placeInInnerCircle()
    const newUnit = {
      id: nextId(),
      tier: tierKey,
      shape: shapeForTier(tierKey),
      level: 1 + state.globalLevelBonus,
      x: pos.x,
      y: pos.y,
      lastAttack: Date.now(),
      color: tier.color
    }
    state.units.push(newUnit)
    addLog(`✨ ${SHAPE_LABEL[newUnit.shape]} ${tier.name} 유닛 소환! (Lv.${newUnit.level})`)
    if (tier.prob < 1) addLog(`🎉 대박! ${tier.name} 등급이 나왔습니다!`)
  }

  function summonUnit() {
    if (state.units.length >= MAX_UNITS) {
      addLog(`⚠️ 유닛 최대 수 (${MAX_UNITS}마리)에 도달했습니다!`)
      return
    }
    if (state.gold < 10) {
      addLog('골드가 부족합니다!')
      return
    }
    state.gold -= 10
    _createRandomUnit()
  }

  function summonTenTimes() {
    if (state.units.length + 11 > MAX_UNITS) {
      addLog('⚠️ 유닛 최대 수를 초과합니다! (11마리 추가 불가)')
      return
    }
    if (state.gold < 100) {
      addLog('골드가 부족합니다! (100원 필요)')
      return
    }
    state.gold -= 100
    addLog('🎁 10연차 소환 시작! (총 11개 소환)')
    for (let i = 0; i < 11; i++) {
      if (state.units.length >= MAX_UNITS) break
      _createRandomUnit()
    }
  }

  function ascendUnit(unitOrId) {
    const unit = resolveUnit(unitOrId)
    if (!unit) return
    const currentTier = unit.tier
    let targetTier = null
    let cost = 0
    let successRate = 100
    if (currentTier === 'epic') {
      targetTier = 'legendary'
      cost = 100
      successRate = 100
    } else if (currentTier === 'legendary') {
      targetTier = 'mythic'
      cost = 125
      successRate = 50
    } else if (currentTier === 'mythic') {
      targetTier = 'heaven'
      cost = 150
      successRate = 35
    } else {
      addLog('이 등급은 승천할 수 없습니다!')
      return
    }
    if (state.gold < cost) {
      addLog('승천 비용이 부족합니다!')
      return
    }
    state.gold -= cost
    if (Math.random() * 100 <= successRate) {
      const oldName = TIERS[currentTier].name
      const newName = TIERS[targetTier].name
      unit.tier = targetTier
      unit.color = TIERS[targetTier].color
      addLog(`🌟 ${oldName} → ${newName} 승천 성공!`)
    } else {
      addLog(`승천 실패... (${TIERS[targetTier].name} 확률 ${successRate}%)`)
    }
  }

  function massUpgradeSingle() {
    if (state.units.length === 0) {
      addLog('소환된 유닛이 없습니다!')
      return
    }
    const cost = state.currentEnhanceCost
    if (state.gold < cost) {
      addLog(`골드가 부족합니다! (필요: ${cost}원)`)
      return
    }
    state.gold -= cost
    state.units.forEach(unit => { unit.level++ })
    state.globalLevelBonus++
    state.singleEnhanceCount++
    if (state.singleEnhanceCount >= 3) {
      state.currentEnhanceCost += 1
      state.singleEnhanceCount = 0
    }
    addLog(`✅ 1레벨 강화 완료! (비용: ${cost}원) → 다음 비용 ${state.currentEnhanceCost}원 | 보너스 +${state.globalLevelBonus}`)
  }

  function massUpgradeFive() {
    if (state.units.length === 0) {
      addLog('소환된 유닛이 없습니다!')
      return
    }
    const cost = state.currentEnhanceCost
    if (state.gold < cost) {
      addLog(`골드가 부족합니다! (필요: ${cost}원)`)
      return
    }
    state.gold -= cost
    state.units.forEach(unit => { unit.level += 1 })
    state.globalLevelBonus += 1
    const fiveSuccess = Math.random() * 100 <= 20
    if (fiveSuccess) {
      state.units.forEach(unit => { unit.level += 4 })
      state.globalLevelBonus += 4
    }
    state.currentEnhanceCost += 3
    if (fiveSuccess) {
      addLog(`🎉 5단위 강화 성공! (총 +5, 비용 ${cost}원 소모) → 다음 비용 ${state.currentEnhanceCost}원 | 보너스 +${state.globalLevelBonus}`)
    } else {
      addLog(`5단위 강화 실패... (20% 확률, 비용 ${cost}원 소모) → 최소 +1 강화 적용, 다음 비용 ${state.currentEnhanceCost}원`)
    }
  }

  function updateBuffCooldown() {
    if (buffCooldownTimer) clearInterval(buffCooldownTimer)
    buffCooldownTimer = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((50000 - (now - state.lastBuffTime)) / 1000))
      if (remaining > 0) {
        state.buffCooldownText = `쿨타임: ${remaining}초`
      } else {
        state.buffCooldownText = ''
        clearInterval(buffCooldownTimer)
        buffCooldownTimer = null
      }
    }, 1000)
  }

  function activateGlobalBuff() {
    const now = Date.now()
    const cooldown = 50000
    if (now - state.lastBuffTime < cooldown) {
      const remaining = Math.ceil((cooldown - (now - state.lastBuffTime)) / 1000)
      addLog(`버프 쿨타임 중... ${remaining}초 남음`)
      return
    }
    if (state.gold < 30) {
      addLog('골드가 부족합니다! (30원 필요)')
      return
    }
    state.gold -= 30
    state.globalDamageMultiplier = 3
    state.lastBuffTime = now
    addLog('🌟 전체 데미지 300% 버프 활성화! (50초 지속)')
    setTimeout(() => {
      state.globalDamageMultiplier = 1
      addLog('버프 효과 종료')
    }, 50000)
    updateBuffCooldown()
  }

  function performApocalypseCombo(unitOrId) {
    if (!canPerformApocalypseCombo()) {
      addLog('종말 조합 재료가 부족합니다.')
      return
    }
    const targetUnit = resolveUnit(unitOrId)
    if (!targetUnit || targetUnit.tier !== 'origin') return
    const saved = { level: targetUnit.level, x: targetUnit.x, y: targetUnit.y }
    const originIndex = state.units.indexOf(targetUnit)
    if (originIndex !== -1) state.units.splice(originIndex, 1)
    const toConsume = { heaven: 2, mythic: 2, seongryeong: 3 }
    for (const tier in toConsume) {
      let needed = toConsume[tier]
      for (let i = state.units.length - 1; i >= 0 && needed > 0; i--) {
        if (state.units[i].tier === tier) {
          state.units.splice(i, 1)
          needed--
        }
      }
    }
    state.units.push({
      id: nextId(),
      tier: 'apocalypse',
      shape: 'circle',
      level: saved.level,
      x: saved.x,
      y: saved.y,
      lastAttack: Date.now(),
      color: TIERS.apocalypse.color
    })
    addLog('🌌 종말 조합 성공! 태초가 종말로 진화했습니다!')
  }

  function performMobiusCombo(unitOrId) {
    if (!canPerformMobiusCombo()) {
      addLog('뫼비우스 조합 조건이 충족되지 않습니다. (종말 2 + 태초 2 + 버프 활성화 필요)')
      return
    }
    const targetUnit = resolveUnit(unitOrId)
    if (!targetUnit || targetUnit.tier !== 'apocalypse') return
    const saved = { level: targetUnit.level, x: targetUnit.x, y: targetUnit.y }
    let consumedApocalypse = 0
    let consumedOrigin = 0
    for (let i = state.units.length - 1; i >= 0 && consumedApocalypse < 2; i--) {
      if (state.units[i].tier === 'apocalypse') {
        state.units.splice(i, 1)
        consumedApocalypse++
      }
    }
    for (let i = state.units.length - 1; i >= 0 && consumedOrigin < 2; i--) {
      if (state.units[i].tier === 'origin') {
        state.units.splice(i, 1)
        consumedOrigin++
      }
    }
    state.units.push({
      id: nextId(),
      tier: 'mobius',
      shape: 'circle',
      level: saved.level,
      x: saved.x,
      y: saved.y,
      lastAttack: Date.now(),
      color: TIERS.mobius.color
    })
    addLog('♾️ 뫼비우스 조합 성공! 종말이 뫼비우스로 진화했습니다!')
  }

  function synthesizeUnit(unitOrId) {
    const unit = resolveUnit(unitOrId)
    if (!unit) return
    const currentTier = unit.tier
    const nextTier = SYNTHESIS_MAP[currentTier]
    if (!nextTier) {
      addLog('이 등급은 합성할 수 없습니다.')
      return
    }
    const sameTier = state.units.filter(u => u.tier === currentTier)
    if (sameTier.length < 3) {
      addLog(`합성하려면 ${TIERS[currentTier].name}이 3개 이상 필요합니다. (현재 ${sameTier.length}개)`)
      return
    }
    const picked = [unit]
    for (let i = state.units.length - 1; i >= 0 && picked.length < 3; i--) {
      const candidate = state.units[i]
      if (candidate.tier === currentTier && !picked.includes(candidate)) picked.push(candidate)
    }
    for (const target of picked) {
      const index = state.units.indexOf(target)
      if (index !== -1) state.units.splice(index, 1)
    }
    const pos = placeInInnerCircle()
    state.units.push({
      id: nextId(),
      tier: nextTier,
      shape: shapeForTier(nextTier, unit.shape || 'circle'),
      level: 1 + state.globalLevelBonus,
      x: pos.x,
      y: pos.y,
      lastAttack: Date.now(),
      color: TIERS[nextTier].color
    })
    addLog(`🔄 ${TIERS[currentTier].name} 3개 → ${TIERS[nextTier].name} 1개 합성 완료!`)
  }

  function ascendFromBox(startTier) {
    const unit = state.units.find(u => u.tier === startTier)
    if (!unit) {
      addLog(`${TIERS[startTier].name} 등급 유닛이 없습니다.`)
      return
    }
    let targetTier
    let cost
    let successRate
    if (startTier === 'epic') {
      targetTier = 'legendary'
      cost = 100
      successRate = 100
    } else if (startTier === 'legendary') {
      targetTier = 'mythic'
      cost = 200
      successRate = 75
    } else if (startTier === 'mythic') {
      targetTier = 'heaven'
      cost = 250
      successRate = 60
    } else {
      addLog('이 등급은 기능상자에서 승천할 수 없습니다.')
      return
    }
    if (state.gold < cost) {
      addLog(`골드가 부족합니다! (필요: ${cost}원)`)
      return
    }
    state.gold -= cost
    if (Math.random() * 100 <= successRate) {
      unit.tier = targetTier
      unit.color = TIERS[targetTier].color
      addLog(`🌟 ${TIERS[startTier].name} → ${TIERS[targetTier].name} 승천 성공! (기능상자)`)
    } else {
      addLog(`승천 실패... (${TIERS[targetTier].name} 확률 ${successRate}%)`)
    }
  }

  function sellPriceOf(tierKey) {
    let sellPrice = 6
    const tierIndex = TIER_ORDER.indexOf(tierKey)
    if (tierIndex > 0) sellPrice = 6 * Math.pow(1.5, tierIndex)
    if (['legendary', 'mythic', 'heaven', 'origin', 'apocalypse', 'mobius'].includes(tierKey)) {
      sellPrice *= 1.2
    }
    return Math.floor(sellPrice)
  }

  function sellUnit(unitOrId) {
    const unit = resolveUnit(unitOrId)
    if (!unit) return
    const index = state.units.indexOf(unit)
    if (index === -1) return
    const tier = TIERS[unit.tier]
    if (!tier.sellable) {
      addLog('이 등급은 판매할 수 없습니다!')
      return
    }
    const sellPrice = sellPriceOf(unit.tier)
    state.gold += sellPrice
    state.units.splice(index, 1)
    addLog(`${tier.name} 유닛 판매 (+${sellPrice}원)`)
  }

  function exchangeUnit(targetTier) {
    let cost
    let successRate
    let targetName
    if (targetTier === 'legend') {
      cost = 20
      successRate = 70
      targetName = '전설'
    } else if (targetTier === 'mythic') {
      cost = 75
      successRate = 75
      targetName = '신화'
    } else if (targetTier === 'heaven') {
      cost = 100
      successRate = 90
      targetName = '대천'
    }
    if (state.gold < cost) {
      addLog('골드가 부족합니다!')
      return
    }
    state.gold -= cost
    if (Math.random() * 100 <= successRate) {
      const pos = placeInInnerCircle()
      state.units.push({
        id: nextId(),
        tier: targetTier,
        shape: shapeForTier(targetTier),
        level: 1,
        x: pos.x,
        y: pos.y,
        lastAttack: Date.now(),
        color: TIERS[targetTier].color
      })
      addLog(`🎊 교환 성공! ${targetName} 유닛 획득!`)
    } else {
      addLog(`교환 실패... (${targetName} 확률 ${successRate}%)`)
    }
  }

  function unitCard(unit) {
    const tier = TIERS[unit.tier]
    const canSynthesize = !!SYNTHESIS_MAP[unit.tier]
    const ascensionInfo = getAscensionInfo(unit)
    const canDoApocalypse = unit.tier === 'origin' && canPerformApocalypseCombo()
    const canDoMobius = unit.tier === 'apocalypse' && canPerformMobiusCombo()
    let action = 'none'
    if (canDoMobius) action = 'mobius'
    else if (canDoApocalypse) action = 'apocalypse'
    else if (canSynthesize && tier.sellable) action = 'synthesize-sell'
    else if (canSynthesize) action = 'synthesize'
    else if (ascensionInfo) action = 'ascend'
    else if (tier.sellable) action = 'sell'
    return {
      tier,
      shapeLabel: SHAPE_LABEL[shapeForTier(unit.tier, unit.shape || 'circle')],
      dmg: calculateDamage(unit),
      interval: getAttackInterval(unit),
      canDoApocalypse,
      canDoMobius,
      action
    }
  }

  function enemyHealthView() {
    const baseHealth = 10 * Math.pow(1.1, state.currentLevel - 1)
    const bossOnField = state.enemies.find(e => e.isBoss || e.isDeathmatch)
    const bossLevel = isBossLevel(state.currentLevel)
    const deathmatch = state.currentLevel >= 175 && state.currentLevel <= 198
    let bossMult = 10
    if (state.currentLevel === 200) bossMult = 14
    else if (state.currentLevel === 199) bossMult = 12
    else if (state.currentLevel >= 175) bossMult = 10
    return {
      normal: Math.floor(baseHealth),
      bossOnField,
      showExpected: !bossOnField && (bossLevel || deathmatch),
      expected: Math.floor(baseHealth * bossMult),
      bossMult,
      defense: state.enemyDefense
    }
  }

  function spawnEnemy(isBoss = false, isDeathmatch = false) {
    let angle
    if (isBoss || isDeathmatch) angle = Math.random() * Math.PI * 2
    else angle = SPAWN_PORTAL_ANGLE + (Math.random() - 0.5) * 0.6
    let health = 10 * Math.pow(1.1, state.currentLevel - 1)
    if (isBoss) {
      if (state.currentLevel === 200) health *= 14
      else if (state.currentLevel === 199) health *= 12
      else health *= 10
    } else if (isDeathmatch) {
      health *= 5
    }
    const baseSpeed = isBoss || isDeathmatch ? 0.008 : 0.012
    state.enemies.push({
      id: Date.now() + Math.random(),
      angle,
      health: Math.floor(health),
      maxHealth: Math.floor(health),
      isBoss,
      isDeathmatch,
      speed: baseSpeed * state.gameSpeed,
      x: CENTER_X + Math.cos(angle) * OUTER_RADIUS,
      y: CENTER_Y + Math.sin(angle) * OUTER_RADIUS
    })
  }

  function createFloatingGold(x, y, amount) {
    if (typeof document === 'undefined' || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width / canvas.width
    const scaleY = rect.height / canvas.height
    const floatEl = document.createElement('div')
    floatEl.style.position = 'fixed'
    floatEl.style.left = `${rect.left + x * scaleX}px`
    floatEl.style.top = `${rect.top + y * scaleY}px`
    floatEl.style.color = '#ffdd00'
    floatEl.style.fontWeight = 'bold'
    floatEl.style.fontSize = '14px'
    floatEl.style.textShadow = '0 0 8px #ffaa00'
    floatEl.style.pointerEvents = 'none'
    floatEl.style.zIndex = '100'
    floatEl.textContent = `+${amount.toFixed(1)}`
    document.body.appendChild(floatEl)
    let opacity = 1
    const interval = setInterval(() => {
      opacity -= 0.08
      floatEl.style.opacity = opacity
      floatEl.style.transform = `translateY(-${(1 - opacity) * 40}px)`
      if (opacity <= 0) {
        clearInterval(interval)
        floatEl.remove()
      }
    }, 50)
  }

  function updateEnemies() {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i]
      enemy.angle += enemy.speed
      enemy.x = CENTER_X + Math.cos(enemy.angle) * OUTER_RADIUS
      enemy.y = CENTER_Y + Math.sin(enemy.angle) * OUTER_RADIUS
      if (enemy.health <= 0) {
        const goldGain = enemy.isBoss ? 150 : (enemy.isDeathmatch ? 45 : 2)
        state.gold += goldGain
        createFloatingGold(enemy.x, enemy.y, goldGain)
        if (enemy.isBoss) {
          if (state.currentLevel === 30) {
            state.enemyDefense += 1
            addLog('⚔️ Part 2 진입! 적 방어력 +1')
          } else if (state.currentLevel === 65) {
            state.enemyDefense += 2
            addLog('⚔️ Part 3 진입! 적 방어력 +2')
          } else if (state.currentLevel === 87) {
            state.enemyDefense += 2
            addLog('⚔️ Part 4 진입! 적 방어력 +2')
          } else if ([104, 122, 145, 174].includes(state.currentLevel)) {
            state.enemyDefense += 3
            addLog('⚔️ Part 진행! 적 방어력 +3')
          } else if ([180, 190, 195, 199, 200].includes(state.currentLevel)) {
            state.enemyDefense += 4
            addLog('⚔️ 최종 구간! 적 방어력 +4')
          }
        }
        state.enemies.splice(i, 1)
      }
    }
    if (state.enemies.length >= 100) endGame(false, '적의 수가 100마리를 넘었습니다!')
  }

  function drawAttackEffect(fromX, fromY, toX, toY, color) {
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.shadowColor = color
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    ctx.fillStyle = color
    for (let i = 0; i < 5; i++) {
      const px = fromX + (toX - fromX) * (i / 5)
      const py = fromY + (toY - fromY) * (i / 5)
      ctx.beginPath()
      ctx.arc(px, py, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0
  }

  function performAttacks() {
    const now = Date.now()
    state.units.forEach(unit => {
      const tier = TIERS[unit.tier]
      const interval = getAttackInterval(unit)
      if (now - unit.lastAttack >= interval && state.enemies.length > 0) {
        unit.lastAttack = now
        let target = null
        let minDist = Infinity
        state.enemies.forEach(enemy => {
          const dist = Math.hypot(unit.x - enemy.x, unit.y - enemy.y)
          if (dist < minDist) {
            minDist = dist
            target = enemy
          }
        })
        if (target) {
          let dmg = calculateDamage(unit)
          if (state.enemyDefense > 0 && !tier.ignoreDef) {
            const reduction = 1 - (state.enemyDefense * 0.005)
            dmg = Math.floor(dmg * reduction)
          }
          target.health -= dmg
          if (tier.aoe) {
            const aoeRadius = tier.infinite ? 120 : (tier.wide ? 90 : 70)
            state.enemies.forEach(other => {
              if (other.id !== target.id) {
                const dist = Math.hypot(target.x - other.x, target.y - other.y)
                if (dist <= aoeRadius) {
                  let splashDmg = Math.floor(dmg * (tier.infinite ? 0.8 : 0.6))
                  if (state.enemyDefense > 0 && !tier.ignoreDef) {
                    const reduction = 1 - (state.enemyDefense * 0.005)
                    splashDmg = Math.floor(splashDmg * reduction)
                  }
                  other.health -= splashDmg
                }
              }
            })
          }
          if (ctx) drawAttackEffect(unit.x, unit.y, target.x, target.y, tier.color)
        }
      }
    })
  }

  function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0a0a1f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#ff3366'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS + 12, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, INNER_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = 'rgba(0, 255, 255, 0.08)'
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, INNER_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#112244'
    ctx.beginPath()
    ctx.arc(CENTER_X, CENTER_Y, 25, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Lv.${state.currentLevel}`, CENTER_X, CENTER_Y + 6)
    const portalX = CENTER_X + Math.cos(SPAWN_PORTAL_ANGLE) * OUTER_RADIUS
    const portalY = CENTER_Y + Math.sin(SPAWN_PORTAL_ANGLE) * OUTER_RADIUS
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.arc(portalX, portalY, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.arc(portalX, portalY, 20, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(portalX, portalY, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('PORTAL', portalX, portalY + 3)
  }

  function traceUnitShape(x, y, size, shape) {
    ctx.beginPath()
    if (shape === 'square') {
      ctx.rect(x - size, y - size, size * 2, size * 2)
      return
    }
    if (shape === 'triangle') {
      ctx.moveTo(x, y - size)
      ctx.lineTo(x + size, y + size * 0.86)
      ctx.lineTo(x - size, y + size * 0.86)
      ctx.closePath()
      return
    }
    ctx.arc(x, y, size, 0, Math.PI * 2)
  }

  function drawUnits() {
    state.units.forEach(unit => {
      const tier = TIERS[unit.tier]
      const size = tier.infinite ? 22 : (tier.aoe ? 18 : 14)
      const shape = shapeForTier(unit.tier, unit.shape || 'circle')
      ctx.fillStyle = unit.color
      ctx.shadowColor = unit.color
      ctx.shadowBlur = tier.infinite ? 25 : 12
      traceUnitShape(unit.x, unit.y, size, shape)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = '#000'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(unit.level.toString(), unit.x, unit.y + 4)
    })
  }

  function drawEnemies() {
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = 2
    state.enemies.forEach(enemy => {
      const size = enemy.isBoss ? 18 : (enemy.isDeathmatch ? 14 : 10)
      ctx.fillStyle = enemy.isBoss ? '#ff0000' : (enemy.isDeathmatch ? '#ff8800' : '#ff4444')
      ctx.beginPath()
      ctx.arc(enemy.x, enemy.y, size, 0, Math.PI * 2)
      ctx.fill()
      const barWidth = size * 1.8
      const healthPercent = enemy.health / enemy.maxHealth
      ctx.fillStyle = '#222'
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - size - 8, barWidth, 5)
      ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : (healthPercent > 0.2 ? '#ff0' : '#f00')
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - size - 8, barWidth * healthPercent, 5)
      if (enemy.isBoss) {
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px sans-serif'
        ctx.fillText('BOSS', enemy.x - 15, enemy.y - size - 14)
      }
    })
  }

  function stopSpawnTimer() {
    if (spawnInterval) {
      clearInterval(spawnInterval)
      spawnInterval = null
    }
  }

  function currentSpawnGap() {
    const total = spawnTarget > 0 ? spawnTarget : 50
    const spawnDurationMs = state.roundTime * 1000 * 0.85
    return Math.max(200, Math.floor(spawnDurationMs / total / state.gameSpeed))
  }

  function armSpawnTimer() {
    stopSpawnTimer()
    if (!spawning || spawnedCount >= spawnTarget) {
      spawning = false
      return
    }
    spawnInterval = setInterval(() => {
      if (!state.gameRunning || spawnedCount >= spawnTarget) {
        spawning = false
        stopSpawnTimer()
        return
      }
      spawnEnemy()
      spawnedCount++
      if (spawnedCount >= spawnTarget) {
        spawning = false
        stopSpawnTimer()
      }
    }, currentSpawnGap())
  }

  function handleRoundEnd() {
    spawning = false
    stopSpawnTimer()
    const isHighLevelBoss = state.currentLevel >= 175 || isBossLevel(state.currentLevel)
    if (isHighLevelBoss && state.enemies.length > 0) {
      endGame(false, '보스/데스매치를 시간 내에 클리어하지 못했습니다!')
    } else {
      if (state.enemies.length > 0) {
        addLog('⏰ 라운드 시간 종료! 남은 적이 있어도 다음 라운드로 진행합니다.')
      }
      nextRound()
    }
  }

  function gameLoop() {
    if (!state.gameRunning) return
    const now = Date.now()
    lastTime = now
    updateEnemies()
    performAttacks()
    if (ctx) {
      drawMap()
      drawUnits()
      drawEnemies()
    }
    const timerInterval = Math.floor(1000 / state.gameSpeed)
    if (now - roundStartTime >= timerInterval && state.timeLeft > 0) {
      state.timeLeft--
      roundStartTime = now
      if (state.timeLeft <= 0) {
        if (state.isPrepPhase) {
          state.isPrepPhase = false
          state.timeLeft = 90
          addLog('첫 라운드 시작!')
          nextRound()
        } else {
          handleRoundEnd()
        }
      }
    }
    if (state.currentLevel > 200) {
      endGame(true)
      return
    }
    rafId = requestAnimationFrame(gameLoop)
  }

  function nextRound() {
    if (!state.gameRunning) return
    state.currentLevel++
    state.isPrepPhase = false
    state.timeLeft = isBossLevel(state.currentLevel) ? 300 : 90
    state.roundTime = state.timeLeft
    roundStartTime = Date.now()
    spawning = false
    stopSpawnTimer()
    spawnedCount = 0
    spawnTarget = 0
    const bossRound = isBossLevel(state.currentLevel)
    const deathmatch = state.currentLevel >= 175 && state.currentLevel <= 198
    addLog(`=== 라운드 ${state.currentLevel} 시작 ===`)
    if (bossRound) {
      addLog('⚠️ 보스 라운드! 보스 1마리 등장')
      spawnEnemy(true)
      state.timeLeft = 300
    } else if (deathmatch) {
      addLog('🔥 데스매치 구간! 강력한 적 8마리')
      for (let i = 0; i < 8; i++) spawnEnemy(false, true)
      state.timeLeft = 300
    } else {
      spawnTarget = 50
      spawnedCount = 0
      spawning = true
      armSpawnTimer()
    }
  }

  function setGameSpeed(speed) {
    state.gameSpeed = speed
    addLog(`⚡ 게임 속도 ${speed}x로 변경`)
    state.enemies.forEach(enemy => {
      const baseSpeed = enemy.isBoss || enemy.isDeathmatch ? 0.008 : 0.012
      enemy.speed = baseSpeed * state.gameSpeed
    })
    if (spawning) armSpawnTimer()
  }

  function attachCanvas(element) {
    canvas = element
    ctx = element ? element.getContext('2d') : null
  }

  function startGame() {
    state.gold = 30
    state.currentLevel = 1
    state.timeLeft = 90
    state.enemies.splice(0, state.enemies.length)
    state.units.splice(0, state.units.length)
    state.logMessages.splice(0, state.logMessages.length)
    state.bottomLogs.splice(0, state.bottomLogs.length)
    state.gameRunning = true
    state.started = true
    lastTime = Date.now()
    roundStartTime = Date.now()
    state.isPrepPhase = true
    state.timeLeft = 30
    for (let i = 0; i < 2; i++) {
      const tierKey = Math.random() > 0.7 ? 'rare' : 'normal'
      const pos = placeInInnerCircle()
      state.units.push({
        id: nextId(),
        tier: tierKey,
        shape: shapeForTier(tierKey),
        level: 1,
        x: pos.x,
        y: pos.y,
        lastAttack: Date.now(),
        color: TIERS[tierKey].color
      })
    }
    addLog('게임 시작! 30초 대기 후 첫 라운드 시작')
    gameLoop()
  }

  function endGame(isWin, reason = '') {
    state.gameRunning = false
    spawning = false
    stopSpawnTimer()
    const msg = isWin
      ? '🎉 축하합니다! 200레벨 클리어! 게임 승리!'
      : `💀 게임 오버! ${reason || '적의 수가 너무 많습니다.'}`
    setTimeout(() => {
      if (typeof alert === 'function') alert(msg)
      if (typeof confirm === 'function' && confirm('다시 플레이하시겠습니까?')) {
        location.reload()
      }
    }, 500)
  }

  function showExplanation() {
    state.explanationOpen = true
  }

  function closeExplanation() {
    state.explanationOpen = false
  }

  function onUnitAction(unit, action) {
    if (action === 'mobius') performMobiusCombo(unit)
    else if (action === 'apocalypse') performApocalypseCombo(unit)
    else if (action === 'synthesize') synthesizeUnit(unit)
    else if (action === 'sell') sellUnit(unit)
    else if (action === 'ascend') ascendUnit(unit)
  }

  function dispose() {
    state.gameRunning = false
    spawning = false
    stopSpawnTimer()
    if (buffCooldownTimer) clearInterval(buffCooldownTimer)
    if (rafId) cancelAnimationFrame(rafId)
  }

  return {
    state,
    TIERS,
    TIER_ORDER,
    addLog,
    calculateDamage,
    getAttackInterval,
    sellPriceOf,
    summonUnit,
    summonTenTimes,
    massUpgradeSingle,
    massUpgradeFive,
    activateGlobalBuff,
    ascendFromBox,
    synthesizeUnit,
    sellUnit,
    ascendUnit,
    exchangeUnit,
    performApocalypseCombo,
    performMobiusCombo,
    unitCard,
    enemyHealthView,
    spawnEnemy,
    nextRound,
    setGameSpeed,
    attachCanvas,
    startGame,
    showExplanation,
    closeExplanation,
    onUnitAction,
    dispose
  }
}
