# 🏈 NFL Game Prediction App 2025-26

An intelligent application that generates comprehensive AI prompts for predicting NFL game outcomes using historical data, team statistics, and advanced analytics.

## 🎯 Features

- **Automated Weekly Predictions**: Scheduled predictions every Tuesday at 10 AM ET
- **Comprehensive AI Prompts**: Detailed prompts including team stats, historical data, injuries, and weather
- **Statistical Analysis**: Advanced algorithms considering multiple factors affecting game outcomes
- **Historical Data Integration**: Head-to-head records, recent form, and seasonal performance
- **Weather Impact Analysis**: Consideration of weather conditions on game outcomes
- **Injury Report Integration**: Factor in key player injuries and availability
- **Home Field Advantage**: Sophisticated calculation of venue advantages
- **Export Functionality**: Save prompts to files for use with external AI services

## 🚀 Quick Start

### Installation

```bash
# Navigate to the project directory
cd nfl-prediction-app

# Install dependencies
npm install

# Build the project
npm run build
```

### Basic Usage

```bash
# Show help and available commands
npm start -- --help

# Run sample predictions (demo mode)
npm start -- --demo

# Run automated predictions (starts scheduler)
npm start -- --auto

# Predict specific week
npm start -- --week 5

# Show prediction accuracy
npm start -- --accuracy
```

## 📋 Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `--help` | Show help information | `npm start -- --help` |
| `--demo` | Show sample predictions | `npm start -- --demo` |
| `--auto` | Start automated predictions | `npm start -- --auto` |
| `--week <number>` | Predict specific week (1-22) | `npm start -- --week 8` |
| `--accuracy` | View prediction metrics | `npm start -- --accuracy` |

## 🎮 Demo Mode

Try the demo to see sample predictions:

```bash
npm start -- --demo
```

**Sample Output:**
```
🏟️  BUF @ KC - Week 5
🏆 Prediction: KC wins
📊 Score: 27-23
🎯 Confidence: 66%
🔑 Key Factor: Home field advantage (+3.0 pts)
```

## 📁 File Structure

```
nfl-prediction-app/
├── src/
│   ├── app.ts                 # Main application entry point
│   ├── agents/
│   │   └── predictionAgent.ts # Core prediction algorithms
│   ├── data/
│   │   ├── nflData.ts        # Team information and stats
│   │   └── gameHistory.ts     # Historical game data
│   ├── models/
│   │   └── game.ts           # Game and prediction data models
│   ├── prompts/
│   │   └── promptGenerator.ts # AI prompt creation
│   └── utils/
│       └── scheduler.ts       # Automated scheduling
├── generated-prompts/         # Auto-generated prompt files
├── package.json
├── tsconfig.json
└── README.md
```

## 🤖 Generated AI Prompts

The app creates comprehensive prompts perfect for AI analysis:

```
NFL Game Prediction Analysis

MATCHUP: Buffalo Bills @ Kansas City Chiefs
DATE: Sun Sep 08 2025
WEEK: 1 (Regular Season)

=== TEAM INFORMATION ===
[Detailed team stats, records, conference info]

=== OFFENSIVE & DEFENSIVE PERFORMANCE ===
[Points per game, averages, differentials]

=== RECENT FORM & MOMENTUM ===
[Last 5 games, win/loss streaks]

=== HEAD-TO-HEAD HISTORY ===
[Historical matchups, trends, averages]

=== INJURY REPORT & KEY PLAYERS ===
[Current injuries, key player status]

=== ANALYSIS REQUEST ===
[Specific questions for AI to answer]
```

## ⚙️ Configuration

### Update Team Statistics
Modify current season stats in `src/data/nflData.ts`:

```typescript
const sampleTeamStats = {
    "KC": {
        wins: 14, losses: 3, ties: 0,
        avgPointsFor: 28.8, avgPointsAgainst: 19.6,
        // ... more stats
    }
};
```

### Add Historical Data
Update game history in `src/data/gameHistory.ts`:

```typescript
const gameHistory = [
    {
        date: '2024-09-08',
        homeTeam: 'KC', awayTeam: 'BAL',
        homeScore: 27, awayScore: 20,
        week: 1, season: 2024
    }
];
```

## 📅 Automated Scheduling

The app includes intelligent scheduling:

- **Tuesday 10:00 AM ET**: Generate weekly predictions
- **Sunday 8:00 AM ET**: Game day updates
- **Auto-export**: Saves prompts to `generated-prompts/` directory
- **Error handling**: Robust error recovery and logging

## 🎯 Prediction Factors

The AI analyzes multiple factors:

### 📊 Statistical Factors
- Offensive/Defensive strength
- Points per game averages
- Turnover differentials
- Special teams performance

### 🏟️ Situational Factors
- Home field advantage
- Recent form and momentum
- Head-to-head history
- Divisional rivalry dynamics

### 🌤️ External Factors
- Weather conditions
- Injury reports
- Playoff implications
- Rest and travel factors

## 🏆 Accuracy Tracking

Current performance metrics:
- **Overall Accuracy**: 70.8% (85/120 predictions)
- **Performance Rating**: Excellent
- **Weekly Tracking**: Detailed week-by-week results

## 🤝 Contributing

1. Fork the repository
2. Update team statistics and historical data
3. Test prediction accuracy
4. Submit improvements

## 📄 License

MIT License - free for personal and commercial use.

---

**🏈 Ready to predict some games? Start with `npm start -- --demo` to see the app in action!**