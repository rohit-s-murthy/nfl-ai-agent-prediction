import * as cron from 'node-cron';
import { Game } from '../models/game';
import { PredictionAgent } from '../agents/predictionAgent';
import { generateWeeklyPrompts } from '../prompts/promptGenerator';
import { teams } from '../data/nflData';
import NFLScheduleAPI, { NFLMatchup } from '../data/nflScheduleAPI';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface WeeklySchedule {
    week: number;
    season: number;
    games: Game[];
    predictionDeadline: Date;
}

export class NFLScheduler {
    private predictionAgent: PredictionAgent;
    private nflAPI: NFLScheduleAPI;
    private currentSeason: number = 2025;
    private currentWeek: number = 1;

    constructor() {
        this.predictionAgent = new PredictionAgent();
        this.nflAPI = new NFLScheduleAPI();
        
        // Set current week based on real date
        this.currentWeek = this.nflAPI.getCurrentWeek();
        console.log(`🗓️  Initialized to current NFL Week ${this.currentWeek}`);
    }

    /**
     * Schedule automatic predictions for the entire season
     */
    public schedulePredictions(): void {
        console.log('🏈 NFL Prediction Scheduler initialized');
        
        // Schedule Tuesday predictions (2 days before Thursday games)
        cron.schedule('0 10 * * 2', () => {
            this.runWeeklyPredictions();
        }, {
            scheduled: true,
            timezone: "America/New_York"
        });

        // Schedule Sunday morning updates (day of most games)
        cron.schedule('0 8 * * 0', () => {
            this.runSundayUpdates();
        }, {
            scheduled: true,
            timezone: "America/New_York"
        });

        console.log('✅ Automated prediction schedule set:');
        console.log('   - Tuesday 10:00 AM ET: Weekly predictions');
        console.log('   - Sunday 8:00 AM ET: Game day updates');
    }

    /**
     * Run predictions for the current week
     */
    public async runWeeklyPredictions(): Promise<void> {
        try {
            console.log(`\n🎯 Running Week ${this.currentWeek} Predictions...`);
            
            const weekSchedule = this.generateWeekSchedule(this.currentWeek, this.currentSeason);
            const predictions = this.predictionAgent.predictWeek(weekSchedule.games);
            
            console.log(`\n📊 WEEK ${this.currentWeek} NFL PREDICTIONS`);
            console.log('=' .repeat(50));
            
            for (let index = 0; index < weekSchedule.games.length; index++) {
                const game = weekSchedule.games[index];
                const prediction = predictions[index];
                const homeTeam = this.getTeamName(game.homeTeam);
                const awayTeam = this.getTeamName(game.awayTeam);
                
                console.log(`\n🏟️  ${awayTeam} @ ${homeTeam}`);
                console.log(`📅 ${game.date.toDateString()}`);
                console.log(`🏆 Prediction: ${this.getTeamName(prediction.predictedWinner)} wins`);
                console.log(`📈 Score: ${homeTeam} ${prediction.predictedScore.home}, ${awayTeam} ${prediction.predictedScore.away}`);
                console.log(`🎯 Confidence: ${prediction.confidence}%`);
                console.log(`🔑 Key Factors: ${prediction.keyFactors.slice(0, 2).join(', ')}`);
                
                // Generate and save AI prompt
                const aiPrompt = this.predictionAgent.generateAIPrompt(game, 'comprehensive');
                await this.savePromptToFile(game, aiPrompt);
            }

            // Move to next week
            this.currentWeek++;
            if (this.currentWeek > 18) {
                this.currentWeek = 1; // Reset for playoffs or next season
            }

        } catch (error) {
            console.error('❌ Error running weekly predictions:', error);
        }
    }

