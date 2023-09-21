import { FlydeHeader } from "@/components/FlydeHeader";
import "@/styles/globals.css";
import "@/styles/reset-bp.css";

import type { AppProps } from "next/app";
import { Nunito } from "next/font/google";
import React from "react";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`main-container w-full h-full ${nunito.className}`}>
      <FlydeHeader />
      <main className="w-full h-full">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
