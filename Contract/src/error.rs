use anchor_lang::prelude::*;

#[error_code]
pub enum BetError {
    #[msg("Cannot Enter")]
    CannotEnter,
    #[msg("Cannot Enter")]
    CannotClaim,
    #[msg("Cannot Close")]
    CannotClose,
    #[msg("Given Key for the Pyth account does not match")]
    InvalidPythKey,
    #[msg("Invalid Pyth account")]
    InvalidPythAccount,
    #[msg("Price is too big to parse to u32")]
    PriceTooBig,

}