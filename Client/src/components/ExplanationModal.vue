<script setup>
defineEmits(['close'])
</script>

<template>
  <div id="explanation-modal" class="modal open">
    <div class="modal-content">
      <h2 class="modal-title">게임 설명</h2>
      <div class="explain-body">
        <p><strong>목표:</strong> 고른 난이도의 마지막 레벨을 클리어하세요. 보통은 200레벨입니다.</p>
        <p><strong>기본 규칙:</strong></p>
        <ul>
          <li>외곽 원형 라인에 적이 빙빙 돕니다. 적이 100마리 이상 쌓이면 패배!</li>
          <li>안쪽 원 안에 유닛을 소환해 적을 처치하세요.</li>
          <li>유닛은 <strong>랜덤 소환</strong> (10원)으로만 얻을 수 있습니다. (극악의 운빨)</li>
          <li>고등급 유닛일수록 공격속도가 빠르고 데미지가 강합니다.</li>
          <li>50레벨부터 적에게 방어력이 생깁니다 (5% 감소, 방어무시 유닛 제외).</li>
        </ul>
        <p><strong>주요 행동:</strong></p>
        <ul>
          <li><strong>강화:</strong> 유닛 레벨업 (최대 200레벨, 비용 점점 증가)</li>
          <li><strong>판매:</strong> 하위~서사등급만 가능</li>
          <li><strong>교환:</strong> 전설 이상 유닛을 더 높은 등급으로 바꿀 수 있음 (확률 있음)</li>
        </ul>
        <p><strong>특수 구간:</strong></p>
        <ul>
          <li>보스 라운드 (30,65,87...): 보스 1마리, 체력 15배, 시간 5분</li>
          <li>데스매치 (175~198): 8마리 강적, 5분 제한</li>
          <li>199~200레벨: 보통의 최종 보스</li>
          <li>쉬움은 150레벨, 체력은 보통의 2/3입니다. 어려움은 250레벨이고 체력은 1.5배, 6번째 보스부터 쉴드가 있습니다. 불가능은 300레벨이고 체력은 2배, 4번째 보스부터 쉴드가 있으며 쉴드가 깨진 뒤 5초면 다시 찹니다.</li>
          <li>쉴드가 남아 있으면 보스의 일반 체력은 줄지 않습니다. 쉴드 체력은 그 보스 일반 체력의 8분의 1입니다.</li>
        </ul>
        <p class="explain-note">※ 이 프로토타입은 핵심 메커니즘을 구현한 버전입니다. 실제 게임과 유사하게 즐겨보세요!</p>
      </div>
      <button class="close-modal" @click="$emit('close')">닫기</button>
    </div>
  </div>
</template>
