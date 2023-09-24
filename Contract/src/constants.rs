use anchor_lang::{
    prelude::*,
    solana_program::clock::UnixTimestamp
};
pub const MASTER_SEED: &[u8] = b"master";

pub const BET_SEED: &[u8] = b"bet";

// the closer we are to the expiry, the more chances a player has to win
// adjust this to make it more fair
pub const MINIMUM_REMAINING_TIME_UNTIL_EXPIRY: UnixTimestamp = 120;

pub const MAXIMUM_CLAIMABLE_PERIOD: UnixTimestamp = 300;