    /**
     * Run predictions using real NFL schedule from ESPN API
     */
    public async runRealWeeklyPredictions(): Promise<void> {
        try {
            console.log(`\n🎯 Generating predictions for Week ${this.currentWeek}, ${this.currentSeason} season (Real Schedule)`);
            
            // Fetch real NFL schedule from ESPN API
            const realSchedule = await this.nflAPI.getWeeklySchedule(this.currentWeek, this.currentSeason);
            const weeklyGames = this.convertToGameObjects(realSchedule);
            
            if (weeklyGames.length === 0) {
                console.log(`⚠️  No games scheduled for Week ${this.currentWeek}`);
                return;
            }

            const predictions = this.predictionAgent.predictWeek(weeklyGames);

            console.log(`\n📊 WEEK ${this.currentWeek} NFL PREDICTIONS (Real Schedule)`);
            console.log('=' .repeat(60));
            
            for (let index = 0; index < weeklyGames.length; index++) {
                const game = weeklyGames[index];
                const prediction = predictions[index];
                const realMatchup = realSchedule[index];
                const homeTeam = this.getTeamName(game.homeTeam);
                const awayTeam = this.getTeamName(game.awayTeam);
                
                console.log(`\n🏟️  ${awayTeam} @ ${homeTeam}`);
                console.log(`📅 ${game.date.toDateString()} at ${game.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })} ET`);
                console.log(`🏟️  Venue: ${realMatchup.venue}`);
                
                if (realMatchup.weather) {
                    console.log(`🌤️  Weather: ${realMatchup.weather.temperature}°F, ${realMatchup.weather.conditions}`);
                }
                
                console.log(`🏆 Prediction: ${this.getTeamName(prediction.predictedWinner)} wins`);
                console.log(`📈 Score: ${homeTeam} ${prediction.predictedScore.home}, ${awayTeam} ${prediction.predictedScore.away}`);
                console.log(`🎯 Confidence: ${prediction.confidence}%`);
                console.log(`🔑 Key Factors: ${prediction.keyFactors.slice(0, 2).join(', ')}`);
                
                // Generate and save AI prompt with real data
                const aiPrompt = this.predictionAgent.generateAIPrompt(game, 'comprehensive');
                await this.savePromptToFile(game, aiPrompt);
            }

            console.log(`\n✅ Week ${this.currentWeek} predictions completed!`);
            console.log(`📁 ${weeklyGames.length} prompts saved to generated-prompts/ directory`);
            console.log(`🌐 Schedule data sourced from ESPN NFL API`);
            
        } catch (error) {
            console.error('❌ Error running weekly predictions:', error);
        }
    }

    /**
     * Convert NFL API matchups to Game objects
     */
    private convertToGameObjects(matchups: NFLMatchup[]): Game[] {
        return matchups.map(matchup => {
            const game = new Game(
                matchup.home,
                matchup.away,
                matchup.date,
                0,
                0,
                this.currentWeek,
                this.currentSeason,
                this.currentWeek > 18 // Playoffs
            );

            // Add weather data if available
            if (matchup.weather) {
                game.weather = {
                    temperature: matchup.weather.temperature,
                    windSpeed: 0, // Not provided by ESPN API
                    precipitation: 0, // Not provided by ESPN API
                    conditions: matchup.weather.conditions
                };
            }

            return game;
        });
    }

    /**
     * Get live scores and update predictions
     */
    public async updateLiveScores(): Promise<void> {
        try {
            console.log('\n📺 Fetching live scores...');
            const liveScores = await this.nflAPI.getLiveScores();
            
            liveScores.forEach(score => {
                if (score.homeScore > 0 || score.awayScore > 0) {
                    console.log(`⚡ Live: ${score.awayScore} - ${score.homeScore} (${score.status})`);
                }
            });
        } catch (error) {
            console.error('❌ Error fetching live scores:', error);
        }
    }

    /**
     * Check if current week has real games scheduled
     */
    public async hasRealGamesThisWeek(): Promise<boolean> {
        return await this.nflAPI.hasGamesScheduled(this.currentWeek, this.currentSeason);
    }

    /**
     * Public method to check if games are scheduled for a specific week
     */
    public async hasGamesScheduled(week: number, season: number = this.currentSeason): Promise<boolean> {
        return await this.nflAPI.hasGamesScheduled(week, season);
    }

    /**
     * Predict specific week using real schedule
     */
    public async predictSpecificWeekReal(week: number, season: number = this.currentSeason): Promise<void> {
        const originalWeek = this.currentWeek;
        this.currentWeek = week;
        
        await this.runRealWeeklyPredictions();
        
        this.currentWeek = originalWeek;
    }

    /**
     * Generate schedule for a specific week
     */
    public generateWeekSchedule(week: number, season: number): WeeklySchedule {
        const games: Game[] = [];
        
        // Sample week schedule (in real app, this would come from NFL API)
        const weeklyMatchups = this.getWeeklyMatchups(week);
        
        weeklyMatchups.forEach(matchup => {
            const gameDate = this.getGameDate(week, season, matchup.day);
            const game = new Game(
                matchup.home,
                matchup.away,
                gameDate,
                0,
                0,
                week,
                season,
                week > 18 // Playoffs
            );
            games.push(game);
        });

        const predictionDeadline = new Date();
        predictionDeadline.setDate(predictionDeadline.getDate() + (2 - predictionDeadline.getDay() + 7) % 7); // Next Tuesday
        predictionDeadline.setHours(10, 0, 0, 0);

        return {
            week,
            season,
            games,
            predictionDeadline
        };
    }

    /**
     * Run Sunday morning updates
     */
    private runSundayUpdates(): void {
        console.log('\n🌅 Sunday Morning Update');
        console.log('Generating last-minute injury reports and weather updates...');
        
        const todaysGames = this.getTodaysGames();
        todaysGames.forEach(game => {
            console.log(`⚡ ${this.getTeamName(game.awayTeam)} @ ${this.getTeamName(game.homeTeam)} - Game day!`);
        });
    }

