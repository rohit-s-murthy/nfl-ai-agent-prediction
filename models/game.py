from dataclasses import dataclass, field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

@dataclass
class TeamStats:
    wins: int
    losses: int
    ties: int
    points_for: int
    points_against: int
    avg_points_for: float
    avg_points_against: float
    home_record: str
    away_record: str
    last_five_games: str
    injuries: List[str] = field(default_factory=list)
    key_players: List[str] = field(default_factory=list)

@dataclass
class WeatherConditions:
    temperature: float
    wind_speed: float
    precipitation: float
    conditions: str

@dataclass
class GamePrediction:
    predicted_winner: str
    confidence: float
    predicted_score: Dict[str, int]
    key_factors: List[str]
    reasoning: str

class Game:
    def __init__(
        self,
        home_team: str,
        away_team: str,
        date: datetime,
        home_score: int = 0,
        away_score: int = 0,
        week: Optional[int] = None,
        season: Optional[int] = None,
        is_playoffs: bool = False,
        weather: Optional[WeatherConditions] = None
    ):
        self.home_team = home_team
        self.away_team = away_team
        self.date = date
        self.home_score = home_score
        self.away_score = away_score
        self.week = week
        self.season = season
        self.is_playoffs = is_playoffs
        self.weather = weather

    def calculate_outcome(self) -> str:
        """Calculate the outcome of the game"""
        if self.home_score > self.away_score:
            return f"{self.home_team} wins"
        elif self.home_score < self.away_score:
            return f"{self.away_team} wins"
        else:
            return "It's a tie"

    def get_matchup(self) -> str:
        """Get formatted matchup string"""
        return f"{self.away_team} @ {self.home_team} on {self.date.strftime('%Y-%m-%d')}"

    def get_spread(self) -> int:
        """Get point spread (home team perspective)"""
        return self.home_score - self.away_score

    def get_total_points(self) -> int:
        """Get total points scored in the game"""
        return self.home_score + self.away_score

    def is_completed(self) -> bool:
        """Check if the game has been completed"""
        return self.home_score > 0 or self.away_score > 0
