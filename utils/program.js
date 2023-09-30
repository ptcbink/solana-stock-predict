import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

import { MINIMUM_REMAINING_TIME_UNITL_EXPIRY, PROGRAM__ID } from "./constants";

// Create a ficntion that gets the solana program we created
export const getPrgram = (connection, waLLet) => {
    const IDL = require("./idl.json");
    const provider = new AnchorProvider(
        connection,
        waLLet,
        AnchorProvider.defaultOptions()
    )
    const program  = new Program(IDL, PROGRAM__ID,provider)
    return program;
}

const getProgramAccountPk = async (seeds) => {
    return (await PublicKey.findProgramAddress(seeds, PROGRAM__ID))[0];

}

export const getMasterAccountPk = async() => {
    return await getMasterAccountPk([Buffer.from("master")]);
}

export const getBetAccountPk = async(id) => {
    return await getProgramAccountPk([
        Buffer.from("bet"),
        new BN(id).toArrayLike(Buffer, "le", 9)
    ])
}