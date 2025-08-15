"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamsByDivision = exports.getTeamsByConference = exports.getTeamByAbbreviation = exports.getTeamStats = exports.teams = void 0;
exports.teams = [
    { name: "Arizona Cardinals", abbreviation: "ARI", conference: "NFC", division: "West", city: "Arizona", stadium: "State Farm Stadium", established: 1898 },
    { name: "Atlanta Falcons", abbreviation: "ATL", conference: "NFC", division: "South", city: "Atlanta", stadium: "Mercedes-Benz Stadium", established: 1966 },
    { name: "Baltimore Ravens", abbreviation: "BAL", conference: "AFC", division: "North", city: "Baltimore", stadium: "M&T Bank Stadium", established: 1996 },
    { name: "Buffalo Bills", abbreviation: "BUF", conference: "AFC", division: "East", city: "Buffalo", stadium: "Highmark Stadium", established: 1960 },
    { name: "Carolina Panthers", abbreviation: "CAR", conference: "NFC", division: "South", city: "Carolina", stadium: "Bank of America Stadium", established: 1995 },
    { name: "Chicago Bears", abbreviation: "CHI", conference: "NFC", division: "North", city: "Chicago", stadium: "Soldier Field", established: 1920 },
    { name: "Cincinnati Bengals", abbreviation: "CIN", conference: "AFC", division: "North", city: "Cincinnati", stadium: "Paycor Stadium", established: 1968 },
    { name: "Cleveland Browns", abbreviation: "CLE", conference: "AFC", division: "North", city: "Cleveland", stadium: "Cleveland Browns Stadium", established: 1946 },
    { name: "Dallas Cowboys", abbreviation: "DAL", conference: "NFC", division: "East", city: "Dallas", stadium: "AT&T Stadium", established: 1960 },
    { name: "Denver Broncos", abbreviation: "DEN", conference: "AFC", division: "West", city: "Denver", stadium: "Empower Field at Mile High", established: 1960 },
    { name: "Detroit Lions", abbreviation: "DET", conference: "NFC", division: "North", city: "Detroit", stadium: "Ford Field", established: 1930 },
    { name: "Green Bay Packers", abbreviation: "GB", conference: "NFC", division: "North", city: "Green Bay", stadium: "Lambeau Field", established: 1919 },
    { name: "Houston Texans", abbreviation: "HOU", conference: "AFC", division: "South", city: "Houston", stadium: "NRG Stadium", established: 2002 },
    { name: "Indianapolis Colts", abbreviation: "IND", conference: "AFC", division: "South", city: "Indianapolis", stadium: "Lucas Oil Stadium", established: 1953 },
    { name: "Jacksonville Jaguars", abbreviation: "JAX", conference: "AFC", division: "South", city: "Jacksonville", stadium: "TIAA Bank Field", established: 1995 },
    { name: "Kansas City Chiefs", abbreviation: "KC", conference: "AFC", division: "West", city: "Kansas City", stadium: "Arrowhead Stadium", established: 1960 },
    { name: "Las Vegas Raiders", abbreviation: "LV", conference: "AFC", division: "West", city: "Las Vegas", stadium: "Allegiant Stadium", established: 1960 },
    { name: "Los Angeles Chargers", abbreviation: "LAC", conference: "AFC", division: "West", city: "Los Angeles", stadium: "SoFi Stadium", established: 1960 },
    { name: "Los Angeles Rams", abbreviation: "LAR", conference: "NFC", division: "West", city: "Los Angeles", stadium: "SoFi Stadium", established: 1937 },
    { name: "Miami Dolphins", abbreviation: "MIA", conference: "AFC", division: "East", city: "Miami", stadium: "Hard Rock Stadium", established: 1966 },
    { name: "Minnesota Vikings", abbreviation: "MIN", conference: "NFC", division: "North", city: "Minneapolis", stadium: "U.S. Bank Stadium", established: 1961 },
    { name: "New England Patriots", abbreviation: "NE", conference: "AFC", division: "East", city: "Foxborough", stadium: "Gillette Stadium", established: 1960 },
    { name: "New Orleans Saints", abbreviation: "NO", conference: "NFC", division: "South", city: "New Orleans", stadium: "Caesars Superdome", established: 1967 },
    { name: "New York Giants", abbreviation: "NYG", conference: "NFC", division: "East", city: "East Rutherford", stadium: "MetLife Stadium", established: 1925 },
    { name: "New York Jets", abbreviation: "NYJ", conference: "AFC", division: "East", city: "East Rutherford", stadium: "MetLife Stadium", established: 1960 },
    { name: "Philadelphia Eagles", abbreviation: "PHI", conference: "NFC", division: "East", city: "Philadelphia", stadium: "Lincoln Financial Field", established: 1933 },
    { name: "Pittsburgh Steelers", abbreviation: "PIT", conference: "AFC", division: "North", city: "Pittsburgh", stadium: "Heinz Field", established: 1933 },
    { name: "San Francisco 49ers", abbreviation: "SF", conference: "NFC", division: "West", city: "San Francisco", stadium: "Levi's Stadium", established: 1946 },
    { name: "Seattle Seahawks", abbreviation: "SEA", conference: "NFC", division: "West", city: "Seattle", stadium: "Lumen Field", established: 1976 },
    { name: "Tampa Bay Buccaneers", abbreviation: "TB", conference: "NFC", division: "South", city: "Tampa Bay", stadium: "Raymond James Stadium", established: 1976 },
    { name: "Tennessee Titans", abbreviation: "TEN", conference: "AFC", division: "South", city: "Nashville", stadium: "Nissan Stadium", established: 1960 },
    { name: "Washington Commanders", abbreviation: "WAS", conference: "NFC", division: "East", city: "Washington", stadium: "FedExField", established: 1932 },
];
// Sample team statistics (in a real app, this would come from an API)
const sampleTeamStats = {
    "KC": {
        wins: 14,
        losses: 3,
        ties: 0,
        pointsFor: 489,
        pointsAgainst: 334,
        avgPointsFor: 28.8,
        avgPointsAgainst: 19.6,
        homeRecord: "8-1",
        awayRecord: "6-2",
        lastFiveGames: "W-W-W-L-W",
        injuries: ["WR2 - Questionable"],
        keyPlayers: ["Patrick Mahomes", "Travis Kelce", "Chris Jones"]
    },
    "BUF": {
        wins: 13,
        losses: 4,
        ties: 0,
        pointsFor: 483,
        pointsAgainst: 289,
        avgPointsFor: 28.4,
        avgPointsAgainst: 17.0,
        homeRecord: "7-2",
        awayRecord: "6-2",
        lastFiveGames: "W-W-L-W-W",
        injuries: ["RB1 - Out"],
        keyPlayers: ["Josh Allen", "Stefon Diggs", "Von Miller"]
    }
};
const getTeamStats = (teamAbbreviation) => {
    return sampleTeamStats[teamAbbreviation] || {
        wins: 8,
        losses: 9,
        ties: 0,
        pointsFor: 350,
        pointsAgainst: 370,
        avgPointsFor: 20.6,
        avgPointsAgainst: 21.8,
        homeRecord: "4-5",
        awayRecord: "4-4",
        lastFiveGames: "L-W-L-W-L",
        injuries: [],
        keyPlayers: []
    };
};
exports.getTeamStats = getTeamStats;
const getTeamByAbbreviation = (abbreviation) => {
    return exports.teams.find(team => team.abbreviation === abbreviation);
};
exports.getTeamByAbbreviation = getTeamByAbbreviation;
const getTeamsByConference = (conference) => {
    return exports.teams.filter(team => team.conference === conference);
};
exports.getTeamsByConference = getTeamsByConference;
const getTeamsByDivision = (conference, division) => {
    return exports.teams.filter(team => team.conference === conference && team.division === division);
};
exports.getTeamsByDivision = getTeamsByDivision;
