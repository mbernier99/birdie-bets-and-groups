import { supabase } from "@/integrations/supabase/client";
import { calculateSkinWinner, SkinResult } from "./skinsCalculations";
import { calculateWolfHole, WolfHoleResult } from "./wolfCalculations";
import { updateSnakeHolder, SnakeState } from "./snakeTracking";
import { calculateTeamBestBallScore } from "./teamMatchPlayCalculations";

export interface GameNotification {
  type: 'skins' | 'snake' | 'wolf' | 'team' | 'press';
  message: string;
  playersInvolved: string[]; // Player IDs who should see this notification
  isPositive: boolean; // For haptic/sound feedback
  details?: any;
}

export interface HoleGameResults {
  notifications: GameNotification[];
  skinsResult?: SkinResult;
  snakeStates?: SnakeState[];
  wolfResult?: WolfHoleResult;
  teamScores?: Map<string, { score: number; playerId: string }>;
}

export async function calculateHoleGames(
  tournamentId: string,
  holeNumber: number
): Promise<HoleGameResults> {
  const notifications: GameNotification[] = [];

  // Fetch tournament settings and participants
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('settings, created_by')
    .eq('id', tournamentId)
    .single();

  if (!tournament?.settings) {
    return { notifications };
  }

  const settings = tournament.settings as any;
  
  // Fetch all participant data with profiles
  const { data: participants } = await supabase
    .from('tournament_participants')
    .select('user_id, team_id, profiles!inner(first_name, last_name, nickname)')
    .eq('tournament_id', tournamentId);

  if (!participants) return { notifications };

  const playerNames = new Map(
    participants.map(p => [
      p.user_id,
      (p.profiles as any).nickname || (p.profiles as any).first_name || 'Player'
    ])
  );

  // Fetch all hole scores for this hole with round info
  const { data: holeScores } = await supabase
    .from('hole_scores')
    .select(`
      *,
      rounds!inner(user_id, tournament_id)
    `)
    .eq('rounds.tournament_id', tournamentId)
    .eq('hole_number', holeNumber);

  if (!holeScores || holeScores.length === 0) {
    return { notifications };
  }

  const results: HoleGameResults = { notifications };

  // Calculate SKINS if enabled
  if (settings.sideGames?.includes('skins')) {
    const skinResult = await calculateAndStoreSkins(
      tournamentId,
      holeNumber,
      holeScores,
      playerNames,
      settings.wagering?.skinsAmount || 10
    );
    results.skinsResult = skinResult;
    
    if (skinResult.winnerId) {
      const winnerName = playerNames.get(skinResult.winnerId) || 'Player';
      notifications.push({
        type: 'skins',
        message: `🔥 ${winnerName} wins $${skinResult.potAmount} skin!`,
        playersInvolved: participants.map(p => p.user_id),
        isPositive: true,
        details: skinResult
      });
    } else if (skinResult.isCarryover) {
      notifications.push({
        type: 'skins',
        message: `⏭️ Skin carries over - pot now $${skinResult.potAmount}`,
        playersInvolved: participants.map(p => p.user_id),
        isPositive: false
      });
    }
  }

  // Calculate SNAKE if enabled
  if (settings.sideGames?.includes('snake')) {
    const snakeResults = await calculateAndStoreSnakes(
      tournamentId,
      holeNumber,
      holeScores,
      playerNames
    );
    results.snakeStates = snakeResults;

    // Find snake transfers on this hole
    const snakeUpdates = snakeResults.filter(s => s.lastHoleUpdated === holeNumber && s.currentHolderId);
    snakeUpdates.forEach(snake => {
      const holderName = playerNames.get(snake.currentHolderId!) || 'Player';
      notifications.push({
        type: 'snake',
        message: `🐍 ${holderName} 3-putted - holds the ${snake.snakeType} snake!`,
        playersInvolved: participants.map(p => p.user_id),
        isPositive: false
      });
    });
  }

  // Calculate WOLF if enabled
  if (settings.gameType?.primary === 'wolf') {
    const wolfResult = await calculateAndStoreWolf(
      tournamentId,
      holeNumber,
      holeScores,
      playerNames,
      settings
    );
    results.wolfResult = wolfResult;

    if (wolfResult) {
      const wolfName = playerNames.get(wolfResult.wolfPlayerId) || 'Wolf';
      if (wolfResult.result === 'wolf_win') {
        const msg = wolfResult.isLoneWolf
          ? `🐺 ${wolfName} won as Lone Wolf! +${wolfResult.amount} pts`
          : `🤝 ${wolfName} & partner win! +${wolfResult.amount} pts`;
        
        notifications.push({
          type: 'wolf',
          message: msg,
          playersInvolved: wolfResult.isLoneWolf 
            ? [wolfResult.wolfPlayerId]
            : [wolfResult.wolfPlayerId, wolfResult.partnerId!].filter(Boolean),
          isPositive: true,
          details: wolfResult
        });
      }
    }
  }

  // Calculate TEAM BEST BALL if enabled
  if (settings.gameType?.teamFormat === 'best-ball' || settings.gameType?.teamFormat === 'better-ball') {
    const teamScores = await calculateAndStoreTeamScores(
      tournamentId,
      holeNumber,
      holeScores,
      participants,
      playerNames
    );
    results.teamScores = teamScores;

    // Determine hole winner
    if (teamScores.size >= 2) {
      const scoresArray = Array.from(teamScores.entries());
      const sortedTeams = scoresArray.sort((a, b) => a[1].score - b[1].score);
      
      if (sortedTeams[0][1].score < sortedTeams[1][1].score) {
        const winningTeamId = sortedTeams[0][0];
        const winningScore = sortedTeams[0][1].score;
        const winningPlayerName = playerNames.get(sortedTeams[0][1].playerId) || 'Team';
        
        // Get all players on winning team
        const teamPlayers = participants.filter(p => p.team_id === winningTeamId).map(p => p.user_id);
        
        notifications.push({
          type: 'team',
          message: `🏆 ${winningPlayerName}'s team wins hole with ${winningScore}!`,
          playersInvolved: teamPlayers,
          isPositive: true
        });
      } else {
        // Hole halved
        notifications.push({
          type: 'team',
          message: `🤝 Hole halved - all square`,
          playersInvolved: participants.map(p => p.user_id),
          isPositive: false
        });
      }
    }
  }

  return results;
}