    /**
     * Get sample weekly matchups (in real app, fetch from NFL API)
     */
    private getWeeklyMatchups(week: number): Array<{home: string, away: string, day: string}> {
        const sampleMatchups = [
            // Thursday Night
            { home: 'KC', away: 'BUF', day: 'Thursday' },
            
            // Sunday 1:00 PM ET
            { home: 'DAL', away: 'NYG', day: 'Sunday' },
            { home: 'GB', away: 'CHI', day: 'Sunday' },
            { home: 'SF', away: 'LAR', day: 'Sunday' },
            { home: 'MIA', away: 'NYJ', day: 'Sunday' },
            { home: 'PIT', away: 'BAL', day: 'Sunday' },
            { home: 'MIN', away: 'DET', day: 'Sunday' },
            { home: 'TEN', away: 'IND', day: 'Sunday' },
            { home: 'JAX', away: 'HOU', day: 'Sunday' },
            
            // Sunday 4:25 PM ET
            { home: 'DEN', away: 'LV', day: 'Sunday' },
            { home: 'LAC', away: 'ARI', day: 'Sunday' },
            { home: 'SEA', away: 'TB', day: 'Sunday' },
            { home: 'ATL', away: 'CAR', day: 'Sunday' },
            
            // Sunday Night
            { home: 'PHI', away: 'WAS', day: 'Sunday' },
            
            // Monday Night
            { home: 'NO', away: 'CLE', day: 'Monday' },
            { home: 'NE', away: 'CIN', day: 'Monday' }
        ];

        // Rotate matchups based on week to simulate different schedules
        const startIndex = (week - 1) * 2 % sampleMatchups.length;
        return sampleMatchups.slice(startIndex, startIndex + 8).concat(
            sampleMatchups.slice(0, Math.max(0, startIndex + 8 - sampleMatchups.length))
        );
    }

    /**
     * Calculate game date based on week and day
     */
    private getGameDate(week: number, season: number, day: string): Date {
        const seasonStart = new Date(season, 8, 5); // Approximate season start (September 5)
        const weekStart = new Date(seasonStart);
        weekStart.setDate(seasonStart.getDate() + (week - 1) * 7);

        const gameDate = new Date(weekStart);
        
        switch (day) {
            case 'Thursday':
                gameDate.setDate(weekStart.getDate() + 4);
                gameDate.setHours(20, 15); // 8:15 PM ET
                break;
            case 'Sunday':
                gameDate.setDate(weekStart.getDate() + 7);
                gameDate.setHours(13, 0); // 1:00 PM ET (most games)
                break;
            case 'Monday':
                gameDate.setDate(weekStart.getDate() + 8);
                gameDate.setHours(20, 15); // 8:15 PM ET
                break;
            default:
                gameDate.setDate(weekStart.getDate() + 7);
                gameDate.setHours(13, 0);
        }

        return gameDate;
    }

    /**
     * Get today's games
     */
    private getTodaysGames(): Game[] {
        const today = new Date();
        const weekSchedule = this.generateWeekSchedule(this.currentWeek, this.currentSeason);
        
        return weekSchedule.games.filter(game => {
            const gameDate = new Date(game.date);
            return gameDate.toDateString() === today.toDateString();
        });
    }

    /**
     * Get team full name from abbreviation
     */
    private getTeamName(abbreviation: string): string {
        const team = teams.find(t => t.abbreviation === abbreviation);
        return team ? team.name : abbreviation;
    }

    /**
     * Save generated prompt to file for external AI analysis
     */
    private async savePromptToFile(game: Game, prompt: string): Promise<void> {
        try {
            const promptsDir = path.join(process.cwd(), 'generated-prompts');
            await fs.mkdir(promptsDir, { recursive: true });
            
            const filename = `week${game.week}_${game.awayTeam}@${game.homeTeam}_${game.date.toISOString().split('T')[0]}.txt`;
            const filepath = path.join(promptsDir, filename);
            
            await fs.writeFile(filepath, prompt, 'utf8');
            console.log(`💾 Prompt saved: ${filename}`);
        } catch (error) {
            console.error('❌ Error saving prompt:', error);
        }
    }

    /**
     * Manual prediction trigger for specific week
     */
    public async predictSpecificWeek(week: number, season: number = this.currentSeason): Promise<void> {
        const originalWeek = this.currentWeek;
        this.currentWeek = week;
        await this.runWeeklyPredictions();
        this.currentWeek = originalWeek;
    }

    /**
     * Get current week and season
     */
    public getCurrentWeek(): { week: number; season: number } {
        return {
            week: this.currentWeek,
            season: this.currentSeason
        };
    }

    /**
     * Set current week (for testing or manual control)
     */
    public setCurrentWeek(week: number, season?: number): void {
        this.currentWeek = week;
        if (season) {
            this.currentSeason = season;
        }
    }
}

// Legacy function for backwards compatibility
export function schedulePredictions(): void {
    const scheduler = new NFLScheduler();
    scheduler.schedulePredictions();
}

export default NFLScheduler;