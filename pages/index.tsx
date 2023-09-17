import Image from "next/image";
import { Nunito } from "next/font/google";
// import EmbeddedFlyde from "./EmbeddedFlyde";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${nunito.className}`}
    >
      {/* <EmbeddedFlyde /> */}
    </main>
  );
}
