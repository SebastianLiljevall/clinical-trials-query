import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableViewToggle } from './TableViewToggle'

describe('TableViewToggle', () => {
  it('renders three toggle buttons', () => {
    const onViewChange = vi.fn()
    render(<TableViewToggle currentView="studies" onViewChange={onViewChange} />)

    expect(screen.getByRole('tab', { name: /studies/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /outcome measures/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /comparisons/i })).toBeInTheDocument()
  })

  it('applies correct variant to active view', () => {
    const onViewChange = vi.fn()
    render(<TableViewToggle currentView="outcomes" onViewChange={onViewChange} />)

    const studiesBtn = screen.getByRole('tab', { name: /studies/i })
    const outcomesBtn = screen.getByRole('tab', { name: /outcome measures/i })
    const comparisonsBtn = screen.getByRole('tab', { name: /comparisons/i })

    expect(studiesBtn).toHaveAttribute('aria-selected', 'false')
    expect(outcomesBtn).toHaveAttribute('aria-selected', 'true')
    expect(comparisonsBtn).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onViewChange when a button is clicked', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    render(<TableViewToggle currentView="studies" onViewChange={onViewChange} />)

    await user.click(screen.getByRole('tab', { name: /outcome measures/i }))

    expect(onViewChange).toHaveBeenCalledWith('outcomes')
    expect(onViewChange).toHaveBeenCalledTimes(1)
  })

  it('supports keyboard navigation', () => {
    const onViewChange = vi.fn()
    render(<TableViewToggle currentView="studies" onViewChange={onViewChange} />)

    const studiesBtn = screen.getByRole('tab', { name: /studies/i })
    const outcomesBtn = screen.getByRole('tab', { name: /outcome measures/i })

    // Buttons should be focusable
    expect(studiesBtn).not.toHaveAttribute('tabindex', '-1')
    expect(outcomesBtn).not.toHaveAttribute('tabindex', '-1')
  })
})
