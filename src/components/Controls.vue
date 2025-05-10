<template>
  <div class="controls">
    <button 
      v-if="gameStage === 'waiting'"
      @click="startGame"
    >
      开始游戏
    </button>
    <button 
      v-else-if="gameStage === 'showdown'"
      @click="nextRound"
    >
      下一局
    </button>
    <div v-else-if="isUser" class="action-buttons" >
      <button @click="fold">弃牌</button>
      <button @click="checkCall">跟注/看牌</button>
      <div class="raise-control">
        <input 
          v-model.number="raiseAmount" 
          type="number" 
          min="0" 
          :max="maxRaise"
          placeholder="加注金额"
        >
        <button @click="betRaise">加注</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      raiseAmount: 0
    }
  },
  computed: {
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
      return player? player.isUser : false
    }
  },
  methods: {
    async startGame() {
      await this.$store.dispatch('startGame')
    },
    async nextRound() {
      await this.$store.dispatch('nextRound')
    },
    async fold() {
      await this.$store.dispatch('playerAction', { type: 'fold', amount: 0} )
      await this.$store.dispatch('progressGame')
    },
    async checkCall() {
      await this.$store.dispatch('playerAction', { type: 'checkCall', amount: 0} )
      await this.$store.dispatch('progressGame')
    },
    async betRaise() {
      await this.$store.dispatch('playerAction', { type: 'raise', amount: this.raiseAmount || 0} )
      this.raiseAmount = 0 // 重置加注金额
      await this.$store.dispatch('progressGame')
    }
  }
}
</script>

<style scoped>
.controls {
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
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
  background: rgba(0,0,0,0.7);
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
</style>