import { contextBridge } from 'electron';

declare global {
  interface Window {
    desktop: Record<string, never>;
  }
}

contextBridge.exposeInMainWorld('desktop', {});
