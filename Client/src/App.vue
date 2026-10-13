<script setup>
import { onMounted, onUnmounted } from 'vue'
import { createGame } from './game/engine.js'
import StartScreen from './components/StartScreen.vue'
import GameScreen from './components/GameScreen.vue'
import ExplanationModal from './components/ExplanationModal.vue'

const game = createGame()
if (import.meta.env.DEV) window.__MAPLE_GAME__ = game

function onKey(event) {
  if (!game.state.gameRunning) return
  if (event.key === 's' || event.key === 'S') game.summonUnit()
  if (event.key === 'n' || event.key === 'N') game.nextRound()
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  console.log('%c[메이플 운빨 디펜스] 프로토타입 로드 완료. S키 = 소환, N키 = 다음 라운드', 'color:#0f0')
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  game.dispose()
})
</script>

<template>
  <div class="container">
    <StartScreen
      v-show="!game.state.started"
      @start="game.startGame()"
      @explain="game.showExplanation()"
    />
    <GameScreen :game="game" />
    <ExplanationModal v-if="game.state.explanationOpen" @close="game.closeExplanation()" />
  </div>
</template>
