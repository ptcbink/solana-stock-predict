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
    const waLLet = useAnchorWallet();

    // Set Program
    useEffect(() => {
        if(connection) {
            setProgram(getPrgram(connection, waLLet ?? {}))
        } else{
            setProgram(null);
        }
    }, [connection,waLLet])

    //Check wallet connection
    useEffect(() => {
        setIsConnected(!!waLLet?.publicKey)
    }, [waLLet]);

    const fetchMasterAccount = useCallback(async () => {
        if(!program) return;
        try{
            const masterAccountPk = await getMasterAccountPk();
            const masterAccount = await program.account.master.fetch(masterAccountPk);
            setMasterAccount(masterAccount);
        } catch(e){
            console.log("could not fetch master account: ", e.message);
            setMasterAccount(null);
        }
    }) 

    // check for master account
    useEffect(() => {
        if(!masterAccount && program) {
            fetchMasterAccount();
        }
    }, [masterAccount, program])

    const fetchBets = useCallback(async () => {
        if(!program) return;
        const allBetsResult = await program.account.bet.all();
        const allBets = allBetsResult.map((bet) => bet.account);
        setAllBets(allBets);
    }, [program])

    useEffect(() => {
        // fetch all bets if allbets doesn't exist.
        if(!allBets){
            fetchBets();
        }
    }, [allBets, fetchBets])

    const createBet = useCallback(
        async(amount, price, duration, pythPrice) => {
            if(!masterAccount) return;

            try{
                const betId = masterAccount.lastBetId.addn(1);
                const res = await getBetAccountPk(betId);
                console.log({betPk: res});
                const txHash = await program.methods
                .createBet(amount, price, duration, pythPrice)
                .accounts({
                    bet: await getBetAccountPk(betId),
                    master: await getMasterAccountPk(),
                    player: waLLet.publicKey,
                })
                .rpc()
                await connection.confirmTransaction(txHash);
                console.log("Created bet!", txHash);
                toast.success("Created bet!")
            } catch(e) {
                toast.error("Failed to create bet!");
                console.log(e.message);
            }
        },
        [masterAccount]
    )

    const closeBet = useCallback(
        async(bet) => {
            if(!masterAccount) return;

            try{
                const txHash = await program.methods
                .closeBet()
                .accounts({
                    bet: await getBetAccountPk(bet.id),
                    player: waLLet.publicKey
                })
                .rpc()
            toast.success("Closed Bet")
            } catch(e) {
                toast.error("Failed to close bet")
                console.log("Could not close bet", e.message);
            }
        },[masterAccount]
    )
    const enterBet = useCallback(
        async(price, bet) => {
            if(!masterAccount) return;

            try{
                const txHash = await program.methods
                .enterBet(price)
                .accounts({
                    bet: await getBetAccountPk(bet.id),
                    player: waLLet.publicKey
                })
                .rpc();
                toast.success("Entered Bet!");
            }
            catch(e) {
                console.log("Couldn't enter bet", e.message);
                toast.error("Failed to enter bet!");
            }
        },[masterAccount]
    )

    const claimBet = useCallback(
        async(bet) => {
            if(!masterAccount) return;

            try{
                const txHash = await program.methods
                .claimBet()
                .account({
                    bet: await getBetAccountPk(bet.id),
                    pyth: bet.pythPriceKey,
                    playerA: bet.predictionA.player,
                    playerB: bet.predictionB.player,
                    signer: waLLet.publicKey,
                })
                .rpc()
                console.log("Claimed Bet");
            }
            catch(e){
                console.log("Couldn't claim", e.message);
                toast.error("Failed to claim");
            }
        },[masterAccount]
    )

    return (
        <GlobalContext.Provider
        value={{
            masterAccount,
            allBets,
            createBet,
            closeBet,
            enterBet,
            claimBet,
        }}
        >
            {children}
        </GlobalContext.Provider>
    )
}