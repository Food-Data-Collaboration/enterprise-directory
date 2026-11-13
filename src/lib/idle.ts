/**
 * Run `callback` once the browser is idle (or after `timeout` ms at the latest),
 * so deferred work never competes with first render. Falls back to a macrotask
 * where requestIdleCallback is unavailable (Safari).
 */
export function whenIdle(callback: () => void, timeout = 4000): void {
    if (typeof requestIdleCallback === "function") requestIdleCallback(callback, { timeout });
    else setTimeout(callback, 1);
}
