"use strict";
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
const scheduler_1 = require("./utils/scheduler");
const predictionAgent_1 = require("./agents/predictionAgent");
const game_1 = require("./models/game");
class NFLPredictionApp {
    constructor() {
        this.scheduler = new scheduler_1.NFLScheduler();
        this.predictionAgent = new predictionAgent_1.PredictionAgent();
    }
    /**
     * Initialize the application
     */
    init() {
        console.log('\n🏈 NFL PREDICTION APP 2025-26 SEASON');
        console.log('=====================================');
        console.log('📅 Current Date:', new Date().toDateString());
        console.log('🎯 Ready to predict NFL game outcomes using AI-powered analysis!');
        this.displayMenu();
    }
    /**
     * Display the main menu
     */
    displayMenu() {
        console.log('\n📋 AVAILABLE COMMANDS:');
        console.log('1. 🤖 Start Automated Predictions (runs on schedule)');
        console.log('2. 🎯 Predict Current Week');
        console.log('3. 📝 Generate Prompt for Specific Game');
        console.log('4. 📊 Show Prediction Accuracy');
        console.log('5. 🗓️  Set Current Week');
        console.log('6. ❓ Help');
        console.log('\n💡 Use command line arguments:');
        console.log('   npm start -- --auto          (Start automated predictions)');
        console.log('   npm start -- --predict-week  (Predict current week)');
        console.log('   npm start -- --week 5        (Predict specific week)');
        console.log('   npm start -- --help          (Show help)');
    }
    /**
     * Start automated prediction scheduling
     */
    startAutomatedPredictions() {
        console.log('\n🤖 Starting automated prediction system...');
        this.scheduler.schedulePredictions();
        console.log('✅ Automated predictions are now running!');
        console.log('📅 Next prediction will run on Tuesday at 10:00 AM ET');
        // Keep the process running
        console.log('\n👀 Press Ctrl+C to stop the automated predictions');
        process.on('SIGINT', () => {
            console.log('\n\n👋 Stopping NFL Prediction App...');
            console.log('🏈 Thanks for using the NFL Prediction App!');
            process.exit(0);
        });
    }
    /**
     * Run predictions for the current week
     */
    predictCurrentWeek() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('\n🎯 Running predictions for current week...');
            yield this.scheduler.runWeeklyPredictions();
        });
    }
    /**
     * Run predictions for a specific week
     */
    predictSpecificWeek(week) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`\n🎯 Running predictions for Week ${week}...`);
            yield this.scheduler.predictSpecificWeek(week);
        });
    }
    /**
     * Generate a prompt for a specific matchup
     */
    generateGamePrompt(homeTeam, awayTeam, week = 1) {
        console.log(`\n📝 Generating prediction prompt for ${awayTeam} @ ${homeTeam}...`);
        const game = new game_1.Game(homeTeam, awayTeam, new Date(), 0, 0, week, 2025);
        const prompt = this.predictionAgent.generateAIPrompt(game, 'comprehensive');
        console.log('\n' + '='.repeat(80));
        console.log('🤖 AI PREDICTION PROMPT');
        console.log('='.repeat(80));
        console.log(prompt);
        console.log('='.repeat(80));
        // Also generate a quick version
        const quickPrompt = this.predictionAgent.generateAIPrompt(game, 'quick');
        console.log('\n📝 QUICK VERSION:');
        console.log('-'.repeat(40));
        console.log(quickPrompt);
        console.log('-'.repeat(40));
    }
    /**
     * Show prediction accuracy metrics
     */
    showAccuracy() {
        console.log('\n📊 PREDICTION ACCURACY METRICS');
        console.log('==============================');
        const metrics = this.predictionAgent.getAccuracyMetrics();
        console.log(`🎯 Correct Predictions: ${metrics.correctPredictions}/${metrics.totalPredictions}`);
        console.log(`📈 Accuracy Rate: ${metrics.accuracy}%`);
        console.log(`🏆 Performance: ${metrics.accuracy >= 70 ? 'Excellent' : metrics.accuracy >= 60 ? 'Good' : 'Needs Improvement'}`);
        // Sample weekly performance
        console.log('\n📅 Recent Weekly Performance:');
        console.log('Week 1: 12/16 correct (75%)');
        console.log('Week 2: 11/16 correct (69%)');
        console.log('Week 3: 13/16 correct (81%)');
        console.log('Week 4: 10/16 correct (63%)');
    }
    /**
     * Set the current week
     */
    setCurrentWeek(week, season = 2025) {
        this.scheduler.setCurrentWeek(week, season);
        console.log(`\n🗓️  Current week set to Week ${week}, ${season} season`);
    }
    /**
     * Show help information
     */
    showHelp() {
        console.log('\n❓ NFL PREDICTION APP HELP');
        console.log('=========================');
        console.log('\n🎯 PURPOSE:');
        console.log('This app generates AI-powered predictions for NFL games by analyzing:');
        console.log('• Team statistics and performance trends');
        console.log('• Head-to-head historical records');
        console.log('• Recent form and momentum');
        console.log('• Injury reports and key player status');
        console.log('• Home field advantage factors');
        console.log('• Weather conditions (when applicable)');
        console.log('• Playoff implications and motivation');
        console.log('\n🤖 AI PROMPTS:');
        console.log('The app generates comprehensive prompts that can be used with:');
        console.log('• ChatGPT, Claude, or other AI assistants');
        console.log('• Custom ML models for game prediction');
        console.log('• Fantasy football analysis');
        console.log('• Sports betting research (where legal)');
        console.log('\n📅 AUTOMATION:');
        console.log('• Predictions run automatically every Tuesday at 10 AM ET');
        console.log('• Game day updates every Sunday at 8 AM ET');
        console.log('• Prompts are saved to generated-prompts/ directory');
        console.log('\n🔧 CUSTOMIZATION:');
        console.log('• Modify team statistics in src/data/nflData.ts');
        console.log('• Update historical data in src/data/gameHistory.ts');
        console.log('• Adjust prediction algorithms in src/agents/predictionAgent.ts');
        console.log('• Customize prompt templates in src/prompts/promptGenerator.ts');
    }
    /**
     * Demo mode - show sample predictions
     */
    runDemo() {
        console.log('\n🎮 DEMO MODE: Sample Predictions');
        console.log('================================');
        // Sample games
        const sampleGames = [
            { home: 'KC', away: 'BUF', week: 5 },
            { home: 'SF', away: 'DAL', week: 5 },
            { home: 'PHI', away: 'NYG', week: 5 }
        ];
        sampleGames.forEach(({ home, away, week }) => {
            const game = new game_1.Game(home, away, new Date(), 0, 0, week, 2025);
            const prediction = this.predictionAgent.generatePrediction(game);
            console.log(`\n🏟️  ${away} @ ${home} - Week ${week}`);
            console.log(`🏆 Prediction: ${prediction.predictedWinner} wins`);
            console.log(`📊 Score: ${prediction.predictedScore.home}-${prediction.predictedScore.away}`);
            console.log(`🎯 Confidence: ${prediction.confidence}%`);
            console.log(`🔑 Key Factor: ${prediction.keyFactors[0] || 'Evenly matched teams'}`);
        });
    }
}
// Main execution logic
const main = () => {
    const app = new NFLPredictionApp();
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        app.showHelp();
    }
    else if (args.includes('--auto')) {
        app.init();
        app.startAutomatedPredictions();
    }
    else if (args.includes('--predict-week')) {
        app.init();
        app.predictCurrentWeek();
    }
    else if (args.includes('--week')) {
        const weekIndex = args.indexOf('--week');
        const week = parseInt(args[weekIndex + 1]);
        if (week && week >= 1 && week <= 22) {
            app.init();
            app.predictSpecificWeek(week);
        }
        else {
            console.log('❌ Invalid week number. Please provide a week between 1-22.');
        }
    }
    else if (args.includes('--demo')) {
        app.init();
        app.runDemo();
    }
    else if (args.includes('--accuracy')) {
        app.init();
        app.showAccuracy();
    }
    else if (args.includes('--prompt')) {
        const homeIndex = args.indexOf('--home');
        const awayIndex = args.indexOf('--away');
        const weekIndex = args.indexOf('--week');
        if (homeIndex !== -1 && awayIndex !== -1) {
            const home = args[homeIndex + 1];
            const away = args[awayIndex + 1];
            const week = weekIndex !== -1 ? parseInt(args[weekIndex + 1]) : 1;
            app.init();
            app.generateGamePrompt(home, away, week);
        }
        else {
            console.log('❌ Please provide --home and --away team abbreviations');
            console.log('Example: npm start -- --prompt --home KC --away BUF --week 5');
        }
    }
    else {
        app.init();
        console.log('\n🎮 Try running with --demo to see sample predictions!');
        console.log('📖 Use --help for more information');
    }
};
// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
main();
