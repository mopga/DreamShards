/// <reference path="../../node_modules/electron/electron.d.ts" />

declare module 'electron' {
  export = Electron.CrossProcessExports;
}

declare module 'electron/main' {
  export = Electron.Main;
}

declare module 'electron/common' {
  export = Electron.Common;
}

declare module 'electron/renderer' {
  export = Electron.Renderer;
}

declare module 'electron/utility' {
  export = Electron.Utility;
}
