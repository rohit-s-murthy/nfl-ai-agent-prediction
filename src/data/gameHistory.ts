import { Game, WeatherConditions } from '../models/game';

export interface GameHistoryEntry {
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    week: number;
    season: number;
    isPlayoffs: boolean;
    weather?: WeatherConditions;
    attendance?: number;
}

export interface HeadToHeadRecord {
    team1: string;
    team2: string;
    team1Wins: number;
    team2Wins: number;
    ties: number;
    lastMeeting: GameHistoryEntry;
    avgPointsTeam1: number;
    avgPointsTeam2: number;
}

const gameHistory: GameHistoryEntry[] = [
    // Sample 2024 season data
    { date: '2024-09-08', homeTeam: 'KC', awayTeam: 'BAL', homeScore: 27, awayScore: 20, week: 1, season: 2024, isPlayoffs: false },
    { date: '2024-09-09', homeTeam: 'BUF', awayTeam: 'ARI', homeScore: 34, awayScore: 28, week: 1, season: 2024, isPlayoffs: false },
    { date: '2024-09-09', homeTeam: 'PHI', awayTeam: 'GB', homeScore: 24, awayScore: 19, week: 1, season: 2024, isPlayoffs: false },
    { date: '2024-09-09', homeTeam: 'PIT', awayTeam: 'ATL', homeScore: 18, awayScore: 10, week: 1, season: 2024, isPlayoffs: false },
    { date: '2024-09-15', homeTeam: 'KC', awayTeam: 'CIN', homeScore: 26, awayScore: 25, week: 2, season: 2024, isPlayoffs: false },
    { date: '2024-09-16', homeTeam: 'BUF', awayTeam: 'MIA', homeScore: 31, awayScore: 10, week: 2, season: 2024, isPlayoffs: false },
    // Sample 2023 season data
    { date: '2023-09-07', homeTeam: 'KC', awayTeam: 'DET', homeScore: 21, awayScore: 20, week: 1, season: 2023, isPlayoffs: false },
    { date: '2023-09-11', homeTeam: 'BUF', awayTeam: 'NYJ', homeScore: 22, awayScore: 16, week: 1, season: 2023, isPlayoffs: false },
    { date: '2023-01-14', homeTeam: 'BUF', awayTeam: 'MIA', homeScore: 34, awayScore: 31, week: 18, season: 2023, isPlayoffs: true },
    { date: '2023-01-21', homeTeam: 'KC', awayTeam: 'JAX', homeScore: 27, awayScore: 20, week: 19, season: 2023, isPlayoffs: true },
];

export function getGameHistory(): GameHistoryEntry[] {
    return gameHistory;
}

export function getTeamHistory(teamAbbreviation: string, seasons: number = 3): GameHistoryEntry[] {
    return gameHistory.filter(game => 
        (game.homeTeam === teamAbbreviation || game.awayTeam === teamAbbreviation) &&
        game.season >= (2024 - seasons + 1)
    );
}

export function getHeadToHeadRecord(team1: string, team2: string): HeadToHeadRecord {
    const matchups = gameHistory.filter(game => 
        (game.homeTeam === team1 && game.awayTeam === team2) ||
        (game.homeTeam === team2 && game.awayTeam === team1)
    );

    let team1Wins = 0;
    let team2Wins = 0;
    let ties = 0;
    let team1Points = 0;
    let team2Points = 0;

    matchups.forEach(game => {
        if (game.homeTeam === team1) {
            team1Points += game.homeScore;
            team2Points += game.awayScore;
            if (game.homeScore > game.awayScore) team1Wins++;
            else if (game.homeScore < game.awayScore) team2Wins++;
            else ties++;
        } else {
            team1Points += game.awayScore;
            team2Points += game.homeScore;
            if (game.awayScore > game.homeScore) team1Wins++;
            else if (game.awayScore < game.homeScore) team2Wins++;
            else ties++;
        }
    });

    return {
        team1,
        team2,
        team1Wins,
        team2Wins,
        ties,
        lastMeeting: matchups[matchups.length - 1],
        avgPointsTeam1: matchups.length > 0 ? team1Points / matchups.length : 0,
        avgPointsTeam2: matchups.length > 0 ? team2Points / matchups.length : 0
    };
}

export function getRecentPerformance(teamAbbreviation: string, gameCount: number = 5): GameHistoryEntry[] {
    const teamGames = getTeamHistory(teamAbbreviation, 1);
    return teamGames
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, gameCount);
}

export function getSeasonRecord(teamAbbreviation: string, season: number): { wins: number, losses: number, ties: number } {
    const seasonGames = gameHistory.filter(game => 
        (game.homeTeam === teamAbbreviation || game.awayTeam === teamAbbreviation) &&
        game.season === season &&
        !game.isPlayoffs
    );

    let wins = 0, losses = 0, ties = 0;

    seasonGames.forEach(game => {
        const isHome = game.homeTeam === teamAbbreviation;
        const teamScore = isHome ? game.homeScore : game.awayScore;
        const opponentScore = isHome ? game.awayScore : game.homeScore;

        if (teamScore > opponentScore) wins++;
        else if (teamScore < opponentScore) losses++;
        else ties++;
    });

    return { wins, losses, ties };
}