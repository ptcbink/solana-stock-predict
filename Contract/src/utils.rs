use anchor_lang::{
    prelude::*,
    solana_program::clock::{Clock, UnixTimestamp}
};


use crate::{constants::*, state::*};

pub fn get_unix_timstamp() -> UnixTimestamp{
    Clock::get().unwrap().unix_timestamp
}

pub fn validate_enter_bet(bet: &Bet) -> bool {
    bet.prediction_b.is_none()
        && (bet.expiry_ts - MINIMUM_REMAINING_TIME_UNTIL_EXPIRY > get_unix_timstamp())
} 

pub fn validate_claim_bet(bet: &Bet) -> bool {
    match bet.state {
        BetState::Started => {
            let current_ts = get_unix_timstamp();
            let time_passed_since_expiry = current_ts - bet.expiry_ts;
            0 < time_passed_since_expiry && time_passed_since_expiry <= MAXIMUM_CLAIMABLE_PERIOD
        },
        _ => false,
    }
}

pub fn validate_close_bet(bet: &Bet, user_key: Pubkey) -> bool {
    match bet.state{
        BetState::Created => bet.prediction_a.player == user_key,
        BetState::Started => {
            is_player(bet, user_key)
                && get_unix_timstamp() > bet.expiry_ts + MAXIMUM_CLAIMABLE_PERIOD

        }
        BetState::PlayerAWon => bet.prediction_a.player == user_key,
        BetState::PlayerBWon => bet.prediction_b.as_ref().unwrap().player == user_key,
        BetState::Draw => is_player(bet,user_key),
    }
}

fn is_player(bet: &Bet, user_key: Pubkey) -> bool {
    bet.prediction_a.player == user_key
        || (bet.prediction_b.is_some() && bet.prediction_b.as_ref().unwrap().player == user_key) 
}