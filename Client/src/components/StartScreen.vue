<script setup>
defineEmits(['start', 'explain'])
</script>

<template>
  <div id="start-screen" class="start-screen">
    <div class="shape-field" aria-hidden="true">
      <span class="geo geo-circle"></span>
      <span class="geo geo-triangle"></span>
      <span class="geo geo-square"></span>
      <span class="geo geo-circle geo-small"></span>
      <span class="geo geo-square geo-small"></span>
    </div>
    <div class="menu-card">
      <div class="menu-mark" aria-hidden="true">
        <span class="mark-circle"></span>
        <span class="mark-triangle"></span>
        <span class="mark-square"></span>
      </div>
      <p class="menu-kicker">SHAPE LUCK DEFENSE</p>
      <h1 class="game-title">도형 운빨 디펜스</h1>
      <p class="tagline">원, 삼각, 사각을 뽑아 궤도 위의 적을 막는다.</p>
      <div class="menu-actions">
        <button class="btn btn-primary" @click="$emit('start')">게임 시작</button>
        <button class="btn btn-secondary" @click="$emit('explain')">게임 설명</button>
      </div>
    </div>
  </div>
</template>
