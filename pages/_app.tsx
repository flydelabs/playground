import { FlydeHeader } from "@/components/FlydeHeader";
import "@/styles/globals.css";
import "@/styles/reset-bp.css";

import type { AppProps } from "next/app";
import { Nunito } from "next/font/google";
import React from "react";
import { Tooltip } from "react-tooltip";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`main-container w-full h-screen ${nunito.className}`}>
      <FlydeHeader />
      <main className="w-full" style={{ height: `calc(100vh - 60px)` }}>
        <Component {...pageProps} />
        <Tooltip
          id="main-tooltip"
          className="!max-w-prose !text-center !z-200"
        />
      </main>
    </div>
  );
}
