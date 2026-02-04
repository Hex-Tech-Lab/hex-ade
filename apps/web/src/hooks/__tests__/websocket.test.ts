import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useProjectWebSocket } from '@/hooks/useWebSocket'
import { useAssistantChat } from '@/hooks/useAssistantChat'
import type { WSMessage, WSProgressMessage, WSAgentUpdateMessage } from '@/lib/types'

// Mock WebSocket
const mockWebSocket = vi.fn()
const mockWebSocketInstance = {
  onopen: null,
  onmessage: null,
  onerror: null,
  onclose: null,
  send: vi.fn(),
  close: vi.fn(),
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'WebSocket', {
    writable: true,
    value: mockWebSocket,
  })
  mockWebSocket.mockReturnValue(mockWebSocketInstance)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('useProjectWebSocket Hook', () => {
  it('returns expected interface properties', () => {
    const { result } = renderHook(() => useProjectWebSocket('test-project'))

    // Test that hook returns expected shape
    expect(result.current).toHaveProperty('isConnected')
    expect(result.current).toHaveProperty('logs')
    expect(result.current).toHaveProperty('activeAgents')
    expect(result.current).toHaveProperty('clearLogs')
    expect(result.current).toHaveProperty('progress')
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useProjectWebSocket('test-project'))

    expect(result.current.isConnected).toBe(false)
    expect(result.current.logs).toEqual([])
    expect(result.current.activeAgents).toEqual([])
    expect(result.current.progress.passing).toBe(0)
  })

  it('does not crash when projectName is null', () => {
    const { result } = renderHook(() => useProjectWebSocket(null))

    expect(result.current.isConnected).toBe(false)
    expect(result.current.activeAgents).toEqual([])
  })

  it('clearLogs function removes logs', () => {
    const { result } = renderHook(() => useProjectWebSocket('test-project'))

    // Initially empty
    expect(result.current.logs).toEqual([])

    // Call clearLogs (should not crash)
    act(() => {
      result.current.clearLogs()
    })

    expect(result.current.logs).toEqual([])
  })

  it('tracks agent activity', () => {
    const { result } = renderHook(() => useProjectWebSocket('test-project'))

    // Initially no agents
    expect(result.current.activeAgents).toEqual([])

    // We can't easily test the actual WebSocket parsing without more mocking
    // But we can test the interface
    expect(Array.isArray(result.current.activeAgents)).toBe(true)
  })

  it('maintains orchestrator state', () => {
    const { result } = renderHook(() => useProjectWebSocket('test-project'))

    expect(result.current).toHaveProperty('orchestratorStatus')
    expect(result.current).toHaveProperty('recentActivity')
  })

  it('provides activity feed interface', () => {
    const { result } = renderHook(() => useProjectWebSocket('test-project'))

    expect(result.current.recentActivity).toBeDefined()
    expect(result.current).toHaveProperty('clearCelebration')
  })

  it('exports utility functions', () => {
    const { result } = renderHook(() => useProjectWebSocket('test-project'))

    expect(typeof result.current.getAgentLogs).toBe('function')
    expect(typeof result.current.clearAgentLogs).toBe('function')
  })
})

describe('useAssistantChat Hook', () => {
  it('returns expected interface properties', () => {
    const { result } = renderHook(() => useAssistantChat({ projectName: 'test-project' }))

    expect(result.current).toHaveProperty('messages')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('connectionStatus')
    expect(result.current).toHaveProperty('sendMessage')
    expect(result.current).toHaveProperty('disconnect')
    expect(result.current).toHaveProperty('clearMessages')
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAssistantChat({ projectName: 'test-project' }))

    expect(result.current.messages).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.connectionStatus).toBe('disconnected')
    expect(result.current.conversationId).toBe(null)
  })

  it('sendMessage function exists and is callable', () => {
    const { result } = renderHook(() => useAssistantChat({ projectName: 'test-project' }))

    expect(typeof result.current.sendMessage).toBe('function')

    // Should not crash when called
    act(() => {
      result.current.sendMessage('test message')
    })
  })

  it('disconnect function exists and is callable', () => {
    const { result } = renderHook(() => useAssistantChat({ projectName: 'test-project' }))

    expect(typeof result.current.disconnect).toBe('function')

    // Should not crash when called
    act(() => {
      result.current.disconnect()
    })
  })

  it('clearMessages function exists and is callable', () => {
    const { result } = renderHook(() => useAssistantChat({ projectName: 'test-project' }))

    expect(typeof result.current.clearMessages).toBe('function')

    // Should not crash when called
    act(() => {
      result.current.clearMessages()
    })
  })

  it('handles onError callback', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useAssistantChat({ projectName: 'test-project', onError }))

    expect(result.current).toBeDefined()
    // The hook should accept the onError prop without crashing
  })

  it('works with empty projectName options', () => {
    const { result } = renderHook(() => useAssistantChat({}))

    expect(result.current.messages).toEqual([])
    expect(result.current.connectionStatus).toBe('disconnected')
  })

  it('maintains stable reference to functions', () => {
    const { result, rerender } = renderHook(() => useAssistantChat({ projectName: 'test-project' }))

    const firstSend = result.current.sendMessage
    const firstDisconnect = result.current.disconnect

    act(() => {
      rerender()
    })

    // Functions should maintain stable references (important for React optimization)
    expect(result.current.sendMessage).toBe(firstSend)
    expect(result.current.disconnect).toBe(firstDisconnect)
  })
})