async function calculateAndStoreSkins(
  tournamentId: string,
  holeNumber: number,
  holeScores: any[],
  playerNames: Map<string, string>,
  basePotAmount: number
): Promise<SkinResult> {
  // Get previous carryover
  const { data: prevSkin } = await supabase
    .from('skins_tracking')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('is_carried_over', true)
    .order('hole_number', { ascending: false })
    .limit(1)
    .single();

  const previousCarryover = prevSkin?.pot_amount || 0;

  // Calculate skin for this hole
  const playerScores = holeScores.map(hs => ({
    playerId: (hs.rounds as any).user_id,
    netScore: hs.strokes,
    grossScore: hs.strokes // For now, using same as net (would need handicap calculation)
  }));

  const skinResult = calculateSkinWinner(playerScores, basePotAmount, previousCarryover);
  skinResult.holeNumber = holeNumber;

  // Store in database
  await supabase.from('skins_tracking').upsert({
    tournament_id: tournamentId,
    hole_number: holeNumber,
    pot_amount: skinResult.potAmount,
    is_carried_over: skinResult.isCarryover,
    winner_id: skinResult.winnerId,
    winning_score: skinResult.winnerScore
  }, {
    onConflict: 'tournament_id,hole_number'
  });

  return skinResult;
}

async function calculateAndStoreSnakes(
  tournamentId: string,
  holeNumber: number,
  holeScores: any[],
  playerNames: Map<string, string>
): Promise<SnakeState[]> {
  // Fetch current snake states
  const { data: snakes } = await supabase
    .from('snake_tracking')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (!snakes || snakes.length === 0) {
    // Initialize snakes if not exist
    return [];
  }

  // Find who 3-putted (if putts data exists)
  const threePutters = holeScores.filter(hs => hs.putts && hs.putts >= 3);
  
  if (threePutters.length === 0) {
    return snakes.map(s => ({
      snakeType: s.snake_type as 'front_nine' | 'back_nine' | 'overall',
      currentHolderId: s.current_holder_id,
      lastHoleUpdated: s.last_hole_updated,
      amount: s.amount,
      isFinal: s.is_final
    }));
  }

  // Update snake holders
  const lastThreePutter = threePutters[threePutters.length - 1];
  const newHolderId = (lastThreePutter.rounds as any).user_id;

  const updatedSnakes: SnakeState[] = [];

  for (const snake of snakes) {
    // Determine which snake type to update based on hole number
    let shouldUpdate = false;
    if (snake.snake_type === 'front_nine' && holeNumber <= 9) shouldUpdate = true;
    if (snake.snake_type === 'back_nine' && holeNumber > 9) shouldUpdate = true;
    if (snake.snake_type === 'overall') shouldUpdate = true;

    if (shouldUpdate) {
      await supabase
        .from('snake_tracking')
        .update({
          current_holder_id: newHolderId,
          last_hole_updated: holeNumber,
          is_final: (snake.snake_type === 'front_nine' && holeNumber === 9) ||
                    (snake.snake_type === 'back_nine' && holeNumber === 18) ||
                    (snake.snake_type === 'overall' && holeNumber === 18)
        })
        .eq('id', snake.id);

      updatedSnakes.push({
        snakeType: snake.snake_type as 'front_nine' | 'back_nine' | 'overall',
        currentHolderId: newHolderId,
        lastHoleUpdated: holeNumber,
        amount: snake.amount,
        isFinal: (snake.snake_type === 'front_nine' && holeNumber === 9) ||
                 (snake.snake_type === 'back_nine' && holeNumber === 18) ||
                 (snake.snake_type === 'overall' && holeNumber === 18)
      });
    } else {
      updatedSnakes.push({
        snakeType: snake.snake_type as 'front_nine' | 'back_nine' | 'overall',
        currentHolderId: snake.current_holder_id,
        lastHoleUpdated: snake.last_hole_updated,
        amount: snake.amount,
        isFinal: snake.is_final
      });
    }
  }

  return updatedSnakes;
}

