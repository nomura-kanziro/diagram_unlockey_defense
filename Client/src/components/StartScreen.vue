<script setup>
defineEmits(['start', 'explain'])
</script>

<template>
  <div id="start-screen" class="start-screen">
    <div class="start-inner">
      <h1 class="game-title">메이플 운빨 디펜스</h1>
      <p class="tagline">운으로 뽑고, 전략으로 버티는 디펜스</p>
      <button class="btn btn-primary" @click="$emit('start')">게임 시작</button>
      <button class="btn btn-secondary" @click="$emit('explain')">게임 설명</button>
    </div>
  </div>
</template>
