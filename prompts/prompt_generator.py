from typing import Optional
from dataclasses import dataclass
from models.game import Game, TeamStats, WeatherConditions
from data.nfl_data import get_team_stats, get_team_by_abbreviation, NFLTeam
from data.game_history import get_head_to_head_record, get_recent_performance, HeadToHeadRecord

@dataclass
class MatchupContext:
    home_team: NFLTeam
    away_team: NFLTeam
    home_stats: TeamStats
    away_stats: TeamStats
    head_to_head: HeadToHeadRecord
    home_recent_form: str
    away_recent_form: str
    weather: Optional[WeatherConditions]
    week: int
    season: int
    is_playoffs: bool

def generate_comprehensive_prompt(game: Game) -> str:
    """Generate a comprehensive AI prompt for game prediction"""
    context = build_matchup_context(game)
    
    weather_section = ""
    if context.weather:
        weather_section = f"""=== WEATHER CONDITIONS ===
Temperature: {context.weather.temperature}°F
Wind Speed: {context.weather.wind_speed} mph
Conditions: {context.weather.conditions}
Precipitation: {context.weather.precipitation}%

"""
    
    return f"""NFL Game Prediction Analysis

MATCHUP: {context.away_team.name} @ {context.home_team.name}
DATE: {game.date.strftime('%Y-%m-%d')}
WEEK: {game.week or 'TBD'} ({'PLAYOFFS' if game.is_playoffs else 'Regular Season'})

=== TEAM INFORMATION ===

{context.away_team.name} ({context.away_team.abbreviation}):
- Conference: {context.away_team.conference} {context.away_team.division}
- Stadium: Playing @ {context.home_team.stadium}
- Current Record: {context.away_stats.wins}-{context.away_stats.losses}-{context.away_stats.ties}
- Away Record: {context.away_stats.away_record}

{context.home_team.name} ({context.home_team.abbreviation}):
- Conference: {context.home_team.conference} {context.home_team.division}
- Stadium: {context.home_team.stadium} (Home advantage)
- Current Record: {context.home_stats.wins}-{context.home_stats.losses}-{context.home_stats.ties}
- Home Record: {context.home_stats.home_record}

=== OFFENSIVE & DEFENSIVE PERFORMANCE ===

{context.away_team.name} Offense/Defense:
- Average Points Scored: {context.away_stats.avg_points_for} per game
- Average Points Allowed: {context.away_stats.avg_points_against} per game
- Total Points For: {context.away_stats.points_for}
- Total Points Against: {context.away_stats.points_against}
- Point Differential: {'+' if (context.away_stats.points_for - context.away_stats.points_against) > 0 else ''}{context.away_stats.points_for - context.away_stats.points_against}

{context.home_team.name} Offense/Defense:
- Average Points Scored: {context.home_stats.avg_points_for} per game
- Average Points Allowed: {context.home_stats.avg_points_against} per game
- Total Points For: {context.home_stats.points_for}
- Total Points Against: {context.home_stats.points_against}
- Point Differential: {'+' if (context.home_stats.points_for - context.home_stats.points_against) > 0 else ''}{context.home_stats.points_for - context.home_stats.points_against}

=== RECENT FORM & MOMENTUM ===

{context.away_team.name} Last 5 Games: {context.away_stats.last_five_games}
{context.home_team.name} Last 5 Games: {context.home_stats.last_five_games}

=== HEAD-TO-HEAD HISTORY ===

All-Time Series: {context.home_team.name} {context.head_to_head.team1_wins if context.head_to_head.team1 == context.home_team.abbreviation else context.head_to_head.team2_wins}-{context.head_to_head.team2_wins if context.head_to_head.team1 == context.home_team.abbreviation else context.head_to_head.team1_wins}-{context.head_to_head.ties} {context.away_team.name}
Last Meeting: {context.head_to_head.last_meeting.date} - {context.head_to_head.last_meeting.home_team} {context.head_to_head.last_meeting.home_score}, {context.head_to_head.last_meeting.away_team} {context.head_to_head.last_meeting.away_score}
Average Points in Head-to-Head:
- {context.home_team.name}: {context.head_to_head.avg_points_team1:.1f} points
- {context.away_team.name}: {context.head_to_head.avg_points_team2:.1f} points

=== INJURY REPORT & KEY PLAYERS ===

{context.away_team.name} Injuries: {', '.join(context.away_stats.injuries) if context.away_stats.injuries else 'No significant injuries reported'}
{context.away_team.name} Key Players: {', '.join(context.away_stats.key_players) if context.away_stats.key_players else 'Key players TBD'}

{context.home_team.name} Injuries: {', '.join(context.home_stats.injuries) if context.home_stats.injuries else 'No significant injuries reported'}
{context.home_team.name} Key Players: {', '.join(context.home_stats.key_players) if context.home_stats.key_players else 'Key players TBD'}

{weather_section}=== ANALYSIS REQUEST ===

Based on the comprehensive data above, please provide:

1. **GAME PREDICTION**: Who will win and by how many points?
2. **CONFIDENCE LEVEL**: Rate your confidence (1-10) and explain why
3. **KEY FACTORS**: What are the 3-5 most important factors that will determine the outcome?
4. **OVER/UNDER**: Predict the total points scored and whether it will be high/low scoring
5. **X-FACTORS**: What unexpected elements could swing the game?
6. **FINAL SCORE PREDICTION**: Provide an exact score prediction

Consider all statistical trends, recent form, injuries, weather (if applicable), home field advantage, divisional rivalry dynamics, and historical matchup patterns in your analysis."""

