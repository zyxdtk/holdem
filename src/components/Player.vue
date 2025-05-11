<template>
  <div class="player" :class="{
    active: player.isActive,
    folded: player.lastAction === 'fold',
    'is-winner': player.isWinner,
    'is-showdown': isShowdown
  }">
    <div class="player-name">
      {{ player.name }}
      <span v-if="player.isDealer" class="dealer-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#5D4037" stroke-width="1"/>
          <text x="12" y="16" font-size="10" font-weight="bold" text-anchor="middle" fill="#5D4037">D</text>
        </svg>
      </span>
    </div>
    <div class="chips">¥{{ player.chips }}</div>
    <div class="cards">
      <Card v-for="card in visibleCards" :key="card.id" :card="card" />
    </div>
    <div class="best-hand" v-if="isShowdown && player.isWinner">
      <div class="best-hand-label">最佳牌型:</div>
      <div class="best-hand-cards">
        <Card v-for="(card, index) in player.handValue?.cards" :key="index" :card="card" />
      </div>
    </div>
    <div class="player-status">
      <span>{{ getActionText(player.lastAction) }} ¥{{ player.currentBet }}</span>
      <span v-if="player.isWinner" class="winner-badge">WINNER</span>
    </div>
    <div v-if="isEditing" class="player-config">
      <div>
        <label>上桌: </label>
        <input type="checkbox" v-model="player.isActive">
      </div>
      <div>
        <label>游戏风格: </label>
        <select v-model="player.style">
          <option value="tight">紧</option>
          <option value="loose">松</option>
          <option value="aggressive">激进</option>
          <option value="conservative">保守</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-name {
  color: white;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
}

.cards {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 5px;
}

.player-status {
  color: white;
  font-size: 0.8rem;
  margin-top: 5px;
}

.current-bet {
  color: gold;
  font-size: 0.9rem;
  margin: 3px 0;
}

.player.folded {
  opacity: 0.6;
}

.player.checked .player-status {
  color: lightgreen;
}

.player.called .player-status {
  color: lightblue;
}

.player.raised .player-status {
  color: orange;
}

.player-status span[allin] {
  color: red;
  font-weight: bold;
}

.player-status span[small-blind] {
  color: #ffcc00;
}

.player-status span[big-blind] {
  color: #ff9900;
}

.player.is-winner {
  box-shadow: 0 0 15px gold;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.player.is-showdown .cards {
  opacity: 0.7;
}

.player:not(.active) {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.best-hand {
  margin-top: 5px;
  text-align: center;
}

.best-hand-label {
  color: gold;
  font-size: 0.8rem;
  margin-bottom: 3px;
}

.best-hand-cards {
  display: flex;
  justify-content: center;
  gap: 3px;
}

.winner-badge {
  display: inline-block;
  margin-left: 5px;
  padding: 2px 5px;
  background: gold;
  color: black;
  font-weight: bold;
  border-radius: 3px;
  font-size: 0.7rem;
}

.dealer-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  width: 18px;
  height: 18px;
}

.dealer-badge svg {
  filter: drop-shadow(0 0 2px rgba(0,0,0,0.3));
  width: 100%;
  height: 100%;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import Card from './Card.vue'
import type { Card as CardType } from '../services/types'

export default defineComponent({
  components: { Card },
  props: {
    player: {
      type: Object as () => {
        id: number
        name: string
        chips: number
        hand: CardType[]
        isDealer: boolean
        isActive: boolean
        currentBet: number
        isAllIn: boolean
        lastAction: string
        isWinner?: boolean
        winAmount?: number
        handValue?: {
          handType: number
          handRank: number
          value: number
          cards: CardType[]
        }
        isUser?: boolean // 新增字段
        style: string
      },
      required: true
    },
    isShowdown: {
      type: Boolean,
      default: false
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getActionText(action: string) {
      const actionMap: Record<string, string> = {
        'fold': '盖牌',
        'check': '看牌',
        'call': '跟注',
        'raise': '加注',
        'bet': '下注',
        'allin': '全押',
        'smallblind': '小盲',
        'bigblind': '大盲'
      }
      return actionMap[action] || '未行动'
    }
  },
  computed: {
    visibleCards() {
      // 在showdown阶段或当前玩家是用户时显示手牌
      return this.isShowdown || this.player.isUser ? this.player.hand || [] : []
    }
  }
})
</script>