"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionAgent = void 0;
const nflData_1 = require("../data/nflData");
const gameHistory_1 = require("../data/gameHistory");
const promptGenerator_1 = require("../prompts/promptGenerator");
class PredictionAgent {
    constructor() {
        this.HOME_FIELD_ADVANTAGE = 3; // Average points advantage for home team
        console.log('NFL Prediction Agent initialized');
    }
    /**
     * Generate a comprehensive prediction for a game
     */
    generatePrediction(game) {
        const homeStats = (0, nflData_1.getTeamStats)(game.homeTeam);
        const awayStats = (0, nflData_1.getTeamStats)(game.awayTeam);
        const headToHead = (0, gameHistory_1.getHeadToHeadRecord)(game.homeTeam, game.awayTeam);
        const factors = this.analyzePredictionFactors(game, homeStats, awayStats);
        const prediction = this.calculatePrediction(game, homeStats, awayStats, factors);
        return prediction;
    }
    /**
     * Generate AI prompt for external analysis
     */
    generateAIPrompt(game, promptType = 'comprehensive') {
        if (promptType === 'quick') {
            return (0, promptGenerator_1.generateQuickPrompt)(game.homeTeam, game.awayTeam, game.week || 1);
        }
        return (0, promptGenerator_1.generateComprehensivePrompt)(game);
    }
    /**
     * Analyze all factors that influence game outcome
     */
    analyzePredictionFactors(game, homeStats, awayStats) {
        return {
            homeFieldAdvantage: this.calculateHomeFieldAdvantage(game),
            recentForm: this.calculateRecentFormAdvantage(game.homeTeam, game.awayTeam),
            headToHeadHistory: this.calculateHeadToHeadAdvantage(game.homeTeam, game.awayTeam),
            offensiveStrength: this.calculateOffensiveAdvantage(homeStats, awayStats),
            defensiveStrength: this.calculateDefensiveAdvantage(homeStats, awayStats),
            injuries: this.calculateInjuryImpact(homeStats, awayStats),
            weather: this.calculateWeatherImpact(game.weather),
            motivation: this.calculateMotivationFactor(game, homeStats, awayStats)
        };
    }
    /**
     * Calculate the main prediction based on all factors
     */
    calculatePrediction(game, homeStats, awayStats, factors) {
        // Base prediction on team strength
        const homeOffensiveRating = homeStats.avgPointsFor;
        const awayOffensiveRating = awayStats.avgPointsFor;
        const homeDefensiveRating = 35 - homeStats.avgPointsAgainst; // Inverse rating
        const awayDefensiveRating = 35 - awayStats.avgPointsAgainst;
        // Calculate expected scores
        let homeExpectedScore = (homeOffensiveRating + (35 - awayStats.avgPointsAgainst)) / 2;
        let awayExpectedScore = (awayOffensiveRating + (35 - homeStats.avgPointsAgainst)) / 2;
        // Apply factors
        homeExpectedScore += factors.homeFieldAdvantage;
        homeExpectedScore += factors.recentForm > 0 ? factors.recentForm : 0;
        awayExpectedScore += factors.recentForm < 0 ? Math.abs(factors.recentForm) : 0;
        homeExpectedScore += factors.headToHeadHistory > 0 ? factors.headToHeadHistory : 0;
        awayExpectedScore += factors.headToHeadHistory < 0 ? Math.abs(factors.headToHeadHistory) : 0;
        homeExpectedScore += factors.offensiveStrength > 0 ? factors.offensiveStrength : 0;
        awayExpectedScore += factors.offensiveStrength < 0 ? Math.abs(factors.offensiveStrength) : 0;
        homeExpectedScore += factors.defensiveStrength > 0 ? factors.defensiveStrength : 0;
        awayExpectedScore += factors.defensiveStrength < 0 ? Math.abs(factors.defensiveStrength) : 0;
        // Weather and injury adjustments
        if (factors.weather !== 0) {
            homeExpectedScore += factors.weather / 2;
            awayExpectedScore += factors.weather / 2;
        }
        homeExpectedScore += factors.injuries > 0 ? factors.injuries : 0;
        awayExpectedScore += factors.injuries < 0 ? Math.abs(factors.injuries) : 0;
        // Round to realistic scores
        const homeScore = Math.round(Math.max(7, homeExpectedScore));
        const awayScore = Math.round(Math.max(7, awayExpectedScore));
        // Determine winner and confidence
        const scoreDifference = Math.abs(homeScore - awayScore);
        const predictedWinner = homeScore > awayScore ? game.homeTeam : game.awayTeam;
        const confidence = Math.min(95, Math.max(55, 50 + (scoreDifference * 3) + this.getTeamStrengthDifference(homeStats, awayStats)));
        const keyFactors = this.identifyKeyFactors(factors, game);
        const reasoning = this.generateReasoning(factors, homeStats, awayStats, game);
        return {
            predictedWinner,
            confidence: Math.round(confidence),
            predictedScore: {
                home: homeScore,
                away: awayScore
            },
            keyFactors,
            reasoning
        };
    }
    calculateHomeFieldAdvantage(game) {
        // Home field advantage varies by team and situation
        let advantage = this.HOME_FIELD_ADVANTAGE;
        if (game.isPlayoffs) {
            advantage += 1; // Extra boost in playoffs
        }
        if (game.weather && (game.weather.temperature < 32 || game.weather.windSpeed > 20)) {
            advantage += 2; // Home team better adapted to weather
        }
        return advantage;
    }
    calculateRecentFormAdvantage(homeTeam, awayTeam) {
        const homeRecent = (0, gameHistory_1.getRecentPerformance)(homeTeam, 5);
        const awayRecent = (0, gameHistory_1.getRecentPerformance)(awayTeam, 5);
        const homeWins = homeRecent.filter(game => {
            const isHome = game.homeTeam === homeTeam;
            const teamScore = isHome ? game.homeScore : game.awayScore;
            const opponentScore = isHome ? game.awayScore : game.homeScore;
            return teamScore > opponentScore;
        }).length;
        const awayWins = awayRecent.filter(game => {
            const isHome = game.homeTeam === awayTeam;
            const teamScore = isHome ? game.homeScore : game.awayScore;
            const opponentScore = isHome ? game.awayScore : game.homeScore;
            return teamScore > opponentScore;
        }).length;
        return (homeWins - awayWins) * 1.5; // Each additional win worth 1.5 points
    }
    calculateHeadToHeadAdvantage(homeTeam, awayTeam) {
        const h2h = (0, gameHistory_1.getHeadToHeadRecord)(homeTeam, awayTeam);
        const totalGames = h2h.team1Wins + h2h.team2Wins + h2h.ties;
        if (totalGames === 0)
            return 0;
        const homeWinPct = h2h.team1Wins / totalGames;
        const awayWinPct = h2h.team2Wins / totalGames;
        return (homeWinPct - awayWinPct) * 5; // Convert to point advantage
    }
    calculateOffensiveAdvantage(homeStats, awayStats) {
        return (homeStats.avgPointsFor - awayStats.avgPointsFor) * 0.5;
    }
    calculateDefensiveAdvantage(homeStats, awayStats) {
        return (awayStats.avgPointsAgainst - homeStats.avgPointsAgainst) * 0.5;
    }
    calculateInjuryImpact(homeStats, awayStats) {
        const homeInjuries = homeStats.injuries.length;
        const awayInjuries = awayStats.injuries.length;
        // Each significant injury worth about 2 points
        return (awayInjuries - homeInjuries) * 2;
    }
    calculateWeatherImpact(weather) {
        if (!weather)
            return 0;
        let impact = 0;
        // Cold weather tends to lower scoring
        if (weather.temperature < 32) {
            impact -= 3;
        }
        else if (weather.temperature < 45) {
            impact -= 1;
        }
        // High winds affect passing games
        if (weather.windSpeed > 20) {
            impact -= 2;
        }
        // Rain/snow affects scoring
        if (weather.precipitation > 50) {
            impact -= 2;
        }
        return impact;
    }
    calculateMotivationFactor(game, homeStats, awayStats) {
        let motivation = 0;
        // Playoff implications
        if (game.week && game.week > 14) {
            const homeNeedsWin = homeStats.wins < 10;
            const awayNeedsWin = awayStats.wins < 10;
            if (homeNeedsWin && !awayNeedsWin)
                motivation += 2;
            if (awayNeedsWin && !homeNeedsWin)
                motivation -= 2;
        }
        // Divisional rivalry
        const homeTeam = (0, nflData_1.getTeamByAbbreviation)(game.homeTeam);
        const awayTeam = (0, nflData_1.getTeamByAbbreviation)(game.awayTeam);
        if (homeTeam && awayTeam &&
            homeTeam.conference === awayTeam.conference &&
            homeTeam.division === awayTeam.division) {
            motivation += 1; // Divisional games are more intense
        }
        return motivation;
    }
    getTeamStrengthDifference(homeStats, awayStats) {
        const homeDifferential = homeStats.pointsFor - homeStats.pointsAgainst;
        const awayDifferential = awayStats.pointsFor - awayStats.pointsAgainst;
        return Math.abs(homeDifferential - awayDifferential) / 10;
    }
    identifyKeyFactors(factors, game) {
        const keyFactors = [];
        if (Math.abs(factors.homeFieldAdvantage) > 2) {
            keyFactors.push(`Home field advantage (${factors.homeFieldAdvantage > 0 ? '+' : ''}${factors.homeFieldAdvantage.toFixed(1)} pts)`);
        }
        if (Math.abs(factors.recentForm) > 2) {
            keyFactors.push(`Recent form momentum (${factors.recentForm > 0 ? 'Home' : 'Away'} team has better recent record)`);
        }
        if (Math.abs(factors.offensiveStrength) > 3) {
            keyFactors.push(`Offensive mismatch (${factors.offensiveStrength > 0 ? 'Home' : 'Away'} team has significant scoring advantage)`);
        }
        if (Math.abs(factors.defensiveStrength) > 3) {
            keyFactors.push(`Defensive mismatch (${factors.defensiveStrength > 0 ? 'Home' : 'Away'} team has much better defense)`);
        }
        if (factors.injuries !== 0) {
            keyFactors.push(`Injury concerns (${factors.injuries > 0 ? 'Away' : 'Home'} team has more significant injuries)`);
        }
        if (factors.weather < -2) {
            keyFactors.push('Weather conditions favor defensive game');
        }
        if (game.isPlayoffs) {
            keyFactors.push('Playoff pressure and experience');
        }
        return keyFactors.slice(0, 5); // Return top 5 factors
    }
    generateReasoning(factors, homeStats, awayStats, game) {
        const homeTeam = (0, nflData_1.getTeamByAbbreviation)(game.homeTeam);
        const awayTeam = (0, nflData_1.getTeamByAbbreviation)(game.awayTeam);
        let reasoning = `Analysis: `;
        if (factors.offensiveStrength > 2) {
            reasoning += `${homeTeam === null || homeTeam === void 0 ? void 0 : homeTeam.name} has a significant offensive advantage (${homeStats.avgPointsFor} vs ${awayStats.avgPointsFor} PPG). `;
        }
        else if (factors.offensiveStrength < -2) {
            reasoning += `${awayTeam === null || awayTeam === void 0 ? void 0 : awayTeam.name} has a significant offensive advantage (${awayStats.avgPointsFor} vs ${homeStats.avgPointsFor} PPG). `;
        }
        if (factors.defensiveStrength > 2) {
            reasoning += `${homeTeam === null || homeTeam === void 0 ? void 0 : homeTeam.name}'s defense should control the game (allowing ${homeStats.avgPointsAgainst} vs ${awayStats.avgPointsAgainst} PPG). `;
        }
        else if (factors.defensiveStrength < -2) {
            reasoning += `${awayTeam === null || awayTeam === void 0 ? void 0 : awayTeam.name}'s defense is the key advantage (allowing ${awayStats.avgPointsAgainst} vs ${homeStats.avgPointsAgainst} PPG). `;
        }
        if (factors.recentForm > 2) {
            reasoning += `${homeTeam === null || homeTeam === void 0 ? void 0 : homeTeam.name} comes in with strong momentum. `;
        }
        else if (factors.recentForm < -2) {
            reasoning += `${awayTeam === null || awayTeam === void 0 ? void 0 : awayTeam.name} has been playing better recently. `;
        }
        if (game.weather && factors.weather < -2) {
            reasoning += `Weather conditions should limit offensive production. `;
        }
        reasoning += `Home field advantage should provide ${factors.homeFieldAdvantage.toFixed(1)} point boost.`;
        return reasoning;
    }
    /**
     * Batch prediction for multiple games
     */
    predictWeek(games) {
        return games.map(game => this.generatePrediction(game));
    }
    /**
     * Get prediction accuracy metrics (would be used with historical data)
     */
    getAccuracyMetrics() {
        // This would be implemented with a database of past predictions
        return {
            correctPredictions: 85,
            totalPredictions: 120,
            accuracy: 70.8
        };
    }
}
exports.PredictionAgent = PredictionAgent;
exports.default = PredictionAgent;
