#!/usr/bin/env python3
"""
NFL Prediction App - Python Version
An application to predict NFL game outcomes using AI agents.
"""

import sys
import asyncio
from datetime import datetime
from typing import Optional
from utils.scheduler import NFLScheduler
from agents.prediction_agent import PredictionAgent
from models.game import Game
from prompts.prompt_generator import generate_comprehensive_prompt, generate_quick_prompt

class NFLPredictionApp:
    """Main NFL Prediction Application"""
    
    def __init__(self):
        self.scheduler = NFLScheduler()
        self.prediction_agent = PredictionAgent()

    def init(self):
        """Initialize the application"""
        print('\n🏈 NFL PREDICTION APP 2025-26 SEASON')
        print('=====================================')
        print(f'📅 Current Date: {datetime.now().strftime("%Y-%m-%d")}')
        print('🎯 Ready to predict NFL game outcomes using AI-powered analysis!')
        
        self.display_menu()

    def display_menu(self):
        """Display the main menu"""
        print('\n📋 AVAILABLE COMMANDS:')
        print('1. 🤖 Start Automated Predictions (runs on schedule)')
        print('2. 🎯 Predict Current Week')
        print('3. 📝 Generate Prompt for Specific Game')
        print('4. 📊 Show Prediction Accuracy')
        print('5. 🗓️  Set Current Week')
        print('6. ❓ Help')
        print('7. 📺 Show Live Scores')
        print('8. 🌐 Check API Status')
        print('\n💡 Use command line arguments:')
        print('   python app.py --auto          (Start automated predictions)')
        print('   python app.py --predict-week  (Predict current week)')
        print('   python app.py --week 5        (Predict specific week)')
        print('   python app.py --help          (Show help)')
        print('   python app.py --live-scores   (Show live scores)')
        print('   python app.py --api-status    (Check API status)')

    def start_automated_predictions(self):
        """Start automated prediction scheduling"""
        print('\n🤖 Starting automated prediction system...')
        self.scheduler.schedule_predictions()
        print('✅ Automated predictions are now running!')
        print('📅 Next prediction will run on Tuesday at 10:00 AM ET')
        
        # Keep the process running
        print('\n👀 Press Ctrl+C to stop the automated predictions')
        try:
            while True:
                pass
        except KeyboardInterrupt:
            print('\n\n👋 Stopping NFL Prediction App...')
            print('🏈 Thanks for using the NFL Prediction App!')
            sys.exit(0)

    async def predict_current_week(self):
        """Run predictions for the current week using real NFL schedule"""
        print('\n🎯 Running predictions for current week using real NFL schedule...')
        
        has_real_games = await self.scheduler.has_real_games_this_week()
        if has_real_games:
            await self.scheduler.run_real_weekly_predictions()
        else:
            print('📅 Using fallback schedule (real games not available)')
            await self.scheduler.run_weekly_predictions()

    async def predict_specific_week(self, week: int):
        """Run predictions for a specific week using real NFL schedule"""
        print(f'\n🎯 Running predictions for Week {week} using real NFL schedule...')
        
        has_real_games = await self.scheduler.has_games_scheduled(week, 2025)
        if has_real_games:
            await self.scheduler.predict_specific_week_real(week)
        else:
            print('📅 Using fallback schedule (real games not available for this week)')
            await self.scheduler.predict_specific_week(week)

    def generate_game_prompt(self, home_team: str, away_team: str, week: int = 1):
        """Generate a prompt for a specific matchup"""
        print(f'\n📝 Generating prediction prompt for {away_team} @ {home_team}...')
        
        game = Game(
            home_team=home_team,
            away_team=away_team,
            date=datetime.now(),
            week=week,
            season=2025
        )
        
        prompt = generate_comprehensive_prompt(game)
        
        print('✅ Generated comprehensive prompt:')
        print('=' * 50)
        print(prompt)
        print('=' * 50)
        
        # Save to file
        filename = f'week{week}_{away_team}@{home_team}_{datetime.now().strftime("%Y-%m-%d")}.txt'
        with open(f'generated-prompts/{filename}', 'w', encoding='utf-8') as f:
            f.write(prompt)
        
        print(f'💾 Saved prompt to: generated-prompts/{filename}')

    def show_prediction_accuracy(self):
        """Show prediction accuracy statistics"""
        self.scheduler.show_prediction_accuracy()

    def set_current_week(self, week: int):
        """Set the current week"""
        self.scheduler.set_current_week(week)

    def show_help(self):
        """Show help information"""
        print('\n❓ NFL PREDICTION APP HELP')
        print('==========================')
        print('🏈 This app predicts NFL game outcomes using statistical analysis and AI.')
        print('')
        print('🎯 MAIN FEATURES:')
        print('   • Automated weekly predictions via cron scheduling')
        print('   • Manual prediction generation for any week')
        print('   • Comprehensive AI prompt generation')
        print('   • Historical performance tracking')
        print('   • Live score monitoring')
        print('')
        print('📊 PREDICTION FACTORS:')
        print('   • Team statistics (offense/defense rankings)')
        print('   • Recent form and momentum')
        print('   • Head-to-head historical matchups')
        print('   • Home field advantage')
        print('   • Injury reports and key players')
        print('   • Weather conditions')
        print('   • Divisional rivalry dynamics')
        print('')
        print('🔧 CONFIGURATION:')
        print('   • Set OpenAI API key for AI predictions')
        print('   • Configure NFL API access for real schedules')
        print('   • Adjust prediction algorithms and weights')
        print('')
        print('📞 SUPPORT: Check the README.md for detailed documentation')

    def show_live_scores(self):
        """Show live scores"""
        self.scheduler.show_live_scores()

    def check_api_status(self):
        """Check API status"""
        self.scheduler.check_api_status()

async def main():
    """Main application entry point"""
    app = NFLPredictionApp()
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        
        if arg == '--auto':
            app.start_automated_predictions()
        elif arg == '--predict-week':
            await app.predict_current_week()
        elif arg == '--week' and len(sys.argv) > 2:
            try:
                week = int(sys.argv[2])
                await app.predict_specific_week(week)
            except ValueError:
                print('❌ Invalid week number. Please provide a valid integer.')
        elif arg == '--help':
            app.show_help()
        elif arg == '--live-scores':
            app.show_live_scores()
        elif arg == '--api-status':
            app.check_api_status()
        elif arg == '--prompt' and len(sys.argv) > 4:
            home_team = sys.argv[2].upper()
            away_team = sys.argv[3].upper()
            week = int(sys.argv[4]) if len(sys.argv) > 4 else 1
            app.generate_game_prompt(home_team, away_team, week)
        else:
            print('❌ Unknown command. Use --help for available options.')
    else:
        # Interactive mode
        app.init()

if __name__ == '__main__':
    asyncio.run(main())
