from typing import Optional, Dict
from dataclasses import dataclass
import openai
from models.game import Game, GamePrediction, TeamStats, WeatherConditions
from data.nfl_data import get_team_stats, get_team_by_abbreviation
from data.game_history import get_head_to_head_record, get_recent_performance
from prompts.prompt_generator import generate_comprehensive_prompt, generate_quick_prompt

@dataclass
class PredictionFactors:
    home_field_advantage: float
    recent_form: float
    head_to_head_history: float
    offensive_strength: float
    defensive_strength: float
    injuries: float
    weather: float
    motivation: float

class PredictionAgent:
    """NFL Prediction Agent that generates game predictions"""
    
    HOME_FIELD_ADVANTAGE = 3.0  # Average points advantage for home team
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_client = None
        if openai_api_key:
            self.openai_client = openai.OpenAI(api_key=openai_api_key)
        print("NFL Prediction Agent initialized")

    def generate_prediction(self, game: Game) -> GamePrediction:
        """Generate a comprehensive prediction for a game"""
        home_stats = get_team_stats(game.home_team)
        away_stats = get_team_stats(game.away_team)
        head_to_head = get_head_to_head_record(game.home_team, game.away_team)
        
        factors = self._analyze_prediction_factors(game, home_stats, away_stats)
        prediction = self._calculate_prediction(game, home_stats, away_stats, factors)
        
        return prediction

    def generate_ai_prompt(self, game: Game, prompt_type: str = 'comprehensive') -> str:
        """Generate AI prompt for external analysis"""
        if prompt_type == 'quick':
            return generate_quick_prompt(game.home_team, game.away_team, game.week or 1)
        return generate_comprehensive_prompt(game)

    async def get_ai_prediction(self, game: Game, prompt_type: str = 'comprehensive') -> Optional[str]:
        """Get prediction from OpenAI API"""
        if not self.openai_client:
            print("OpenAI client not configured. Please provide API key.")
            return None
        
        try:
            prompt = self.generate_ai_prompt(game, prompt_type)
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert NFL analyst with deep knowledge of team statistics, player performance, and game dynamics. Provide detailed, data-driven predictions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error getting AI prediction: {e}")
            return None

    def _analyze_prediction_factors(self, game: Game, home_stats: TeamStats, away_stats: TeamStats) -> PredictionFactors:
        """Analyze all factors that influence game outcome"""
        return PredictionFactors(
            home_field_advantage=self._calculate_home_field_advantage(game),
            recent_form=self._calculate_recent_form_advantage(game.home_team, game.away_team),
            head_to_head_history=self._calculate_head_to_head_advantage(game.home_team, game.away_team),
            offensive_strength=self._calculate_offensive_advantage(home_stats, away_stats),
            defensive_strength=self._calculate_defensive_advantage(home_stats, away_stats),
            injuries=self._calculate_injury_impact(home_stats, away_stats),
            weather=self._calculate_weather_impact(game.weather),
            motivation=self._calculate_motivation_factor(game, home_stats, away_stats)
        )

    def _calculate_prediction(self, game: Game, home_stats: TeamStats, away_stats: TeamStats, 
                            factors: PredictionFactors) -> GamePrediction:
        """Calculate the main prediction based on all factors"""
        # Base prediction on team strength
        home_offensive_rating = home_stats.avg_points_for
        away_offensive_rating = away_stats.avg_points_for
        
        # Calculate expected scores
        home_expected_score = (home_offensive_rating + (35 - away_stats.avg_points_against)) / 2
        away_expected_score = (away_offensive_rating + (35 - home_stats.avg_points_against)) / 2

        # Apply factors
        home_expected_score += factors.home_field_advantage
        home_expected_score += max(0, factors.recent_form)
        away_expected_score += max(0, -factors.recent_form)
        
        home_expected_score += max(0, factors.head_to_head_history)
        away_expected_score += max(0, -factors.head_to_head_history)

        home_expected_score += max(0, factors.offensive_strength)
        away_expected_score += max(0, -factors.offensive_strength)

        home_expected_score += max(0, factors.defensive_strength)
        away_expected_score += max(0, -factors.defensive_strength)

        # Weather and injury adjustments
        if factors.weather != 0:
            home_expected_score += factors.weather / 2
            away_expected_score += factors.weather / 2

        home_expected_score += max(0, factors.injuries)
        away_expected_score += max(0, -factors.injuries)

        # Round to realistic scores
        home_score = round(max(7, min(50, home_expected_score)))
        away_score = round(max(7, min(50, away_expected_score)))

        # Determine winner and confidence
        score_diff = abs(home_score - away_score)
        confidence = min(95, max(55, 60 + (score_diff * 2)))
        
        predicted_winner = game.home_team if home_score > away_score else game.away_team
        
        # Generate key factors
        key_factors = self._generate_key_factors(factors, home_stats, away_stats)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(game, factors, home_score, away_score)

        return GamePrediction(
            predicted_winner=predicted_winner,
            confidence=confidence,
            predicted_score={"home": home_score, "away": away_score},
            key_factors=key_factors,
            reasoning=reasoning
        )

    def _calculate_home_field_advantage(self, game: Game) -> float:
        """Calculate home field advantage impact"""
        base_advantage = self.HOME_FIELD_ADVANTAGE
        
        # Boost for certain stadiums known for strong home advantage
        strong_home_stadiums = ["SEA", "KC", "GB", "NO", "DEN"]
        if game.home_team in strong_home_stadiums:
            base_advantage += 1.5
        
        # Reduce for teams with poor home records
        home_stats = get_team_stats(game.home_team)
        home_wins = int(home_stats.home_record.split('-')[0]) if '-' in home_stats.home_record else 4
        if home_wins < 3:
            base_advantage -= 1.0
        
        return base_advantage

    def _calculate_recent_form_advantage(self, home_team: str, away_team: str) -> float:
        """Calculate advantage based on recent form"""
        home_stats = get_team_stats(home_team)
        away_stats = get_team_stats(away_team)
        
        home_wins = home_stats.last_five_games.count('W')
        away_wins = away_stats.last_five_games.count('W')
        
        return (home_wins - away_wins) * 1.5

    def _calculate_head_to_head_advantage(self, home_team: str, away_team: str) -> float:
        """Calculate historical head-to-head advantage"""
        h2h = get_head_to_head_record(home_team, away_team)
        
        if h2h.team1 == home_team:
            win_diff = h2h.team1_wins - h2h.team2_wins
        else:
            win_diff = h2h.team2_wins - h2h.team1_wins
        
        total_games = h2h.team1_wins + h2h.team2_wins + h2h.ties
        if total_games == 0:
            return 0
        
        return (win_diff / total_games) * 2.0

    def _calculate_offensive_advantage(self, home_stats: TeamStats, away_stats: TeamStats) -> float:
        """Calculate offensive strength advantage"""
        return (home_stats.avg_points_for - away_stats.avg_points_for) * 0.3

    def _calculate_defensive_advantage(self, home_stats: TeamStats, away_stats: TeamStats) -> float:
        """Calculate defensive strength advantage"""
        return (away_stats.avg_points_against - home_stats.avg_points_against) * 0.3

    def _calculate_injury_impact(self, home_stats: TeamStats, away_stats: TeamStats) -> float:
        """Calculate impact of injuries"""
        home_injury_impact = len(home_stats.injuries) * -0.5
        away_injury_impact = len(away_stats.injuries) * 0.5
        return home_injury_impact + away_injury_impact

    def _calculate_weather_impact(self, weather: Optional[WeatherConditions]) -> float:
        """Calculate weather impact on scoring"""
        if not weather:
            return 0
        
        impact = 0
        
        # Cold weather reduces scoring
        if weather.temperature < 32:
            impact -= 2
        elif weather.temperature < 45:
            impact -= 1
        
        # High winds reduce scoring
        if weather.wind_speed > 20:
            impact -= 2
        elif weather.wind_speed > 15:
            impact -= 1
        
        # Precipitation reduces scoring
        if weather.precipitation > 50:
            impact -= 1.5
        
        return impact

    def _calculate_motivation_factor(self, game: Game, home_stats: TeamStats, away_stats: TeamStats) -> float:
        """Calculate motivation factors (playoffs, division games, etc.)"""
        motivation = 0
        
        if game.is_playoffs:
            motivation += 2
        
        # Division rivalry games
        home_team_obj = get_team_by_abbreviation(game.home_team)
        away_team_obj = get_team_by_abbreviation(game.away_team)
        
        if home_team_obj and away_team_obj:
            if (home_team_obj.conference == away_team_obj.conference and 
                home_team_obj.division == away_team_obj.division):
                motivation += 1.5
        
        return motivation

    def _generate_key_factors(self, factors: PredictionFactors, home_stats: TeamStats, away_stats: TeamStats) -> list:
        """Generate list of key factors for the prediction"""
        key_factors = []
        
        if abs(factors.home_field_advantage) > 2:
            key_factors.append("Strong home field advantage")
        
        if abs(factors.recent_form) > 3:
            if factors.recent_form > 0:
                key_factors.append("Home team has better recent form")
            else:
                key_factors.append("Away team has better recent form")
        
        if abs(factors.offensive_strength) > 2:
            if factors.offensive_strength > 0:
                key_factors.append("Home team has stronger offense")
            else:
                key_factors.append("Away team has stronger offense")
        
        if abs(factors.defensive_strength) > 2:
            if factors.defensive_strength > 0:
                key_factors.append("Home team has stronger defense")
            else:
                key_factors.append("Away team has stronger defense")
        
        if factors.weather < -2:
            key_factors.append("Weather conditions favor lower scoring")
        
        return key_factors

    def _generate_reasoning(self, game: Game, factors: PredictionFactors, home_score: int, away_score: int) -> str:
        """Generate reasoning for the prediction"""
        winner = "home" if home_score > away_score else "away"
        margin = abs(home_score - away_score)
        
        reasoning = f"Predicting a {margin}-point victory for the {winner} team. "
        
        if factors.home_field_advantage > 2:
            reasoning += "Strong home field advantage plays a key role. "
        
        if abs(factors.recent_form) > 2:
            better_form = "home" if factors.recent_form > 0 else "away"
            reasoning += f"The {better_form} team's superior recent form is a deciding factor. "
        
        if factors.weather < -2:
            reasoning += "Poor weather conditions should limit scoring. "
        
        return reasoning.strip()