def generate_quick_prompt(home_team: str, away_team: str, week: int) -> str:
    """Generate a quick AI prompt for game prediction"""
    home_stats = get_team_stats(home_team)
    away_stats = get_team_stats(away_team)
    home_team_obj = get_team_by_abbreviation(home_team)
    away_team_obj = get_team_by_abbreviation(away_team)
    
    return f"""Quick NFL Game Prediction

MATCHUP: {away_team_obj.name if away_team_obj else away_team} @ {home_team_obj.name if home_team_obj else home_team}
WEEK: {week}

RECORDS:
- {away_team}: {away_stats.wins}-{away_stats.losses}-{away_stats.ties} (Away: {away_stats.away_record})
- {home_team}: {home_stats.wins}-{home_stats.losses}-{home_stats.ties} (Home: {home_stats.home_record})

SCORING AVERAGES:
- {away_team}: {away_stats.avg_points_for} scored, {away_stats.avg_points_against} allowed
- {home_team}: {home_stats.avg_points_for} scored, {home_stats.avg_points_against} allowed

RECENT FORM:
- {away_team}: {away_stats.last_five_games}
- {home_team}: {home_stats.last_five_games}

Predict: Winner, final score, and 2-3 key factors that will determine the outcome."""

def build_matchup_context(game: Game) -> MatchupContext:
    """Build comprehensive matchup context"""
    home_team_obj = get_team_by_abbreviation(game.home_team)
    away_team_obj = get_team_by_abbreviation(game.away_team)
    home_stats = get_team_stats(game.home_team)
    away_stats = get_team_stats(game.away_team)
    head_to_head = get_head_to_head_record(game.home_team, game.away_team)
    
    if not home_team_obj or not away_team_obj:
        raise ValueError(f"Team not found: {game.home_team} or {game.away_team}")
    
    return MatchupContext(
        home_team=home_team_obj,
        away_team=away_team_obj,
        home_stats=home_stats,
        away_stats=away_stats,
        head_to_head=head_to_head,
        home_recent_form=home_stats.last_five_games,
        away_recent_form=away_stats.last_five_games,
        weather=game.weather,
        week=game.week or 1,
        season=game.season or 2025,
        is_playoffs=game.is_playoffs
    )
