import { BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const getSolAmount = (bn) => bn?.div(new BN(LAMPORTS_PER_SOL)).toNumber();

export const getUnixTimestamp = () => Math.floor(Date.now() / 1000);
