import React from "react";
import { App as InnerApp } from "./app/App";
import { LocaleProvider } from "./state/LocaleContext";

export { InnerApp as App };

export default function App() {
  return (
    <LocaleProvider>
      <InnerApp />
    </LocaleProvider>
  );
}
