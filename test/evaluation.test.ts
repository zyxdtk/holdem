import { evaluateHand } from '../src/services/evaluation'
import { Card } from '../src/services/types'

describe('evaluateHand', () => {
    // 测试皇家同花顺
    it('should evaluate royal flush correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: 'A', rankValue: 14 },
            { suit: '♥', rank: 'K', rankValue: 13 }
        ]
        const community: Card[] = [
            { suit: '♥', rank: 'Q', rankValue: 12  },
            { suit: '♥', rank: 'J', rankValue: 11   },
            { suit: '♥', rank: '10', rankValue: 10 }
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(10)
        expect(result.handName).toBe('皇家同花顺')
    })

    // 测试四条
    it('should evaluate four of a kind correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: 'A', rankValue: 14  },
            { suit: '♦', rank: 'A', rankValue: 14 }
        ]
        const community: Card[] = [
            { suit: '♠', rank: 'A', rankValue: 14 },
            { suit: '♣', rank: 'A', rankValue: 14 },
            { suit: '♥', rank: 'K', rankValue: 13  }
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(8)
        expect(result.handName).toBe('四条')
    })

    // 测试葫芦
    it('should evaluate full house correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: 'K', rankValue: 13 },
            { suit: '♦', rank: 'K', rankValue: 13 }
        ]
        const community: Card[] = [
            { suit: '♠', rank: 'K', rankValue: 13 },
            { suit: '♣', rank: 'Q', rankValue: 12 },
            { suit: '♥', rank: 'Q', rankValue: 12 }
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(7)
        expect(result.handName).toBe('葫芦')
    })

    // 测试同花
    it('should evaluate flush correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: '2', rankValue: 2},
            { suit: '♥', rank: '4', rankValue: 4}
        ]
        const community: Card[] = [
            { suit: '♥', rank: '6', rankValue: 6},
            { suit: '♥', rank: '8', rankValue: 8},
            { suit: '♥', rank: '10', rankValue: 10}
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(6)
        expect(result.handName).toBe('同花')
    })

    // 测试顺子
    it('should evaluate straight correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: '5', rankValue: 5},
            { suit: '♦', rank: '6', rankValue: 6}
        ]
        const community: Card[] = [
            { suit: '♠', rank: '7', rankValue: 7},
            { suit: '♣', rank: '8', rankValue: 8},
            { suit: '♥', rank: '9', rankValue: 9}
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(5)
        expect(result.handName).toBe('顺子')
    })

    // 测试三条
    it('should evaluate three of a kind correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: 'Q', rankValue: 12 },
            { suit: '♦', rank: 'Q', rankValue: 12 }
        ]
        const community: Card[] = [
            { suit: '♠', rank: 'Q', rankValue: 12 },
            { suit: '♣', rank: '2', rankValue: 2},
            { suit: '♥', rank: '3', rankValue: 3}
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(4)
        expect(result.handName).toBe('三条')
    })

    // 测试两对
    it('should evaluate two pairs correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: 'J', rankValue: 11 },
            { suit: '♦', rank: 'J', rankValue: 11 }
        ]
        const community: Card[] = [
            { suit: '♠', rank: '9', rankValue: 9},
            { suit: '♣', rank: '9', rankValue: 9},
            { suit: '♥', rank: '2', rankValue: 2}
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(3)
        expect(result.handName).toBe('两对')
    })

    // 测试一对
    it('should evaluate one pair correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: '10', rankValue: 10},
            { suit: '♦', rank: '10', rankValue: 10}
        ]
        const community: Card[] = [
            { suit: '♠', rank: '8', rankValue: 8},
            { suit: '♣', rank: '7', rankValue: 7},
            { suit: '♥', rank: '2', rankValue: 2}
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(2)
        expect(result.handName).toBe('一对')
    })

    // 测试高牌
    it('should evaluate high card correctly', () => {
        const hand: Card[] = [
            { suit: '♥', rank: 'A', rankValue: 14 },
            { suit: '♦', rank: 'K', rankValue: 13 }
        ]
        const community: Card[] = [
            { suit: '♠', rank: 'Q', rankValue: 12 },
            { suit: '♣', rank: 'J', rankValue: 11 },
            { suit: '♥', rank: '9', rankValue: 9}
        ]
        const result = evaluateHand(hand, community)
        expect(result.handType).toBe(1)
        expect(result.handName).toBe('高牌')
    })
})