import { createContext, useContext } from 'react'
import type { ActionArg, ActionName, State } from './store'

export type Store = {
  state: State
  /** Run a store action; returns whatever the action returns (e.g. a new id). */
  run: <K extends ActionName>(name: K, ...arg: ActionArg<K> extends undefined ? [] : [ActionArg<K>]) => unknown
  reset: () => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore() {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore must be used inside <StoreProvider>')
  return s
}
