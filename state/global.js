import { createContext, useCallback, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

import { getMasterAccountPk, getPrgram, getBetAccountPk } from "../utils/program";
import toast from "react-hot-toast";

export const GlobalContext = createContext({
    isConnected: null,
    waLLet: null,
    hasUserAccount: null,
    allBets: null,
    fetchBets: null,
})

export const GlobalState = ({children}) => {
    const [program, setProgram] = useState();
    const [isConnected, setIsConnected] = useState();
    const [masterAccount, setMasterAccount] = useState();
    const [allBets, setAllBets] = useState();
    const [userBets, setUserBets] = useState();

    const {connection} = useConnection();
    const waLLets = useAnchorWallet();

    let conncted = true;

    return (
        <GlobalContext.Provider
        value={{conncted}}
        >
            {children}
        </GlobalContext.Provider>
    )
}