import { createStore } from 'vuex'
import { Player, GameLog, GameState, STAGES, PlayerAction } from '../services/types'
import { createGameState, createDeck, shuffleDeck, addLog } from '../services/poker'
import { evaluateHand } from '../services/evaluation'

export default createStore<GameState>({
    state: createGameState(),
    mutations: {
        ADD_LOG(state, log: string) {
            addLog(state, log)
        },
        // 设置玩家列表
        SET_PLAYERS(state, players: Player[]) {
            state.players = players
        },
        // 设置指定位置玩家
        SET_PLAYER(state, { playerId, player }) {
            const index = state.players.findIndex(p => p.id === playerId)
            if (index !== -1) {
                state.players[index] = player
            } else {
                console.error(`Player with id ${playerId} not found`)
                throw new Error(`Player with id ${playerId} not found`)
            }
        },
        // ------- 游戏流程方法 --------
        // 准备新游戏
        NEW_GAME(state) {
            // 重置所有玩家筹码
            state.players.forEach(player => {
                player.chips = 1000
                player.buyin = 1000
            })
            addLog(state, '重置玩家buyin, 开始新游戏')   
        },
        // 准备下一局游戏
        NEXT_ROUND(state) {
            // 重置牌桌状态
            state.table.deck = shuffleDeck(createDeck())
            state.table.communityCards = []
            state.table.currentBet = 0
            state.table.pot = 0
            state.table.sidePots = []
            state.table.gameStage = 'waiting'
            // 移动dealer
            let dealerPosition = state.table.dealerPosition
            while (true) {
                dealerPosition = (dealerPosition % state.players.length) + 1
                const player = state.players.find(p => p.id === dealerPosition)
                if (player && player.chips > 0) {
                    state.table.dealerPosition = dealerPosition
                    break
                }
            }
            state.table.currentPlayer = state.table.dealerPosition
            // 重置玩家手牌和状态
            state.players.forEach(player => {
                player.isDealer = player.id === state.table.dealerPosition
                player.hand = []
                player.currentBet = 0
                player.isAllIn = false
                player.lastAction = ''
                player.isActive = player.chips > 0
                player.isWinner = false
                player.winAmount = 0
                player.handValue = undefined
            })
            addLog(state, '重置牌桌状态, 开始下一局游戏')
        },
        // 移动到下一个活跃玩家
        NEXT_PLAYER(state) {
            let playerId = state.table.currentPlayer
            while (true) {
                playerId = (playerId % state.players.length) + 1
                const player = state.players.find(p => p.id === playerId)
                if (!player) {
                    console.error(`Player with id ${playerId} not found`)
                    throw new Error(`Player with id ${playerId} not found`)
                    return
                }
                if (player.isActive) {
                    state.table.currentPlayer = playerId
                    break
                }
            }
        },
        // 进入下一个阶段
        NEXT_STAGE(state) {
            const currentIndex = STAGES.indexOf(state.table.gameStage)
            if (currentIndex < STAGES.length - 1) {
                state.table.gameStage = STAGES[currentIndex + 1]
                state.table.currentBet = 0
                state.table.currentPlayer = state.table.dealerPosition
                state.players.forEach(player => {
                    player.currentBet = 0
                    player.lastAction = ''
                })
            } else {
                console.error('Invalid stage transition')
                throw new Error('Invalid stage transition')
            }
            addLog(state, `进入${state.table.gameStage}阶段`)
        },
        // 发牌
        DEAL_CARDS(state) {
            const stage = state.table.gameStage
            console.log('Dealing cards for stage:', stage)
            if (stage === 'preflop') {
                state.players.forEach(player => {
                    if (player.isActive) {
                        const deck = state.table.deck
                        player.hand = [deck.pop(), deck.pop()]
                    }
                })
            } else if (stage === 'flop') {
                const cards = [state.table.deck.pop(), state.table.deck.pop(), state.table.deck.pop()]
                state.table.communityCards.push(...cards)
                addLog(state, `Flop: ${cards.map(card => card.rank + card.suit).join(', ')}`)
            } else if (stage === 'turn' || stage === 'river') {
                const card = state.table.deck.pop()
                state.table.communityCards.push(card)
                addLog(state, `${stage.charAt(0).toUpperCase() + stage.slice(1)}: ${card.rank + card.suit}`)
            } else {
                console.error('Invalid stage for dealing cards')
                throw new Error('Invalid stage for dealing cards')
            }
        },
        // 下大小盲注
        DEAL_BLIND(state, commit) {
            // 找到小盲位置
            let smallBlindPos = (state.table.dealerPosition % state.players.length) + 1
            while (!state.players[smallBlindPos - 1].isActive) {
                smallBlindPos = (smallBlindPos % state.players.length) + 1
            }

            // 找到大盲位置
            let bigBlindPos = (smallBlindPos % state.players.length) + 1
            while (!state.players[bigBlindPos - 1].isActive) {
                bigBlindPos = (bigBlindPos % state.players.length) + 1
            }

            // 下小盲注
            const smallBlindPlayer = state.players[smallBlindPos - 1]
            const smallBlindAmount = Math.min(state.table.smallBlind, smallBlindPlayer.chips)
            smallBlindPlayer.chips -= smallBlindAmount
            smallBlindPlayer.currentBet = smallBlindAmount
            smallBlindPlayer.lastAction = 'smallblind'
            state.table.pot += smallBlindAmount
            addLog(state, `Player ${smallBlindPlayer.id} small blind ${smallBlindAmount} chips`)

            // 下大盲注
            const bigBlindPlayer = state.players[bigBlindPos - 1]
            const bigBlindAmount = Math.min(state.table.bigBlind, bigBlindPlayer.chips)
            bigBlindPlayer.chips -= bigBlindAmount
            bigBlindPlayer.currentBet = bigBlindAmount
            bigBlindPlayer.lastAction = 'bigblind'
            state.table.pot += bigBlindAmount
            addLog(state, `Player ${bigBlindPlayer.id} big blind ${bigBlindAmount} chips`)

            // 设置当前最高下注为大盲注金额
            state.table.currentBet = bigBlindAmount
            // 设置当前行动玩家为大盲注后面的玩家
            state.table.currentPlayer = bigBlindPos
        },
        // 下注
        PLACE_BET(state, { playerId, amount, action }) {
            const player = state.players.find(p => p.id === playerId)
            if (!player || !player.isActive) {
                console.error(`Player with id ${playerId} is not active or not found`)
                throw new Error(`Player with id ${playerId} is not active or not found`)
                return
            }
            if (amount > player.chips) {
                console.error(`Player with id ${playerId} does not have enough chips to bet ${amount}`)
                throw new Error(`Player with id ${playerId} does not have enough chips to bet ${amount}`)
                return
            }

            if (action === 'fold') {
                player.isActive = false
                player.lastAction = 'fold'
            } else {
                player.currentBet += amount
                player.chips -= amount
                player.lastAction = action
                state.table.pot += amount
                state.table.currentBet = Math.max(state.table.currentBet, player.currentBet)
            }
            addLog(state, `Player ${playerId} ${action} ${amount} chips`)
        },
    },
    actions: {
        // ------- 游戏流程方法 --------
        // 开始游戏
        async startGame({ commit, dispatch, state }) {
            commit('NEW_GAME')
            commit('NEXT_ROUND')
            await dispatch('progressGame')
        },
        // 下一局游戏
        async nextRound({ commit, dispatch, state }) {
            commit('NEXT_ROUND')
            await dispatch('progressGame')
        },
        // 推进游戏。一直循环直到游戏结束或者轮到用户操作。
        async progressGame({ commit, dispatch, state }) {
            let status = true
            while (status) {
                // 移动到下一个玩家
                commit('NEXT_PLAYER')
                // 获取当前玩家时添加null检查
                const currentPlayer = state.players.find(p => p.id === state.table.currentPlayer)
                if (!currentPlayer) {
                    console.error('Current player not found')
                    throw new Error('Current player not found')
                }
                // 判定当前stage是否结束，如果结束，处理stage结束。如果没有结束，执行玩家行动。
                const { isEnd, reason } = await dispatch('isStageEnd')
                if (isEnd) {
                    commit('NEXT_STAGE')
                    const activePlayers = state.players.filter(p => p.isActive)
                    if (state.table.gameStage === 'showdown' || activePlayers.length === 1) {
                        // 游戏结束, 结算筹码，退出
                        await dispatch('settleChips')
                        commit('ADD_LOG', '本局游戏结束')
                        return
                    }
                    commit('DEAL_CARDS')
                    if (state.table.gameStage === 'preflop') {
                        commit('DEAL_BLIND')
                    }
                } else if (currentPlayer.isUser) {
                    // 轮到用户玩家，退出，等待用户操作
                    return
                } else {
                    // 执行bot玩家行动
                    await dispatch('botPlayerAction')
                }
            }
        },
        isStageEnd({ state }) {
            if (state.table.gameStage === 'waiting') {
                return { isEnd: true, reason: "等待阶段" }
            }
            const currentPlayer = state.players.find(p => p.id === state.table.currentPlayer)
            if (!currentPlayer || !currentPlayer.isActive) {
                return { isEnd: false, reason: "非活跃玩家" }
            }
            const activePlayers = state.players.filter(p => p.isActive)
            if (activePlayers.length === 1) {
                return { isEnd: true, reason: "唯一活跃玩家" }
            }
            if (currentPlayer.lastAction === '' || currentPlayer.lastAction === 'smallblind' || currentPlayer.lastAction === 'bigblind') {
                return { isEnd: false, reason: "没有行动" }
            }
            if (currentPlayer.currentBet < state.table.currentBet) {
                return { isEnd: false, reason: "未跟进最高出价" }
            }
            if (currentPlayer.currentBet > state.table.currentBet) {
                throw new Error('当前玩家的出价高于本轮的currentBet')
            }
            return { isEnd: true, reason: "多人活跃" }
        },
        // 结算筹码
        settleChips({ state, commit }) {
            // 计算边池
            state.table.sidePots = []
            const activePlayers = state.players.filter(p => p.isActive)
            if (activePlayers.length === 0) {
                commit('ADD_LOG', '没有活跃玩家，本局游戏结束')
                throw new Error('没有活跃玩家，本局游戏结束')
            }
            const evaluatedPlayers = activePlayers.map(player => {
                player.handValue = evaluateHand(player.hand, state.table.communityCards)
                return player
            })
            evaluatedPlayers.sort((a, b) => {
                if (a.handValue.handType !== b.handValue.handType) {
                    return b.handValue.handType - a.handValue.handType
                }
                return b.handValue.handRank - a.handValue.handRank
            })

            // 按玩家当前下注金额排序
            const sortedPlayers = [...activePlayers].sort((a, b) => a.currentBet - b.currentBet)

            let remainingPot = state.table.pot
            let lastBet = 0

            sortedPlayers.forEach(player => {
                if (player.currentBet > lastBet) {
                    const betDiff = player.currentBet - lastBet
                    const eligiblePlayers = activePlayers
                        .filter(p => p.currentBet >= player.currentBet)
                        .map(p => p.id)

                    if (eligiblePlayers.length > 0) {
                        const sidePotAmount = betDiff * eligiblePlayers.length
                        state.table.sidePots.push({
                            amount: sidePotAmount,
                            eligiblePlayers
                        })
                        remainingPot -= sidePotAmount
                    }
                    lastBet = player.currentBet
                }
            })

            // 主池处理
            if (remainingPot > 0) {
                state.table.sidePots.unshift({
                    amount: remainingPot,
                    eligiblePlayers: activePlayers.map(p => p.id)
                })
            }
            // 分配边池奖金
            state.table.sidePots.forEach(pot => {
                const sideEvaluatedPlayers = evaluatedPlayers.filter(
                    player => pot.eligiblePlayers.includes(player.id)
                )
                const sideWinners = sideEvaluatedPlayers.filter(
                    player => player.handValue.handType === sideEvaluatedPlayers[0].handValue.handType &&
                        player.handValue.handRank === sideEvaluatedPlayers[0].handValue.handRank
                )

                if (sideWinners.length > 0) {
                    const winAmount = Math.floor(pot.amount / sideWinners.length)
                    sideWinners.forEach(winner => {
                        winner.chips += winAmount
                        winner.winAmount += winAmount
                        winner.isWinner = true
                        commit('ADD_LOG', `${winner.name} 赢得边池 ${winAmount} 筹码`)
                    })
                }
            })
        },
        // bot玩家行动
        async botPlayerAction({ state, dispatch }) {
            const action = { type: 'checkCall', amount: 0 } as PlayerAction
            await dispatch('playerAction', action)
        },
        // 玩家行动
        async playerAction({ state, commit, dispatch }, { playerId = state.table.currentPlayer, action = { type: 'checkCall', amount: 0 } as PlayerAction }) {
            const player = state.players.find(p => p.id === playerId)
            if (!player || !player.isActive) {
                console.error(`Player with id ${playerId} is not active or not found`)
                throw new Error(`Player with id ${playerId} is not active or not found`)
                return
            }
            if (action.type === 'fold') {
                commit('PLACE_BET', { playerId, amount: 0, action: 'fold' })
            } else if (action.type === 'checkCall') {
                const missingChips = state.table.currentBet - player.currentBet
                if (missingChips === 0) {
                    commit('PLACE_BET', { playerId, amount: 0, action: 'check' })
                } else if (missingChips < player.chips) {
                    commit('PLACE_BET', { playerId, amount: missingChips, action: 'call' })
                } else {
                    commit('PLACE_BET', { playerId, amount: player.chips, action: 'allin' })
                }
            } else if (action.type === 'raise') {
                if (action.amount > player.chips) {
                    console.error(`Player with id ${playerId} does not have enough chips to raise ${action.amount}`)
                    throw new Error(`Player with id ${playerId} does not have enough chips to raise ${action.amount}`)
                    return
                } else if (action.amount == player.chips) {
                    commit('PLACE_BET', { playerId, amount: action.amount, action: 'allin' })
                } else {
                    commit('PLACE_BET', { playerId, amount: action.amount, action: 'raise' })
                }
            } else {
                console.error(`Invalid action type: ${action.type}`)
                throw new Error(`Invalid action type: ${action.type}`)
            }
        },
    }
})