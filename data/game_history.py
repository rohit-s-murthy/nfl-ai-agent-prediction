from typing import List, Optional, Dict
from dataclasses import dataclass
from datetime import datetime
from models.game import WeatherConditions

@dataclass
class GameHistoryEntry:
    date: str
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    week: int
    season: int
    is_playoffs: bool
    weather: Optional[WeatherConditions] = None
    attendance: Optional[int] = None

@dataclass
class HeadToHeadRecord:
    team1: str
    team2: str
    team1_wins: int
    team2_wins: int
    ties: int
    last_meeting: GameHistoryEntry
    avg_points_team1: float
    avg_points_team2: float

# Sample game history data
GAME_HISTORY: List[GameHistoryEntry] = [
    # Sample 2024 season data
    GameHistoryEntry('2024-09-08', 'KC', 'BAL', 27, 20, 1, 2024, False),
    GameHistoryEntry('2024-09-09', 'BUF', 'ARI', 34, 28, 1, 2024, False),
    GameHistoryEntry('2024-09-09', 'PHI', 'GB', 24, 19, 1, 2024, False),
    GameHistoryEntry('2024-09-09', 'PIT', 'ATL', 18, 10, 1, 2024, False),
    GameHistoryEntry('2024-09-15', 'KC', 'CIN', 26, 25, 2, 2024, False),
    GameHistoryEntry('2024-09-16', 'BUF', 'MIA', 31, 10, 2, 2024, False),
    # Sample 2023 season data
    GameHistoryEntry('2023-09-07', 'KC', 'DET', 21, 20, 1, 2023, False),
    GameHistoryEntry('2023-09-11', 'BUF', 'NYJ', 22, 16, 1, 2023, False),
    GameHistoryEntry('2023-01-14', 'BUF', 'MIA', 34, 31, 18, 2023, True),
    GameHistoryEntry('2023-01-21', 'KC', 'JAX', 27, 20, 19, 2023, True),
]

def get_game_history() -> List[GameHistoryEntry]:
    """Get all game history"""
    return GAME_HISTORY

def get_team_history(team_abbreviation: str, seasons: int = 3) -> List[GameHistoryEntry]:
    """Get history for a specific team"""
    return [
        game for game in GAME_HISTORY
        if (game.home_team == team_abbreviation or game.away_team == team_abbreviation)
        and game.season >= (2024 - seasons + 1)
    ]

def get_head_to_head_record(team1: str, team2: str) -> HeadToHeadRecord:
    """Get head-to-head record between two teams"""
    h2h_games = [
        game for game in GAME_HISTORY
        if {game.home_team, game.away_team} == {team1, team2}
    ]
    
    if not h2h_games:
        # Return default record if no games found
        return HeadToHeadRecord(
            team1=team1,
            team2=team2,
            team1_wins=0,
            team2_wins=0,
            ties=0,
            last_meeting=GameHistoryEntry('1970-01-01', team1, team2, 0, 0, 1, 1970, False),
            avg_points_team1=20.0,
            avg_points_team2=20.0
        )
    
    team1_wins = 0
    team2_wins = 0
    ties = 0
    team1_points = []
    team2_points = []
    
    for game in h2h_games:
        if game.home_team == team1:
            team1_points.append(game.home_score)
            team2_points.append(game.away_score)
            if game.home_score > game.away_score:
                team1_wins += 1
            elif game.home_score < game.away_score:
                team2_wins += 1
            else:
                ties += 1
        else:  # team1 is away
            team1_points.append(game.away_score)
            team2_points.append(game.home_score)
            if game.away_score > game.home_score:
                team1_wins += 1
            elif game.away_score < game.home_score:
                team2_wins += 1
            else:
                ties += 1
    
    return HeadToHeadRecord(
        team1=team1,
        team2=team2,
        team1_wins=team1_wins,
        team2_wins=team2_wins,
        ties=ties,
        last_meeting=h2h_games[0],  # Most recent game
        avg_points_team1=sum(team1_points) / len(team1_points) if team1_points else 20.0,
        avg_points_team2=sum(team2_points) / len(team2_points) if team2_points else 20.0
    )

def get_recent_performance(team: str, games: int = 5) -> List[GameHistoryEntry]:
    """Get recent performance for a team"""
    team_games = get_team_history(team, 1)  # Current season only
    return sorted(team_games, key=lambda x: x.date, reverse=True)[:games]
