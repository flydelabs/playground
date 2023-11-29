import { FlydeHeader } from "@/components/FlydeHeader";
import { UserProvider } from "@/components/UserContext";
import "@/styles/globals.css";
import "@/styles/reset-bp.css";

import type { AppProps } from "next/app";
import { Nunito } from "next/font/google";
import Head from "next/head";
import Script from "next/script";
import React from "react";
import { Tooltip } from "react-tooltip";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`main-container w-full h-screen ${nunito.className}`}>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-YFLY9DXCYH" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-YFLY9DXCYH');
        `}
      </Script>
      <Script id="hotjar">
        {`
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:3245180,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
      </Script>
      <UserProvider>
        <FlydeHeader />
        <main className="w-full" style={{ height: `calc(100vh - 60px)` }}>
          <Component {...pageProps} />
          <Tooltip
            id="main-tooltip"
            className="!max-w-prose !text-center !z-200"
          />
        </main>
      </UserProvider>
    </div>
  );
}
