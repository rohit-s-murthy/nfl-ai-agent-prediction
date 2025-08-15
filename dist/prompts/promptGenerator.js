"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateComprehensivePrompt = generateComprehensivePrompt;
exports.generateQuickPrompt = generateQuickPrompt;
exports.generateWeeklyPrompts = generateWeeklyPrompts;
const game_1 = require("../models/game");
const nflData_1 = require("../data/nflData");
const gameHistory_1 = require("../data/gameHistory");
function generateComprehensivePrompt(game) {
    const context = buildMatchupContext(game);
    return `NFL Game Prediction Analysis

MATCHUP: ${context.awayTeam.name} @ ${context.homeTeam.name}
DATE: ${game.date.toDateString()}
WEEK: ${game.week || 'TBD'} (${game.isPlayoffs ? 'PLAYOFFS' : 'Regular Season'})

=== TEAM INFORMATION ===

${context.awayTeam.name} (${context.awayTeam.abbreviation}):
- Conference: ${context.awayTeam.conference} ${context.awayTeam.division}
- Stadium: Playing @ ${context.homeTeam.stadium}
- Current Record: ${context.awayStats.wins}-${context.awayStats.losses}-${context.awayStats.ties}
- Away Record: ${context.awayStats.awayRecord}

${context.homeTeam.name} (${context.homeTeam.abbreviation}):
- Conference: ${context.homeTeam.conference} ${context.homeTeam.division}
- Stadium: ${context.homeTeam.stadium} (Home advantage)
- Current Record: ${context.homeStats.wins}-${context.homeStats.losses}-${context.homeStats.ties}
- Home Record: ${context.homeStats.homeRecord}

=== OFFENSIVE & DEFENSIVE PERFORMANCE ===

${context.awayTeam.name} Offense/Defense:
- Average Points Scored: ${context.awayStats.avgPointsFor} per game
- Average Points Allowed: ${context.awayStats.avgPointsAgainst} per game
- Total Points For: ${context.awayStats.pointsFor}
- Total Points Against: ${context.awayStats.pointsAgainst}
- Point Differential: ${(context.awayStats.pointsFor - context.awayStats.pointsAgainst) > 0 ? '+' : ''}${context.awayStats.pointsFor - context.awayStats.pointsAgainst}

${context.homeTeam.name} Offense/Defense:
- Average Points Scored: ${context.homeStats.avgPointsFor} per game
- Average Points Allowed: ${context.homeStats.avgPointsAgainst} per game
- Total Points For: ${context.homeStats.pointsFor}
- Total Points Against: ${context.homeStats.pointsAgainst}
- Point Differential: ${(context.homeStats.pointsFor - context.homeStats.pointsAgainst) > 0 ? '+' : ''}${context.homeStats.pointsFor - context.homeStats.pointsAgainst}

=== RECENT FORM & MOMENTUM ===

${context.awayTeam.name} Last 5 Games: ${context.awayStats.lastFiveGames}
${context.homeTeam.name} Last 5 Games: ${context.homeStats.lastFiveGames}

=== HEAD-TO-HEAD HISTORY ===

All-Time Series: ${context.homeTeam.name} ${context.headToHead.team1 === context.homeTeam.abbreviation ? context.headToHead.team1Wins : context.headToHead.team2Wins}-${context.headToHead.team1 === context.homeTeam.abbreviation ? context.headToHead.team2Wins : context.headToHead.team1Wins}-${context.headToHead.ties} ${context.awayTeam.name}
${context.headToHead.lastMeeting ? `Last Meeting: ${new Date(context.headToHead.lastMeeting.date).toDateString()} - ${context.headToHead.lastMeeting.homeTeam} ${context.headToHead.lastMeeting.homeScore}, ${context.headToHead.lastMeeting.awayTeam} ${context.headToHead.lastMeeting.awayScore}` : 'No recent meetings found'}
Average Points in Head-to-Head:
- ${context.homeTeam.name}: ${context.headToHead.avgPointsTeam1.toFixed(1)} points
- ${context.awayTeam.name}: ${context.headToHead.avgPointsTeam2.toFixed(1)} points

=== INJURY REPORT & KEY PLAYERS ===

${context.awayTeam.name} Injuries: ${context.awayStats.injuries.length > 0 ? context.awayStats.injuries.join(', ') : 'No significant injuries reported'}
${context.awayTeam.name} Key Players: ${context.awayStats.keyPlayers.length > 0 ? context.awayStats.keyPlayers.join(', ') : 'Key players TBD'}

${context.homeTeam.name} Injuries: ${context.homeStats.injuries.length > 0 ? context.homeStats.injuries.join(', ') : 'No significant injuries reported'}
${context.homeTeam.name} Key Players: ${context.homeStats.keyPlayers.length > 0 ? context.homeStats.keyPlayers.join(', ') : 'Key players TBD'}

${context.weather ? `=== WEATHER CONDITIONS ===
Temperature: ${context.weather.temperature}°F
Wind Speed: ${context.weather.windSpeed} mph
Conditions: ${context.weather.conditions}
Precipitation: ${context.weather.precipitation}%
` : ''}

=== ANALYSIS REQUEST ===

Based on the comprehensive data above, please provide:

1. **GAME PREDICTION**: Who will win and by how many points?
2. **CONFIDENCE LEVEL**: Rate your confidence (1-10) and explain why
3. **KEY FACTORS**: What are the 3-5 most important factors that will determine the outcome?
4. **OVER/UNDER**: Predict the total points scored and whether it will be high/low scoring
5. **X-FACTORS**: What unexpected elements could swing the game?
6. **FINAL SCORE PREDICTION**: Provide an exact score prediction

Consider all statistical trends, recent form, injuries, weather (if applicable), home field advantage, divisional rivalry dynamics, and historical matchup patterns in your analysis.`;
}
function generateQuickPrompt(homeTeam, awayTeam, week) {
    const homeStats = (0, nflData_1.getTeamStats)(homeTeam);
    const awayStats = (0, nflData_1.getTeamStats)(awayTeam);
    const headToHead = (0, gameHistory_1.getHeadToHeadRecord)(homeTeam, awayTeam);
    return `Quick NFL Prediction:

${awayTeam} (${awayStats.wins}-${awayStats.losses}) @ ${homeTeam} (${homeStats.wins}-${homeStats.losses}) - Week ${week}

Recent Form:
- ${awayTeam}: ${awayStats.lastFiveGames}
- ${homeTeam}: ${homeStats.lastFiveGames}

Head-to-Head: ${homeTeam} leads ${headToHead.team1Wins}-${headToHead.team2Wins}

Key Stats:
- ${awayTeam}: ${awayStats.avgPointsFor} PPG scored, ${awayStats.avgPointsAgainst} PPG allowed
- ${homeTeam}: ${homeStats.avgPointsFor} PPG scored, ${homeStats.avgPointsAgainst} PPG allowed

Who wins and by how much?`;
}
function buildMatchupContext(game) {
    const homeTeam = (0, nflData_1.getTeamByAbbreviation)(game.homeTeam);
    const awayTeam = (0, nflData_1.getTeamByAbbreviation)(game.awayTeam);
    if (!homeTeam || !awayTeam) {
        throw new Error(`Team not found: ${game.homeTeam} or ${game.awayTeam}`);
    }
    const homeStats = (0, nflData_1.getTeamStats)(game.homeTeam);
    const awayStats = (0, nflData_1.getTeamStats)(game.awayTeam);
    const headToHead = (0, gameHistory_1.getHeadToHeadRecord)(game.homeTeam, game.awayTeam);
    const homeRecentPerformance = (0, gameHistory_1.getRecentPerformance)(game.homeTeam);
    const awayRecentPerformance = (0, gameHistory_1.getRecentPerformance)(game.awayTeam);
    return {
        homeTeam,
        awayTeam,
        homeStats,
        awayStats,
        headToHead,
        homeRecentForm: formatRecentForm(homeRecentPerformance, game.homeTeam),
        awayRecentForm: formatRecentForm(awayRecentPerformance, game.awayTeam),
        weather: game.weather,
        week: game.week || 1,
        season: game.season || 2025,
        isPlayoffs: game.isPlayoffs
    };
}
function formatRecentForm(recentGames, teamAbbr) {
    return recentGames.map(game => {
        const isHome = game.homeTeam === teamAbbr;
        const teamScore = isHome ? game.homeScore : game.awayScore;
        const opponentScore = isHome ? game.awayScore : game.homeScore;
        if (teamScore > opponentScore)
            return 'W';
        else if (teamScore < opponentScore)
            return 'L';
        else
            return 'T';
    }).join('-');
}
function generateWeeklyPrompts(week, season = 2025) {
    // Sample weekly matchups - in a real app, this would come from an API
    const weeklyMatchups = [
        { home: 'KC', away: 'BUF' },
        { home: 'SF', away: 'PHI' },
        { home: 'DAL', away: 'NYG' },
        { home: 'GB', away: 'CHI' },
        { home: 'PIT', away: 'BAL' }
    ];
    return weeklyMatchups.map(matchup => {
        const game = new game_1.Game(matchup.home, matchup.away, new Date(), 0, 0, week, season);
        return generateComprehensivePrompt(game);
    });
}
