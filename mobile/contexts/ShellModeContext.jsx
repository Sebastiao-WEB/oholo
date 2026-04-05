import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { readShellMode, writeShellMode } from '../utils/shellMode';

/** @typedef {'customer' | 'provider'} ShellMode */

/** @type {React.Context<{ mode: ShellMode; setMode: (m: ShellMode) => Promise<void>; ready: boolean } | null>} */
const ShellModeContext = createContext(null);

export function ShellModeProvider({ children }) {
  const [mode, setModeState] = useState(/** @type {ShellMode} */ ('customer'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const m = await readShellMode();
        if (!cancelled) {
          setModeState(m);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback(async (next) => {
    const m = next === 'provider' ? 'provider' : 'customer';
    setModeState(m);
    await writeShellMode(m);
  }, []);

  const value = useMemo(() => ({ mode, setMode, ready }), [mode, ready, setMode]);

  return <ShellModeContext.Provider value={value}>{children}</ShellModeContext.Provider>;
}

export function useShellMode() {
  const ctx = useContext(ShellModeContext);
  if (ctx == null) {
    throw new Error('useShellMode deve ser usado dentro de ShellModeProvider');
  }
  return ctx;
}
