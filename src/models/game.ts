export interface TeamStats {
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
    avgPointsFor: number;
    avgPointsAgainst: number;
    homeRecord: string;
    awayRecord: string;
    lastFiveGames: string;
    injuries: string[];
    keyPlayers: string[];
}

export interface WeatherConditions {
    temperature: number;
    windSpeed: number;
    precipitation: number;
    conditions: string;
}

export interface GamePrediction {
    predictedWinner: string;
    confidence: number;
    predictedScore: {
        home: number;
        away: number;
    };
    keyFactors: string[];
    reasoning: string;
}

export class Game {
    constructor(
        public homeTeam: string,
        public awayTeam: string,
        public date: Date,
        public homeScore: number = 0,
        public awayScore: number = 0,
        public week?: number,
        public season?: number,
        public isPlayoffs: boolean = false,
        public weather?: WeatherConditions
    ) {}

    public calculateOutcome(): string {
        if (this.homeScore > this.awayScore) {
            return `${this.homeTeam} wins`;
        } else if (this.homeScore < this.awayScore) {
            return `${this.awayTeam} wins`;
        } else {
            return "It's a tie";
        }
    }

    public getMatchup(): string {
        return `${this.awayTeam} @ ${this.homeTeam} on ${this.date.toDateString()}`;
    }

    public getSpread(): number {
        return this.homeScore - this.awayScore;
    }

    public getTotalPoints(): number {
        return this.homeScore + this.awayScore;
    }

    public isCompleted(): boolean {
        return this.homeScore > 0 || this.awayScore > 0;
    }
}