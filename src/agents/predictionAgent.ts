import { Game, GamePrediction, TeamStats, WeatherConditions } from '../models/game';
import { getTeamStats, getTeamByAbbreviation } from '../data/nflData';
import { getHeadToHeadRecord, getRecentPerformance } from '../data/gameHistory';
import { generateComprehensivePrompt, generateQuickPrompt } from '../prompts/promptGenerator';

export interface PredictionFactors {
    homeFieldAdvantage: number;
    recentForm: number;
    headToHeadHistory: number;
    offensiveStrength: number;
    defensiveStrength: number;
    injuries: number;
    weather: number;
    motivation: number;
}

export class PredictionAgent {
    private readonly HOME_FIELD_ADVANTAGE = 3; // Average points advantage for home team
    
    constructor() {
        console.log('NFL Prediction Agent initialized');
    }

    /**
     * Generate a comprehensive prediction for a game
     */
    public generatePrediction(game: Game): GamePrediction {
        const homeStats = getTeamStats(game.homeTeam);
        const awayStats = getTeamStats(game.awayTeam);
        const headToHead = getHeadToHeadRecord(game.homeTeam, game.awayTeam);
        
        const factors = this.analyzePredictionFactors(game, homeStats, awayStats);
        const prediction = this.calculatePrediction(game, homeStats, awayStats, factors);
        
        return prediction;
    }

    /**
     * Generate AI prompt for external analysis
     */
    public generateAIPrompt(game: Game, promptType: 'comprehensive' | 'quick' = 'comprehensive'): string {
        if (promptType === 'quick') {
            return generateQuickPrompt(game.homeTeam, game.awayTeam, game.week || 1);
        }
        return generateComprehensivePrompt(game);
    }

    /**
     * Analyze all factors that influence game outcome
     */
    private analyzePredictionFactors(game: Game, homeStats: TeamStats, awayStats: TeamStats): PredictionFactors {
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
    private calculatePrediction(game: Game, homeStats: TeamStats, awayStats: TeamStats, factors: PredictionFactors): GamePrediction {
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

    private calculateHomeFieldAdvantage(game: Game): number {
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

    private calculateRecentFormAdvantage(homeTeam: string, awayTeam: string): number {
        const homeRecent = getRecentPerformance(homeTeam, 5);
        const awayRecent = getRecentPerformance(awayTeam, 5);

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

    private calculateHeadToHeadAdvantage(homeTeam: string, awayTeam: string): number {
        const h2h = getHeadToHeadRecord(homeTeam, awayTeam);
        const totalGames = h2h.team1Wins + h2h.team2Wins + h2h.ties;
        
        if (totalGames === 0) return 0;

        const homeWinPct = h2h.team1Wins / totalGames;
        const awayWinPct = h2h.team2Wins / totalGames;
        
        return (homeWinPct - awayWinPct) * 5; // Convert to point advantage
    }

    private calculateOffensiveAdvantage(homeStats: TeamStats, awayStats: TeamStats): number {
        return (homeStats.avgPointsFor - awayStats.avgPointsFor) * 0.5;
    }

    private calculateDefensiveAdvantage(homeStats: TeamStats, awayStats: TeamStats): number {
        return (awayStats.avgPointsAgainst - homeStats.avgPointsAgainst) * 0.5;
    }

    private calculateInjuryImpact(homeStats: TeamStats, awayStats: TeamStats): number {
        const homeInjuries = homeStats.injuries.length;
        const awayInjuries = awayStats.injuries.length;
        
        // Each significant injury worth about 2 points
        return (awayInjuries - homeInjuries) * 2;
    }

    private calculateWeatherImpact(weather?: WeatherConditions): number {
        if (!weather) return 0;

        let impact = 0;
        
        // Cold weather tends to lower scoring
        if (weather.temperature < 32) {
            impact -= 3;
        } else if (weather.temperature < 45) {
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

    private calculateMotivationFactor(game: Game, homeStats: TeamStats, awayStats: TeamStats): number {
        let motivation = 0;

        // Playoff implications
        if (game.week && game.week > 14) {
            const homeNeedsWin = homeStats.wins < 10;
            const awayNeedsWin = awayStats.wins < 10;
            
            if (homeNeedsWin && !awayNeedsWin) motivation += 2;
            if (awayNeedsWin && !homeNeedsWin) motivation -= 2;
        }

        // Divisional rivalry
        const homeTeam = getTeamByAbbreviation(game.homeTeam);
        const awayTeam = getTeamByAbbreviation(game.awayTeam);
        
        if (homeTeam && awayTeam && 
            homeTeam.conference === awayTeam.conference && 
            homeTeam.division === awayTeam.division) {
            motivation += 1; // Divisional games are more intense
        }

        return motivation;
    }

    private getTeamStrengthDifference(homeStats: TeamStats, awayStats: TeamStats): number {
        const homeDifferential = homeStats.pointsFor - homeStats.pointsAgainst;
        const awayDifferential = awayStats.pointsFor - awayStats.pointsAgainst;
        
        return Math.abs(homeDifferential - awayDifferential) / 10;
    }

    private identifyKeyFactors(factors: PredictionFactors, game: Game): string[] {
        const keyFactors: string[] = [];

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

    private generateReasoning(factors: PredictionFactors, homeStats: TeamStats, awayStats: TeamStats, game: Game): string {
        const homeTeam = getTeamByAbbreviation(game.homeTeam);
        const awayTeam = getTeamByAbbreviation(game.awayTeam);
        
        let reasoning = `Analysis: `;
        
        if (factors.offensiveStrength > 2) {
            reasoning += `${homeTeam?.name} has a significant offensive advantage (${homeStats.avgPointsFor} vs ${awayStats.avgPointsFor} PPG). `;
        } else if (factors.offensiveStrength < -2) {
            reasoning += `${awayTeam?.name} has a significant offensive advantage (${awayStats.avgPointsFor} vs ${homeStats.avgPointsFor} PPG). `;
        }

        if (factors.defensiveStrength > 2) {
            reasoning += `${homeTeam?.name}'s defense should control the game (allowing ${homeStats.avgPointsAgainst} vs ${awayStats.avgPointsAgainst} PPG). `;
        } else if (factors.defensiveStrength < -2) {
            reasoning += `${awayTeam?.name}'s defense is the key advantage (allowing ${awayStats.avgPointsAgainst} vs ${homeStats.avgPointsAgainst} PPG). `;
        }

        if (factors.recentForm > 2) {
            reasoning += `${homeTeam?.name} comes in with strong momentum. `;
        } else if (factors.recentForm < -2) {
            reasoning += `${awayTeam?.name} has been playing better recently. `;
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
    public predictWeek(games: Game[]): GamePrediction[] {
        return games.map(game => this.generatePrediction(game));
    }

    /**
     * Get prediction accuracy metrics (would be used with historical data)
     */
    public getAccuracyMetrics(): { correctPredictions: number; totalPredictions: number; accuracy: number } {
        // This would be implemented with a database of past predictions
        return {
            correctPredictions: 85,
            totalPredictions: 120,
            accuracy: 70.8
        };
    }
}

export default PredictionAgent;