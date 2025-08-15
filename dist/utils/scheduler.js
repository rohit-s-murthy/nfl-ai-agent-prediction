"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFLScheduler = void 0;
exports.schedulePredictions = schedulePredictions;
const cron = __importStar(require("node-cron"));
const game_1 = require("../models/game");
const predictionAgent_1 = require("../agents/predictionAgent");
const nflData_1 = require("../data/nflData");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class NFLScheduler {
    constructor() {
        this.currentSeason = 2025;
        this.currentWeek = 1;
        this.predictionAgent = new predictionAgent_1.PredictionAgent();
    }
    /**
     * Schedule automatic predictions for the entire season
     */
    schedulePredictions() {
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
    runWeeklyPredictions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`\n🎯 Running Week ${this.currentWeek} Predictions...`);
                const weekSchedule = this.generateWeekSchedule(this.currentWeek, this.currentSeason);
                const predictions = this.predictionAgent.predictWeek(weekSchedule.games);
                console.log(`\n📊 WEEK ${this.currentWeek} NFL PREDICTIONS`);
                console.log('='.repeat(50));
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
                    yield this.savePromptToFile(game, aiPrompt);
                }
                // Move to next week
                this.currentWeek++;
                if (this.currentWeek > 18) {
                    this.currentWeek = 1; // Reset for playoffs or next season
                }
            }
            catch (error) {
                console.error('❌ Error running weekly predictions:', error);
            }
        });
    }
    /**
     * Generate schedule for a specific week
     */
    generateWeekSchedule(week, season) {
        const games = [];
        // Sample week schedule (in real app, this would come from NFL API)
        const weeklyMatchups = this.getWeeklyMatchups(week);
        weeklyMatchups.forEach(matchup => {
            const gameDate = this.getGameDate(week, season, matchup.day);
            const game = new game_1.Game(matchup.home, matchup.away, gameDate, 0, 0, week, season, week > 18 // Playoffs
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
    runSundayUpdates() {
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
    getWeeklyMatchups(week) {
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
        return sampleMatchups.slice(startIndex, startIndex + 8).concat(sampleMatchups.slice(0, Math.max(0, startIndex + 8 - sampleMatchups.length)));
    }
    /**
     * Calculate game date based on week and day
     */
    getGameDate(week, season, day) {
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
    getTodaysGames() {
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
    getTeamName(abbreviation) {
        const team = nflData_1.teams.find(t => t.abbreviation === abbreviation);
        return team ? team.name : abbreviation;
    }
    /**
     * Save generated prompt to file for external AI analysis
     */
    savePromptToFile(game, prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const promptsDir = path.join(process.cwd(), 'generated-prompts');
                yield fs.mkdir(promptsDir, { recursive: true });
                const filename = `week${game.week}_${game.awayTeam}@${game.homeTeam}_${game.date.toISOString().split('T')[0]}.txt`;
                const filepath = path.join(promptsDir, filename);
                yield fs.writeFile(filepath, prompt, 'utf8');
                console.log(`💾 Prompt saved: ${filename}`);
            }
            catch (error) {
                console.error('❌ Error saving prompt:', error);
            }
        });
    }
    /**
     * Manual prediction trigger for specific week
     */
    predictSpecificWeek(week_1) {
        return __awaiter(this, arguments, void 0, function* (week, season = this.currentSeason) {
            const originalWeek = this.currentWeek;
            this.currentWeek = week;
            yield this.runWeeklyPredictions();
            this.currentWeek = originalWeek;
        });
    }
    /**
     * Get current week and season
     */
    getCurrentWeek() {
        return {
            week: this.currentWeek,
            season: this.currentSeason
        };
    }
    /**
     * Set current week (for testing or manual control)
     */
    setCurrentWeek(week, season) {
        this.currentWeek = week;
        if (season) {
            this.currentSeason = season;
        }
    }
}
exports.NFLScheduler = NFLScheduler;
// Legacy function for backwards compatibility
function schedulePredictions() {
    const scheduler = new NFLScheduler();
    scheduler.schedulePredictions();
}
exports.default = NFLScheduler;
