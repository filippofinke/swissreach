/**
 * App-state reducer with URL synchronisation.
 *
 * The reducer is the single source of truth for the visualisation controls;
 * every update is mirrored to the query string via `writeState`, and back-/
 * forward navigation re-hydrates from `readState`.
 */
import { useCallback, useEffect, useReducer } from 'react';
import { readState, writeState } from '../state/state';
import type { AppState } from '../state/types';

/**
 * A patch is either a plain partial or a function of the *latest* state. The
 * functional form lets callers derive the next value from the current one
 * inside the reducer, so rapid successive updates can't clobber each other
 * with a stale render-time snapshot.
 */
export type StatePatch = Partial<AppState> | ((prev: AppState) => Partial<AppState>);

type Action = { type: 'patch'; partial: StatePatch } | { type: 'replace'; state: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'patch': {
      const partial = typeof action.partial === 'function' ? action.partial(state) : action.partial;
      return { ...state, ...partial };
    }
    case 'replace':
      return action.state;
  }
}

export type AppStateApi = {
  state: AppState;
  patch: (partial: StatePatch) => void;
  replace: (state: AppState) => void;
};

export function useAppState(defaultOrigin: string): AppStateApi {
  const [state, dispatch] = useReducer(reducer, undefined, () => readState(defaultOrigin));

  // Mirror every state change to the URL.
  useEffect(() => {
    writeState(state);
  }, [state]);

  // Reflect browser back/forward into state.
  useEffect(() => {
    const onPop = () => dispatch({ type: 'replace', state: readState(defaultOrigin) });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [defaultOrigin]);

  const patch = useCallback((partial: StatePatch) => {
    dispatch({ type: 'patch', partial });
  }, []);

  const replace = useCallback((next: AppState) => {
    dispatch({ type: 'replace', state: next });
  }, []);

  return { state, patch, replace };
}
