import { supabase } from '@/integrations/supabase/client';
import { applyHandicapToScore } from './handicapCalculations';

interface BetResolutionParams {
  betId: string;
  betType: string;
  initiatorId: string;
  targetId: string;
  startHole: number;
  tournamentId: string;
}

interface PlayerScore {
  userId: string;
  totalStrokes: number;
  adjustedScore: number;
  holesPlayed: number;
  handicap?: number;
}

/**
 * Calculates adjusted scores with handicap applied
 */
const calculateAdjustedScores = async (
  userId: string,
  tournamentId: string,
  fromHole?: number,
  toHole?: number
): Promise<PlayerScore> => {
  // Get player's round and handicap
  const { data: tournamentRound } = await supabase
    .from('tournament_rounds')
    .select('round_id, user_id')
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!tournamentRound) {
    throw new Error('Player round not found');
  }

  const { data: participant } = await supabase
    .from('tournament_participants')
    .select('handicap')
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .maybeSingle();

  const handicap = participant?.handicap || 0;

  // Get hole scores
  let query = supabase
    .from('hole_scores')
    .select('hole_number, strokes')
    .eq('round_id', tournamentRound.round_id)
    .order('hole_number', { ascending: true });

  if (fromHole !== undefined) {
    query = query.gte('hole_number', fromHole);
  }
  if (toHole !== undefined) {
    query = query.lte('hole_number', toHole);
  }

  const { data: holeScores } = await query;

  const totalStrokes = holeScores?.reduce((sum, h) => sum + h.strokes, 0) || 0;
  const holesPlayed = holeScores?.length || 0;

  // Apply handicap proportionally to holes played
  const adjustedScore = applyHandicapToScore(totalStrokes, handicap, holesPlayed, 18);

  return {
    userId,
    totalStrokes,
    adjustedScore,
    holesPlayed,
    handicap
  };
};

/**
 * Resolves a "this-hole" bet
 */
const resolveThisHoleBet = async (params: BetResolutionParams): Promise<string | null | 'tie'> => {
  const initiatorScore = await calculateAdjustedScores(
    params.initiatorId,
    params.tournamentId,
    params.startHole,
    params.startHole
  );

  const targetScore = await calculateAdjustedScores(
    params.targetId,
    params.tournamentId,
    params.startHole,
    params.startHole
  );

  // Both players must have completed the hole
  if (initiatorScore.holesPlayed === 0 || targetScore.holesPlayed === 0) {
    return null; // Not ready to resolve
  }

  if (initiatorScore.adjustedScore < targetScore.adjustedScore) {
    return params.initiatorId;
  } else if (targetScore.adjustedScore < initiatorScore.adjustedScore) {
    return params.targetId;
  }

  return 'tie'; // Tie - push the bet
};

/**
 * Resolves a "remaining-holes" bet
 */
const resolveRemainingHolesBet = async (params: BetResolutionParams): Promise<string | null | 'tie'> => {
  const initiatorScore = await calculateAdjustedScores(
    params.initiatorId,
    params.tournamentId,
    params.startHole,
    18
  );

  const targetScore = await calculateAdjustedScores(
    params.targetId,
    params.tournamentId,
    params.startHole,
    18
  );

  // Both players must have completed all remaining holes
  const expectedHoles = 18 - params.startHole + 1;
  if (initiatorScore.holesPlayed < expectedHoles || targetScore.holesPlayed < expectedHoles) {
    return null; // Not ready to resolve
  }

  if (initiatorScore.adjustedScore < targetScore.adjustedScore) {
    return params.initiatorId;
  } else if (targetScore.adjustedScore < initiatorScore.adjustedScore) {
    return params.targetId;
  }

  return 'tie'; // Tie - push the bet
};

/**
 * Resolves a "total-strokes" bet (entire round)
 */
const resolveTotalStrokesBet = async (params: BetResolutionParams): Promise<string | null | 'tie'> => {
  const initiatorScore = await calculateAdjustedScores(
    params.initiatorId,
    params.tournamentId
  );

  const targetScore = await calculateAdjustedScores(
    params.targetId,
    params.tournamentId
  );

  // Both players must have completed 18 holes
  if (initiatorScore.holesPlayed < 18 || targetScore.holesPlayed < 18) {
    return null; // Not ready to resolve
  }

  if (initiatorScore.adjustedScore < targetScore.adjustedScore) {
    return params.initiatorId;
  } else if (targetScore.adjustedScore < initiatorScore.adjustedScore) {
    return params.targetId;
  }

  return 'tie'; // Tie - push the bet
};

