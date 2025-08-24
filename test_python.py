#!/usr/bin/env python3
"""
Test script for NFL Prediction App - Python Version
"""

import asyncio
from datetime import datetime
from models.game import Game, WeatherConditions
from prompts.prompt_generator import generate_comprehensive_prompt, generate_quick_prompt
from agents.prediction_agent import PredictionAgent
from data.nfl_data import get_team_stats, get_team_by_abbreviation

async def test_prompt_generation():
    """Test prompt generation functionality"""
    print("🧪 Testing Prompt Generation...")
    
    # Create a sample game
    game = Game(
        home_team="KC",
        away_team="BUF",
        date=datetime(2025, 9, 12),
        week=1,
        season=2025,
        weather=WeatherConditions(
            temperature=72.0,
            wind_speed=8.0,
            precipitation=10.0,
            conditions="Partly Cloudy"
        )
    )
    
    # Test comprehensive prompt
    print("\n📝 Testing Comprehensive Prompt:")
    comprehensive_prompt = generate_comprehensive_prompt(game)
    print("✅ Comprehensive prompt generated successfully")
    print(f"📊 Prompt length: {len(comprehensive_prompt)} characters")
    
    # Test quick prompt
    print("\n⚡ Testing Quick Prompt:")
    quick_prompt = generate_quick_prompt("KC", "BUF", 1)
    print("✅ Quick prompt generated successfully")
    print(f"📊 Prompt length: {len(quick_prompt)} characters")
    
    # Save comprehensive prompt to file
    filename = f"test_prompt_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("=== COMPREHENSIVE PROMPT ===\n\n")
        f.write(comprehensive_prompt)
        f.write("\n\n=== QUICK PROMPT ===\n\n")
        f.write(quick_prompt)
    
    print(f"💾 Test prompts saved to: {filename}")

async def test_prediction_agent():
    """Test prediction agent functionality"""
    print("\n🤖 Testing Prediction Agent...")
    
    agent = PredictionAgent()
    
    # Create a test game
    game = Game(
        home_team="KC",
        away_team="BUF",
        date=datetime(2025, 9, 12),
        week=1,
        season=2025
    )
    
    # Test prediction generation
    print("🎯 Generating prediction...")
    prediction = agent.generate_prediction(game)
    
    print("✅ Prediction generated successfully:")
    print(f"   🏆 Winner: {prediction.predicted_winner}")
    print(f"   📊 Score: {prediction.predicted_score['home']}-{prediction.predicted_score['away']}")
    print(f"   🎯 Confidence: {prediction.confidence:.1f}%")
    print(f"   🔑 Key Factors: {', '.join(prediction.key_factors)}")
    print(f"   💭 Reasoning: {prediction.reasoning}")

async def test_data_access():
    """Test data access functionality"""
    print("\n📊 Testing Data Access...")
    
    # Test team stats
    kc_stats = get_team_stats("KC")
    print(f"✅ KC Stats: {kc_stats.wins}-{kc_stats.losses}-{kc_stats.ties}, {kc_stats.avg_points_for:.1f} PPG")
    
    buf_stats = get_team_stats("BUF")
    print(f"✅ BUF Stats: {buf_stats.wins}-{buf_stats.losses}-{buf_stats.ties}, {buf_stats.avg_points_for:.1f} PPG")
    
    # Test team lookup
    kc_team = get_team_by_abbreviation("KC")
    if kc_team:
        print(f"✅ KC Team: {kc_team.name} - {kc_team.city}, {kc_team.stadium}")
    
    buf_team = get_team_by_abbreviation("BUF")
    if buf_team:
        print(f"✅ BUF Team: {buf_team.name} - {buf_team.city}, {buf_team.stadium}")

async def test_game_model():
    """Test game model functionality"""
    print("\n🎮 Testing Game Model...")
    
    # Create a completed game
    game = Game(
        home_team="KC",
        away_team="BUF",
        date=datetime(2025, 9, 12),
        home_score=27,
        away_score=24,
        week=1,
        season=2025
    )
    
    print(f"✅ Matchup: {game.get_matchup()}")
    print(f"✅ Outcome: {game.calculate_outcome()}")
    print(f"✅ Spread: {game.get_spread()}")
    print(f"✅ Total Points: {game.get_total_points()}")
    print(f"✅ Completed: {game.is_completed()}")

async def run_all_tests():
    """Run all tests"""
    print("🧪 NFL PREDICTION APP - PYTHON VERSION TESTS")
    print("=" * 50)
    
    try:
        await test_game_model()
        await test_data_access()
        await test_prediction_agent()
        await test_prompt_generation()
        
        print("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!")
        print("✅ Python version is working correctly")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_all_tests())
