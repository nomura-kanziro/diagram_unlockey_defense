<script setup>
import { onMounted, ref } from 'vue'
import { MAX_UNITS, SHAPES, SHAPE_LABEL, TIER_ORDER, TIERS } from '../game/constants.js'

const props = defineProps({
  game: { type: Object, required: true }
})

const canvasRef = ref(null)
const sellShape = ref('circle')
const sellTier = ref('normal')

onMounted(() => {
  props.game.attachCanvas(canvasRef.value)
})

function cardStyle(card) {
  if (card.canDoMobius) return { boxShadow: '0 0 14px #88ddff' }
  if (card.canDoApocalypse) return { boxShadow: '0 0 12px #ffcc00' }
  return {}
}

function levelColor(card) {
  if (card.canDoMobius) return '#88ddff'
  if (card.canDoApocalypse) return '#ffcc00'
  return '#888'
}
</script>

<template>
  <div id="game-screen" class="game-screen" :class="{ active: game.state.started }">
    <div class="top-ui">
      <div class="stat">
        <span>💰 골드:</span>
        <span id="gold-display" class="stat-value">{{ game.state.gold.toFixed(1) }}</span>
      </div>
      <div class="stat">
        <span>✦ 처치 포인트:</span>
        <span id="mob-point-display" class="stat-value">{{ game.state.mobKillPoint }}</span>
      </div>
      <div v-if="game.state.account" class="stat">
        <span id="account-display" class="stat-value">{{ game.state.account.displayName }}</span>
      </div>
      <div class="stat">
        <span>🎯 난이도:</span>
        <span id="difficulty-display" class="stat-value">{{ game.difficultyView().name }}</span>
      </div>
      <div class="stat">
        <span>📊 레벨:</span>
        <span id="level-display" class="stat-value">{{ game.state.currentLevel }}/{{ game.difficultyView().maxLevel }}</span>
      </div>
      <div class="stat">
        <span>⏱️ 라운드 시간:</span>
        <span
          id="time-display"
          class="stat-value"
          :style="{ color: game.state.isPrepPhase ? '#ffaa00' : '#00ffff' }"
        >{{ game.state.isPrepPhase ? game.state.timeLeft + ' (대기)' : game.state.timeLeft }}</span>
      </div>
      <div class="stat">
        <span>👾 적 수:</span>
        <span id="enemy-count" class="stat-value">{{ game.state.enemies.length }}/100</span>
      </div>
      <div>
        <button class="next-round-btn" @click="game.nextRound()">다음 라운드</button>
      </div>
      <div class="speed-wrap">
        <span class="speed-label">속도:</span>
        <button class="speed-btn" style="background:#555" @click="game.setGameSpeed(1)">1x</button>
        <button class="speed-btn" style="background:#ff8800" @click="game.setGameSpeed(2)">2x</button>
        <button class="speed-btn" style="background:#ff3300" @click="game.setGameSpeed(4)">4x</button>
        <button class="speed-btn" style="background:#cc0000" @click="game.setGameSpeed(6)">6x</button>
      </div>
    </div>

    <div class="main-area">
      <div class="field-wrap">
        <canvas id="game-canvas" ref="canvasRef" width="700" height="700"></canvas>
      </div>

      <div class="sidebar">
        <div class="action-panel">
          <div class="action-title">유닛 소환 (10원)</div>
          <button class="summon-btn" @click="game.summonUnit()">🎲 랜덤 소환</button>
          <div class="hint">확률에 따라 고등급 유닛 등장!</div>
          <button class="summon-btn ten-summon" @click="game.summonTenTimes()">🎁 10연차 소환 (100원)</button>
          <div class="hint-gold">11개 소환 + 1개 공짜!</div>
        </div>

        <div class="action-panel">
          <div class="action-title">유닛 강화</div>
          <div class="upgrade-row">
            <div class="upgrade-actions">
              <button class="exchange-btn" style="background:#00aa66" @click="game.massUpgradeSingle()">
                1단위 강화
              </button>
              <button class="exchange-btn" style="background:#ff8800" @click="game.massUpgradeFive()">
                5단위 강화 (20% 확률)
              </button>
            </div>
            <div class="enhance-price-board" aria-live="polite">
              <div class="enhance-price-label">현재 가격</div>
              <div class="enhance-price-value">{{ game.state.currentEnhanceCost }}원</div>
            </div>
          </div>
          <div class="panel-note">1단위는 3번마다 +1원 · 5단위는 매번 +3원</div>
          <button id="buff-btn" class="exchange-btn" style="background:#aa00ff" @click="game.activateGlobalBuff()">
            버프 (전체 데미지 300%, 30원, 50초 쿨)
          </button>
          <div id="buff-cooldown" class="buff-cooldown">{{ game.state.buffCooldownText }}</div>
        </div>

        <div class="action-panel">
          <div class="action-title">승천 (기능상자)</div>
          <button class="exchange-btn" style="background:#00aaff; margin:4px 0" @click="game.ascendFromBox('epic')">
            서사 → 전설 (100원, 100%)
          </button>
          <button class="exchange-btn" style="background:#ffcc00; color:#000; margin:4px 0" @click="game.ascendFromBox('legendary')">
            전설 → 신화 (200원, 75%)
          </button>
          <button class="exchange-btn" style="background:#ff0000; margin:4px 0" @click="game.ascendFromBox('mythic')">
            신화 → 대천 (250원, 60%)
          </button>
          <div class="panel-note">해당 등급 유닛 1개를 승천시킵니다.</div>
        </div>

        <div class="action-panel" id="sell-panel">
          <div class="action-title">유닛 판매 및 합성</div>
          <div class="sell-filters">
            <select id="sell-shape" v-model="sellShape" aria-label="모양">
              <option v-for="shape in SHAPES" :key="shape" :value="shape">{{ SHAPE_LABEL[shape] }}</option>
            </select>
            <select id="sell-tier" v-model="sellTier" aria-label="등급">
              <option v-for="key in TIER_ORDER" :key="key" :value="key">{{ TIERS[key].name }}</option>
            </select>
          </div>
          <div class="sell-summary">
            {{ SHAPE_LABEL[sellShape] }} {{ TIERS[sellTier].name }} {{ game.sellBundleView(sellShape, sellTier).count }}개
            · 판매 {{ game.sellBundleView(sellShape, sellTier).total }}원
            · 합성 {{ game.synthBundleView(sellShape, sellTier).sets }}회
          </div>
          <button
            id="sell-all-btn"
            class="action-btn sell-btn sell-all-btn"
            :disabled="!game.sellBundleView(sellShape, sellTier).ready"
            @click="game.sellMatchingUnits(sellShape, sellTier)"
          >전부 팔기</button>
          <button
            id="synth-all-btn"
            class="action-btn synth-all-btn"
            :disabled="!game.synthBundleView(sellShape, sellTier).ready"
            @click="game.synthesizeMatchingUnits(sellShape, sellTier)"
          >전부 합치기</button>
          <div class="panel-note">고른 모양과 등급만 판매하거나 합성합니다. 전설 이상은 판매할 수 없습니다.</div>
        </div>

        <div class="action-panel">
          <div class="action-title">소환된 유닛 (<span id="unit-count">{{ game.state.units.length }}</span>/{{ MAX_UNITS }})</div>
          <div id="unit-list" class="unit-list">
            <div v-if="game.state.units.length === 0" class="empty-units">소환된 유닛이 없습니다</div>
            <div
              v-for="unit in game.state.units"
              :key="unit.id"
              class="unit-card"
              :class="game.unitCard(unit).tier.class"
              :style="cardStyle(game.unitCard(unit))"
            >
              <div class="unit-header">
                <span class="tier" :class="game.unitCard(unit).tier.class">{{ game.unitCard(unit).shapeLabel }} {{ game.unitCard(unit).tier.name }}</span>
                <span
                  :style="{
                    fontSize: '0.75rem',
                    color: levelColor(game.unitCard(unit)),
                    fontWeight: game.unitCard(unit).canDoMobius || game.unitCard(unit).canDoApocalypse ? 'bold' : 'normal'
                  }"
                >Lv.{{ unit.level }}</span>
              </div>
              <div class="unit-stats">
                데미지: <strong style="color:#ffcc00">{{ game.unitCard(unit).dmg }}</strong><br>
                공격속도: <strong>{{ (game.unitCard(unit).interval / 1000).toFixed(2) }}초</strong>
                <span v-if="game.unitCard(unit).tier.aoe" style="color:#ff8800">• 범위</span>
                <span v-if="game.unitCard(unit).tier.ignoreDef" style="color:#ff0000">• 방어무시</span>
              </div>
              <div class="unit-actions">
                <button
                  v-if="game.unitCard(unit).action === 'mobius'"
                  class="action-btn upgrade-btn"
                  style="background:#88ddff; color:#000; flex:1"
                  @click="game.onUnitAction(unit, 'mobius')"
                >♾️ 뫼비우스 조합 (버프 ON)</button>
                <button
                  v-else-if="game.unitCard(unit).action === 'apocalypse'"
                  class="action-btn upgrade-btn"
                  style="background:#ffcc00; color:#000; flex:1"
                  @click="game.onUnitAction(unit, 'apocalypse')"
                >🌌 종말 조합</button>
                <template v-else-if="game.unitCard(unit).action === 'synthesize-sell'">
                  <button class="action-btn upgrade-btn" style="background:#00aaff; flex:1; margin-right:4px" @click="game.onUnitAction(unit, 'synthesize')">{{ game.unitCard(unit).shapeLabel }} 합성 (3→1)</button>
                  <button class="action-btn sell-btn" style="flex:1" @click="game.onUnitAction(unit, 'sell')">판매</button>
                </template>
                <button
                  v-else-if="game.unitCard(unit).action === 'synthesize'"
                  class="action-btn upgrade-btn"
                  style="background:#00aaff"
                  @click="game.onUnitAction(unit, 'synthesize')"
                >{{ game.unitCard(unit).shapeLabel }} 합성 (3→1)</button>
                <button
                  v-else-if="game.unitCard(unit).action === 'ascend'"
                  class="action-btn upgrade-btn"
                  style="background:#ffaa00; color:#000"
                  @click="game.onUnitAction(unit, 'ascend')"
                >승천</button>
                <button
                  v-else-if="game.unitCard(unit).action === 'sell'"
                  class="action-btn sell-btn"
                  @click="game.onUnitAction(unit, 'sell')"
                >판매</button>
                <div v-else class="top-grade">최고 등급</div>
              </div>
              <div v-if="game.unitCard(unit).skill" class="unit-actions">
                <button
                  v-if="game.unitCard(unit).skill === 'lightning'"
                  class="action-btn skill-btn"
                  @click="game.onUnitAction(unit, 'lightning')"
                >뇌전</button>
                <button
                  v-else
                  class="action-btn skill-btn ruin-btn"
                  :disabled="game.unitCard(unit).skillUsed"
                  @click="game.onUnitAction(unit, 'ruin')"
                >파멸의 일격</button>
              </div>
            </div>
          </div>
        </div>

        <div class="action-panel compact-panel">
          <div class="action-title" style="margin-bottom:6px">🎲 소환 확률</div>
          <div id="prob-list" style="line-height:1.35; color:#ccc">
            <div v-for="key in game.TIER_ORDER" :key="key" class="prob-row">
              <span :style="{ color: game.TIERS[key].color }">{{ game.TIERS[key].name }}</span>
              <span style="color:#aaa">{{ game.TIERS[key].prob }}%</span>
            </div>
          </div>
        </div>

        <div class="action-panel compact-panel">
          <div class="action-title" style="margin-bottom:6px">👾 적 체력</div>
          <div id="enemy-health-info" class="enemy-info">
            일반 적: <strong>{{ game.enemyHealthView().normal }}</strong>
            <template v-if="game.enemyHealthView().bossOnField">
              <br>보스: <strong style="color:#ff6666">{{ game.enemyHealthView().bossOnField.health }} / {{ game.enemyHealthView().bossOnField.maxHealth }}</strong>
              <template v-if="game.enemyHealthView().bossOnField.maxShield > 0">
                <br>쉴드: <strong style="color:#7ecbff">{{ game.enemyHealthView().bossOnField.shield }} / {{ game.enemyHealthView().bossOnField.maxShield }}</strong>
              </template>
            </template>
            <template v-else-if="game.enemyHealthView().showExpected">
              <br>보스 (예상): <strong style="color:#ff6666">{{ game.enemyHealthView().expected }}</strong>
              <span style="color:#888"> ({{ game.enemyHealthView().bossMult }}배)</span>
            </template>
            <br>방어력: <strong>{{ game.enemyHealthView().defense }}</strong>
            <span style="color:#888"> ({{ game.enemyHealthView().defense * 0.5 }}% 감소)</span>
          </div>
        </div>

        <div class="action-panel">
          <div class="action-title">게임 로그</div>
          <div id="log" class="log">
            <template v-for="(line, index) in game.state.logMessages" :key="index">
              {{ line }}<br>
            </template>
          </div>
        </div>

        <div class="action-panel" id="collection-panel">
          <div class="action-title">컬렉션</div>
          <div
            v-for="item in game.collectionView()"
            :key="item.id"
            class="collection-row"
          >
            <div class="collection-copy">
              <div class="collection-name">{{ item.title }}</div>
              <div class="collection-detail">{{ item.detail }}</div>
            </div>
            <button
              class="collection-btn"
              :data-collection="item.id"
              :disabled="!item.ready"
              @click="game.claimCollection(item.id)"
            >{{ item.claimed ? '달성됨' : '달성 완료' }}</button>
          </div>
        </div>
      </div>

      <div id="bottom-log-panel" class="bottom-log-panel">
        <div style="color:#00ff88; font-weight:bold; margin-bottom:6px; font-size:0.85rem">📜 게임 로그</div>
        <div id="bottom-log">
          <template v-for="(line, index) in game.state.bottomLogs" :key="index">
            {{ line }}<br>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