/**
 * Resolves a "head-to-head" bet (match play style)
 */
const resolveHeadToHeadBet = async (params: BetResolutionParams): Promise<string | null | 'tie'> => {
  const initiatorScore = await calculateAdjustedScores(
    params.initiatorId,
    params.tournamentId,
    params.startHole
  );

  const targetScore = await calculateAdjustedScores(
    params.targetId,
    params.tournamentId,
    params.startHole
  );

  // Use head-to-head scoring from remaining holes
  const expectedHoles = 18 - params.startHole + 1;
  if (initiatorScore.holesPlayed < expectedHoles || targetScore.holesPlayed < expectedHoles) {
    return null; // Not ready to resolve
  }

  // For head-to-head, lower score wins
  if (initiatorScore.adjustedScore < targetScore.adjustedScore) {
    return params.initiatorId;
  } else if (targetScore.adjustedScore < initiatorScore.adjustedScore) {
    return params.targetId;
  }

  return 'tie'; // Tie - push the bet
};

/**
 * Main bet resolution function
 */
export const resolveBet = async (params: BetResolutionParams): Promise<{
  winnerId: string | null;
  canResolve: boolean;
  isTie?: boolean;
  reason?: string;
}> => {
  try {
    let winnerId: string | null | 'tie' = null;

    switch (params.betType) {
      case 'this-hole':
        winnerId = await resolveThisHoleBet(params);
        break;
      case 'remaining-holes':
        winnerId = await resolveRemainingHolesBet(params);
        break;
      case 'total-strokes':
        winnerId = await resolveTotalStrokesBet(params);
        break;
      case 'head-to-head':
        winnerId = await resolveHeadToHeadBet(params);
        break;
      case 'closest-to-pin':
      case 'longest-drive':
      case 'first-to-green':
        return {
          winnerId: null,
          canResolve: false,
          reason: 'Location-based bets require manual resolution'
        };
      default:
        return {
          winnerId: null,
          canResolve: false,
          reason: 'Unknown bet type'
        };
    }

    // Handle ties
    if (winnerId === 'tie') {
      return {
        winnerId: null,
        canResolve: true,
        isTie: true
      };
    }

    return {
      winnerId,
      canResolve: winnerId !== null,
      isTie: false
    };
  } catch (error: any) {
    console.error('Error resolving bet:', error);
    return {
      winnerId: null,
      canResolve: false,
      reason: error.message
    };
  }
};

/**
 * Auto-resolve bets for a tournament
 * Call this periodically or after score entries
 */
export const autoResolveBets = async (tournamentId: string): Promise<{
  resolvedCount: number;
  pushedCount: number;
  details: string[];
}> => {
  const { data: activeBets } = await supabase
    .from('press_bets')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('status', 'active');

  if (!activeBets || activeBets.length === 0) {
    return { resolvedCount: 0, pushedCount: 0, details: [] };
  }

  let resolvedCount = 0;
  let pushedCount = 0;
  const details: string[] = [];

  for (const bet of activeBets) {
    const result = await resolveBet({
      betId: bet.id,
      betType: bet.bet_type,
      initiatorId: bet.initiator_id,
      targetId: bet.target_id,
      startHole: bet.hole_number || 1,
      tournamentId: bet.tournament_id
    });

    if (result.canResolve) {
      if (result.isTie) {
        // Handle tie - mark as pushed
        await supabase
          .from('press_bets')
          .update({
            status: 'pushed',
            completed_at: new Date().toISOString()
          })
          .eq('id', bet.id);

        pushedCount++;
        details.push(`Bet ${bet.id}: Pushed (tie)`);
      } else if (result.winnerId) {
        // Update bet with winner
        await supabase
          .from('press_bets')
          .update({
            status: 'completed',
            winner_id: result.winnerId,
            completed_at: new Date().toISOString()
          })
          .eq('id', bet.id);

        resolvedCount++;
        details.push(`Bet ${bet.id}: Winner ${result.winnerId}`);
      }
    } else {
      details.push(`Bet ${bet.id}: Cannot resolve - ${result.reason || 'Incomplete scores'}`);
    }
  }

  return { resolvedCount, pushedCount, details };
};
