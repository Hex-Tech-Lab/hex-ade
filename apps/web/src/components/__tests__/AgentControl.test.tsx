import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentControl } from '@/components/AgentControl'
import type { AgentStatus } from '@/lib/types'

describe('AgentControl Component', () => {
  const defaultProps = {
    projectName: 'test-project',
    status: 'stopped' as AgentStatus,
    onStart: vi.fn(),
    onStop: vi.fn(),
    isLoading: false,
    yoloMode: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders start button when stopped', () => {
    render(<AgentControl {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Start Agent' })).toBeInTheDocument()
    expect(screen.getByText('Stopped')).toBeInTheDocument()
  })

  it('renders stop button when running', () => {
    render(<AgentControl {...defaultProps} status="running" />)

    const stopButton = screen.getByRole('button', { name: 'Stop Agent' })
    expect(stopButton).toBeInTheDocument()

    // Check if start button is not present
    expect(screen.queryByRole('button', { name: 'Start Agent' })).not.toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(<AgentControl {...defaultProps} isLoading={true} />)

    const startButton = screen.getByRole('button', { name: 'Start Agent' })
    expect(startButton).toBeDisabled()
  })

  it('calls onStart with correct parameters when start button clicked', async () => {
    const onStart = vi.fn()
    const user = userEvent.setup()

    render(<AgentControl {...defaultProps} onStart={onStart} />)

    const startButton = screen.getByRole('button', { name: 'Start Agent' })
    await user.click(startButton)

    expect(onStart).toHaveBeenCalledWith(3, false) // default concurrency and yolo mode
  })

  it('calls onStop when stop button clicked', async () => {
    const onStop = vi.fn()
    const user = userEvent.setup()

    render(<AgentControl {...defaultProps} status="running" onStop={onStop} />)

    const stopButton = screen.getByRole('button', { name: 'Stop Agent' })
    await user.click(stopButton)

    expect(onStop).toHaveBeenCalled()
  })

  it('updates concurrency slider value', async () => {
    const user = userEvent.setup()

    render(<AgentControl {...defaultProps} />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: 5 } })

    expect(slider).toHaveValue('5')
  })

  it('shows paused state and resume button', () => {
    render(<AgentControl {...defaultProps} status="paused" />)

    expect(screen.getByRole('button', { name: 'Resume Agent' })).toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('disables start button when no project selected', () => {
    render(<AgentControl {...defaultProps} projectName={null} />)

    const startButton = screen.getByRole('button', { name: 'Start Agent' })
    expect(startButton).toBeDisabled()
  })
})