import { useEffect, useMemo, useState } from "react";
import { RPC_ENDPOINT } from "../utils/constants";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { GlobalState } from "../state/global";
import "../styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  const waLLets = useMemo(() => [new PhantomWalletAdapter()], []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT} config={{commitment: "confirmed"}}>
      <WalletProvider wallets={waLLets} autoConnect>
        <WalletModalProvider>
          {mounted && (
            <GlobalState>
            <Component {...pageProps} />
            </GlobalState>
            )
          }
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
