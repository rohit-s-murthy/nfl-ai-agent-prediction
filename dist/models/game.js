"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    constructor(homeTeam, awayTeam, date, homeScore = 0, awayScore = 0, week, season, isPlayoffs = false, weather) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.date = date;
        this.homeScore = homeScore;
        this.awayScore = awayScore;
        this.week = week;
        this.season = season;
        this.isPlayoffs = isPlayoffs;
        this.weather = weather;
    }
    calculateOutcome() {
        if (this.homeScore > this.awayScore) {
            return `${this.homeTeam} wins`;
        }
        else if (this.homeScore < this.awayScore) {
            return `${this.awayTeam} wins`;
        }
        else {
            return "It's a tie";
        }
    }
    getMatchup() {
        return `${this.awayTeam} @ ${this.homeTeam} on ${this.date.toDateString()}`;
    }
    getSpread() {
        return this.homeScore - this.awayScore;
    }
    getTotalPoints() {
        return this.homeScore + this.awayScore;
    }
    isCompleted() {
        return this.homeScore > 0 || this.awayScore > 0;
    }
}
exports.Game = Game;