async function calculateAndStoreWolf(
  tournamentId: string,
  holeNumber: number,
  holeScores: any[],
  playerNames: Map<string, string>,
  settings: any
): Promise<WolfHoleResult | null> {
  // Fetch wolf state for this hole
  const { data: wolfState } = await supabase
    .from('wolf_game_state')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('hole_number', holeNumber)
    .single();

  if (!wolfState) return null;

  // Calculate wolf result (simplified - would need full implementation)
  // This is a placeholder - full wolf calculation logic would go here
  
  return null;
}

async function calculateAndStoreTeamScores(
  tournamentId: string,
  holeNumber: number,
  holeScores: any[],
  participants: any[],
  playerNames: Map<string, string>
): Promise<Map<string, { score: number; playerId: string }>> {
  const teamScores = new Map<string, { score: number; playerId: string }>();

  // Group players by team
  const teamGroups = new Map<string, string[]>();
  participants.forEach(p => {
    if (p.team_id) {
      if (!teamGroups.has(p.team_id)) {
        teamGroups.set(p.team_id, []);
      }
      teamGroups.get(p.team_id)!.push(p.user_id);
    }
  });

  // Calculate best ball for each team
  for (const [teamId, playerIds] of teamGroups.entries()) {
    const teamHoleScores = holeScores.filter(hs => 
      playerIds.includes((hs.rounds as any).user_id)
    );

    if (teamHoleScores.length === 0) continue;

    // Find best score
    let bestScore = Infinity;
    let bestPlayerId = '';
    
    teamHoleScores.forEach(hs => {
      if (hs.strokes < bestScore) {
        bestScore = hs.strokes;
        bestPlayerId = (hs.rounds as any).user_id;
      }
    });

    teamScores.set(teamId, { score: bestScore, playerId: bestPlayerId });

    // Store in database
    await supabase.from('team_hole_scores').upsert({
      tournament_id: tournamentId,
      team_id: teamId,
      hole_number: holeNumber,
      team_score: bestScore,
      best_player_id: bestPlayerId
    }, {
      onConflict: 'tournament_id,team_id,hole_number'
    });
  }

  return teamScores;
}
