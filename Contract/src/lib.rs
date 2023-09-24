// Prediction Dapp
// Get the price of the stock using Pyth network
// Player A to choose an asset that available in Pyth and inputs the lenght of the bet (Creating a Bet)
// Players can see all existing bets (Fetch Bets)
// Player B can Match any of the bets and inputs his own prediction
// If the timimng is over whoever is closer to the price can claim the Whole amount

mod state;
mod constants;
mod utils;
mod error;

use anchor_lang::{prelude::*, system_program};
use pyth_sdk_solana::load_price_feed_from_account_info;

use crate::{state::*,constants::*,utils::*,error::*};

declare_id!("3vY5F41z5htZdEv3AF5vppzamEYwXFWGVatWRhZuRbBC");

#[program]
mod prediction_dapp {
    use super::*;
    pub fn create_master(_ctx: Context<CreateMaster>) -> Result<()> {
        Ok(())
    }

    pub fn create_bet(ctx:Context<CreateBet>,amount:u64,price:f64,duration:u32,pyth_price_key: Pubkey) -> Result<()> {
        let master = &mut ctx.accounts.master;
        let bet = &mut ctx.accounts.bet;
        // Increase the last id on each bet creation on the master
        master.last_bet_id += 1;
        bet.id = master.last_bet_id;
        bet.pyth_price_key = pyth_price_key;
        bet.amount = amount;
        bet.expiry_ts = get_unix_timstamp() + duration as i64;
        bet.prediction_a = BetPrediction{
            player: ctx.accounts.player.key(),
            price,
        };

        //Transfer the amount to the Bet PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer{
                    from: ctx.accounts.player.to_account_info(),
                    to: bet.to_account_info()
                },
            ),
            bet.amount,
        );
        Ok(())
    }

    pub fn enter_bet(ctx: Context<EnterBet>,price:f64) -> Result<()> {
        let bet = &mut ctx.accounts.bet;
        bet.prediction_b = Some(BetPrediction{
            player: ctx.accounts.player.key(),
            price,
        });
        bet.state = BetState::Started;

        //Transfer the amount to the Bet PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer{
                    from: ctx.accounts.player.to_account_info(),
                    to: bet.to_account_info()
                },
            ),
            bet.amount,
        );
        Ok(())
        
    }

    pub fn claim_bet(ctx: Context<ClaimBet>) -> Result<()> {
        // Check winner and send the prize to the winner OR return them back if it's a draw.
        let bet = &mut ctx.accounts.bet;
        let prize = bet.amount.checked_mul(2).unwrap();
        **bet.to_account_info().try_borrow_mut_lamports()? -= prize;

        // Get Pyth Price
        let pyth_account_info = &ctx.accounts.pyth;
        let feed = load_price_feed_from_account_info(pyth_account_info)
            .map_err(|_| error!(BetError::InvalidPythAccount))?;
        let price_data = feed.get_price_unchecked();

        require!(price_data.price <= f64::max as i64, BetError::PriceTooBig);
        let pyth_price = price_data.price as f64;
        msg!("Pyth Price is: {}", pyth_price);

        // Adjust prices to compare them with Pyth's price 
        // Real price = Pyth price * 10 (Pyth Exponent)
        let multiplier = 10f64.powi(-price_data.expo);
        let adjusted_player_a = bet.prediction_a.price * multiplier;
        let adjusted_player_b = bet.prediction_b.as_ref().unwrap().price * multiplier;
        msg!("Adjusted player A prediction: {}", adjusted_player_a);
        msg!("Adjusted player B prediction: {}", adjusted_player_b);

        let abs_player_a = (pyth_price - adjusted_player_a).abs();
        let abs_player_b = (pyth_price - adjusted_player_b).abs();
        if abs_player_a < abs_player_b {
            msg!("Winner is PLayer A, sending {} lamports", prize);
            bet.state = BetState::PlayerAWon;
            **ctx   
                .accounts
                .player_a
                .to_account_info()
                .try_borrow_mut_lamports()? += prize;
        } else if abs_player_b < abs_player_a {
            msg!("Winner is PLayer B, sending {} lamports", prize);
            bet.state = BetState::PlayerBWon;
            **ctx
                .accounts
                .player_b
                .to_account_info()
                .try_borrow_mut_lamports()? += prize;
        } else{
            let draw_amount = bet.amount;
            msg!("Draw! Sending both player {} lamports", draw_amount);
            bet.state = BetState::Draw;
            // Return both players amount back

            **ctx   
                .accounts
                .player_a
                .to_account_info()
                .try_borrow_mut_lamports()? += draw_amount;
            **ctx
                .accounts
                .player_b
                .to_account_info()
                .try_borrow_mut_lamports()? += draw_amount;

        }
        Ok(())
    }

    pub fn close_bet(_ctx:Context<CloseBet>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateMaster<'info> {
    #[account(
        init, 
        payer = payer,
        space = 8 + 8,
        seeds = [MASTER_SEED],
        bump
    )]
    pub master: Account<'info, Master>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>
}


// What should CreateBet do ?
// It should create a Bet Account
#[derive(Accounts)]
pub struct CreateBet<'info> {
    #[account(
        init,
        payer = player,
        space = 8+8+32+8+8+32+8+1+32+8+1,
        seeds = [BET_SEED, &(master.last_bet_id + 1).to_le_bytes()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut,seeds = [MASTER_SEED], bump)]
    pub master: Account<'info, Master>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,

}

#[derive(Accounts)]
pub struct EnterBet<'info> {
    #[account(
        mut,
        seeds = [BET_SEED, &bet.id.to_le_bytes()],
        constraint = validate_enter_bet(&*bet) @ BetError::CannotEnter,
        bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimBet<'info> {
    #[account(
        mut,
        seeds = [BET_SEED, &bet.id.to_le_bytes()],
        constraint = validate_claim_bet(&*bet) @ BetError::CannotClaim,
        bump
    )]
    pub bet: Account<'info,Bet>,

    #[account(address = bet.pyth_price_key @ BetError::InvalidPythKey)]
    pub pyth: AccountInfo<'info>,

    #[account(mut, address = bet.prediction_a.player)]
    pub player_a: AccountInfo<'info>,


    #[account(mut, address = bet.prediction_b.as_ref().unwrap().player)]
    pub player_b: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    
}
#[derive(Accounts)]
pub struct CloseBet<'info> {
    #[account(
        mut,
        seeds = [BET_SEED, &bet.id.to_le_bytes()],
        bump,
        close = player,
        constraint = validate_close_bet(&*bet,player.key()) @ BetError::CannotClose,
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}
