// Worker entry shim: registers tsx's TypeScript loader for this thread, then
// hands control to the actual worker file. Needed because Node worker_threads
// don't inherit the main thread's loader hooks, and `execArgv: ['--import',
// 'tsx']` is unreliable across tsx versions.
import { register } from 'tsx/esm/api';
register();
await import('./build-day-worker.ts');
