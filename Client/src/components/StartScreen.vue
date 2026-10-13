<script setup>
import { onMounted, ref } from 'vue'
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../game/constants.js'
import {
  clearToken,
  fetchProfile,
  loginAccount,
  logoutAccount,
  registerAccount,
  savedToken,
  saveToken
} from '../game/account.js'

const props = defineProps({
  account: { type: Object, default: null }
})
const emit = defineEmits(['start', 'explain', 'account'])

const selected = ref('normal')
const mode = ref('login')
const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

function isLocked(id) {
  if (!props.account) return id === 'hard' || id === 'impossible'
  return !props.account.unlocked?.[id]
}

function lockText(id) {
  if (id === 'hard') return '보통 클리어 후 해금'
  if (id === 'impossible') return '어려움 클리어 후 해금'
  return ''
}

function choose(id) {
  if (isLocked(id)) return
  selected.value = id
}

function start() {
  if (!props.account || isLocked(selected.value)) return
  emit('start', selected.value)
}

async function submit() {
  error.value = ''
  busy.value = true
  try {
    const result = mode.value === 'register'
      ? await registerAccount(username.value.trim(), password.value)
      : await loginAccount(username.value.trim(), password.value)
    saveToken(result.token)
    emit('account', { token: result.token, ...result.profile })
    password.value = ''
  } catch (err) {
    error.value = err.message || '로그인에 실패했습니다.'
  } finally {
    busy.value = false
  }
}

async function logout() {
  await logoutAccount(props.account?.token)
  clearToken()
  emit('account', null)
  selected.value = 'normal'
}

onMounted(async () => {
  const token = savedToken()
  if (!token) return
  try {
    const profile = await fetchProfile(token)
    emit('account', { token, ...profile })
  } catch {
    clearToken()
  }
})
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

      <form v-if="!account" class="auth-box" @submit.prevent="submit">
        <div class="auth-tabs">
          <button type="button" class="auth-tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">로그인</button>
          <button type="button" class="auth-tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">회원가입</button>
        </div>
        <label class="field-label" for="account-id">아이디</label>
        <input id="account-id" v-model="username" autocomplete="username" maxlength="16">
        <label class="field-label" for="account-pw">비밀번호</label>
        <input id="account-pw" v-model="password" type="password" autocomplete="current-password" maxlength="64">
        <p class="auth-error">{{ error }}</p>
        <button class="btn btn-primary auth-submit" type="submit" :disabled="busy">
          {{ mode === 'register' ? '가입하고 들어가기' : '로그인' }}
        </button>
      </form>

      <div v-else class="account-line">
        <strong id="menu-account">{{ account.displayName }}</strong>
        <button type="button" class="text-btn" @click="logout">로그아웃</button>
      </div>

      <div class="difficulty-list" role="listbox" aria-label="난이도">
        <button
          v-for="id in DIFFICULTY_ORDER"
          :key="id"
          type="button"
          class="diff-card"
          :class="[`diff-${id}`, { selected: selected === id, locked: isLocked(id) }]"
          :data-difficulty="id"
          :disabled="isLocked(id)"
          @click="choose(id)"
        >
          <span class="diff-name">{{ DIFFICULTIES[id].name }}</span>
          <span class="diff-meta">{{ DIFFICULTIES[id].detail }}</span>
          <span v-if="isLocked(id)" class="diff-lock">{{ lockText(id) }}</span>
        </button>
      </div>
      <div class="menu-actions">
        <button id="start-btn" class="btn btn-primary" :disabled="!account || isLocked(selected)" @click="start">게임 시작</button>
        <button class="btn btn-secondary" @click="emit('explain')">게임 설명</button>
      </div>
    </div>
  </div>
</template>
