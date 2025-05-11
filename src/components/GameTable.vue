<template>
  <div class="poker-table">
    <div class="table-surface">
      <div v-if="gameStage !== 'waiting'" class="community-cards-area">
        <Card
          v-for="(card, index) in communityCards"
          :key="index"
          :card="card"
        />
      </div>
      <div v-if="gameStage !== 'waiting'" class="pot-display">
        底池: ¥{{ pot }}
      </div>
      <div class="players-container">
        <Player 
          v-for="player in players"
          :key="player.id"
          :player="player"
          :isShowdown="gameStage === 'showdown'"
          :isEditing="gameStage === 'waiting'"
        ></Player>
      </div>
      <Controls />
    </div>
    
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import Player from './Player.vue'
import Controls from './Controls.vue'
import Card from './Card.vue'
import type { Card as CardType } from '../services/types'

export default defineComponent({
  components: { Player, Controls, Card },
  computed: {
    communityCards(): CardType[] { 
      return this.$store.state.table.communityCards
    },
    players() {
      return this.$store.state.players
    },
    pot() {
      return this.$store.state.table.pot
    },
    gameStage() {
      return this.$store.state.table.gameStage
    },
  }
})
</script>

<style scoped>
/* 添加赢家高亮样式 */
.player.is-winner {
  box-shadow: 0 0 15px gold;
  transform: scale(1.05);
  transition: all 0.3s ease;
}
.poker-table {
  position: relative;
  width: 100vw;
  height: 100vh;
  margin: 0;
  background-color: #0a5c36;
  border-radius: 30px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.table-surface {
  position: absolute;
  width: 95%;
  height: 95%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #0a5c36;
  border: 5px solid #5d4037;
  border-radius: 30px;
}

.community-cards-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 1px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  padding: 1px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  width: calc(60px * 5 + 1px * 4); /* 5张牌宽度 + 4个间隙 */
  height: 90px;
  justify-content: center;
}

.card-placeholder {
  width: 60px;
  height: 90px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

.players-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.player {
  position: absolute;
  transform-origin: center;
}

/* 动态计算13个玩家位置 */
.player:nth-child(1) { bottom: 5%; left: 50%; transform: translateX(-50%); }
.player:nth-child(2) { bottom: 5%; left: 25%; }
.player:nth-child(3) { bottom: 5%; left: 5%; }
.player:nth-child(4) { top: 50%; left: 5%;  transform: translateY(-50%); }
.player:nth-child(5) { top: 5%; left: 5%; }
.player:nth-child(6) { top: 5%; left: 25%; }
.player:nth-child(7) { top: 5%; left: 50%; transform: translateX(-50%); }
.player:nth-child(8) { top: 5%; right: 25%; }
.player:nth-child(9) { top: 5%; right: 5%; }
.player:nth-child(10) { top: 50%; right: 5%;  transform: translateY(-50%);}
.player:nth-child(11) { bottom: 5%; right: 5%; }
.player:nth-child(12) { bottom: 5%; right: 25%;  }

.pot-display {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, 50px);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 20px;
}


</style>