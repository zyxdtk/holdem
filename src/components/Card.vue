<template>
  <div class="card" :class="cardClass">
    {{ cardValue }}
  </div>
</template>

<script>
export default {
  props: ['card'],
  computed: {
    cardClass() {
      return this.card.suit === '♥' || this.card.suit === '♦' ? 'red' : 'black'
    },
    cardValue() {
      return this.card ? `${this.card.rank}${this.card.suit}` : ''
    }
  }
}
</script>