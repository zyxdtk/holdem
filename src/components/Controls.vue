<template>
  <div class="controls">
    <div v-if="gameStage === 'waiting'" class="config-controls">
      <div class="config-row">
        <div>
          <label>玩家数: {{ playerCount }}</label>
          <input type="range" v-model.number="playerCount" min="2" max="12" step="1" class="player-slider">
        </div>
        <div>
          <input type="number" v-model.number="minBuyin" min="0">
          <button @click="resetPlayerBuyins">重置买入</button>
        </div>
        <div class="toggle-container">
          <label>游戏模式: </label>
          <label class="toggle-switch">
            <input type="checkbox" v-model="gameMode" true-value="auto" false-value="manual">
            <span class="slider round"></span>
          </label>
          <span class="toggle-label">{{ gameMode === 'auto' ? '自动' : '手动' }}</span>
        </div>
      </div>
      <div class="config-row">
        <button @click="resetDealer">重置庄位</button>
        <button @click="startGame">进入游戏</button>
      </div>
    </div>

    <div v-if="gameStage === 'showdown'" class="game-controls">
      <button @click="enterEditMode">
        进入编辑模式
      </button>
      <button @click="nextRound">
        下一局
      </button>
      <input v-model.number="autoRounds" type="number" min="1" placeholder="局数">
    </div>
    <div v-else-if="isUser" class="action-buttons">
      <button @click="fold">弃牌</button>
      <button @click="checkCall">跟注/看牌</button>
      <div class="raise-control">
        <input v-model.number="raiseAmount" type="number" min="0" :max="maxRaise" placeholder="加注金额">
        <button @click="betRaise">加注</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      raiseAmount: 0,
      minBuyin: 1000, // 默认最小买入额
      autoRounds: 1 // 自动局数
    }
  },
  computed: {
    playerCount: {
      get() {
        return this.$store.state.players.filter(p => p.isActive).length
      },
      set(value) {
        this.$store.commit('SET_PLAYER_COUNT', value)
      }
    },
    gameMode: {
      get() {
        return this.$store.state.players[0].isUser ? 'manual' : 'auto'
      },
      set(value) {
        this.$store.commit('SET_GAME_MODE', value)
      }
    },
    gameStage() {
      return this.$store.state.table.gameStage
    },
    gameLogs() {
      return this.$store.state.gameLogs.slice().reverse()
    },
    maxRaise() {
      const player = this.$store.state.players.find(p => p.id === this.$store.state.table.currentPlayer)
      return player ? player.chips : 0
    },
    isUser() {
      const player = this.$store.state.players.find(p => p.id === this.$store.state.table.currentPlayer)
      return player ? player.isUser : false
    }
  },
  methods: {
    resetPlayerBuyins() {
      this.$store.commit('RESET_PLAYER_BUYINS', this.minBuyin)
    },
    resetDealer() {
      this.$store.commit('RESET_DEALER_POSITION')
    },
    async startGame() {
      await this.$store.dispatch('startGame')
    },
    async nextRound() {
      if (this.$store.state.players[0].isUser) {
        await this.$store.dispatch('nextRound')
      } else {
        for (let i = 0; i < this.autoRounds; i++) {
          await this.$store.dispatch('nextRound')
          console.log(`第 ${i + 1} 局完成`)
        }
      }
    },
    async fold() {
      await this.$store.dispatch('playerAction', { action: { type: 'fold', amount: 0 } })
      await this.$store.dispatch('progressGame')
    },
    async checkCall() {
      await this.$store.dispatch('playerAction', { action: { type: 'checkCall', amount: 0 } })
      await this.$store.dispatch('progressGame')
    },
    async betRaise() {
      await this.$store.dispatch('playerAction', { action: { type: 'raise', amount: this.raiseAmount || 0 } })
      this.raiseAmount = 0 // 重置加注金额
      await this.$store.dispatch('progressGame')
    },
    enterEditMode() {
      this.$store.commit('SET_GAME_STAGE', 'waiting')
    },
  }
}
</script>

<style scoped>
.controls {
  position: absolute;
  bottom: 35%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.config-controls {
  display: flex;
  gap: 1px;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.config-row {
  display: flex;
  flex-direction: column;
}

.config-controls>div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.config-controls label {
  color: white;
}

.config-controls input,
.config-controls select {
  width: 80px;
  padding: 5px;
  border-radius: 3px;
  border: none;
}

button {
  padding: 8px 16px;
  margin: 0 5px;
  background-color: #5d4037;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.game-log {
  position: absolute;
  bottom: 60px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
  width: 300px;
}

.raise-control {
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
}

.raise-control input {
  width: 80px;
  padding: 5px;
  margin-right: 5px;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #5d4037;
  transition: .4s;
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked+.slider {
  background-color: #8bc34a;
}

input:checked+.slider:before {
  transform: translateX(26px);
}

.toggle-label {
  color: white;
  font-size: 0.9rem;
}
</style>