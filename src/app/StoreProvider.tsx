import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { StoreContext, type Store } from './StoreContext'
import { actions, seed, type State } from './store'

const KEY = 'trace-athar-prototype-v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    // Storage unavailable or corrupt: fall back to the demo data.
  }
  return seed()
}

/** Holds the shared prototype record and persists it in the browser. */
export default function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const latest = useRef(state)

  useEffect(() => {
    latest.current = state
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Persistence is best-effort.
    }
  }, [state])

  const run = useCallback<Store['run']>((name, ...arg) => {
    const draft = structuredClone(latest.current)
    const fn = actions[name] as (s: State, a?: unknown) => unknown
    const result = fn(draft, arg[0])
    latest.current = draft
    setState(draft)
    return result
  }, [])

  const reset = useCallback(() => {
    const fresh = seed()
    latest.current = fresh
    setState(fresh)
  }, [])

  const value = useMemo(() => ({ state, run, reset }), [state, run, reset])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
