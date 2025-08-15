import fetch from 'node-fetch';

export interface ESPNGame {
    id: string;
    date: string;
    name: string;
    shortName: string;
    competitions: Array<{
        id: string;
        date: string;
        attendance: number;
        type: {
            id: string;
            abbreviation: string;
        };
        timeValid: boolean;
        neutralSite: boolean;
        conferenceCompetition: boolean;
        playByPlayAvailable: boolean;
        recent: boolean;
        venue: {
            id: string;
            fullName: string;
            address: {
                city: string;
                state: string;
            };
            capacity: number;
            indoor: boolean;
        };
        competitors: Array<{
            id: string;
            uid: string;
            type: string;
            order: number;
            homeAway: string;
            team: {
                id: string;
                uid: string;
                location: string;
                name: string;
                abbreviation: string;
                displayName: string;
                shortDisplayName: string;
                color: string;
                alternateColor: string;
                isActive: boolean;
                venue: {
                    id: string;
                };
                links: Array<{
                    language: string;
                    rel: string[];
                    href: string;
                    text: string;
                    shortText: string;
                    isExternal: boolean;
                    isPremium: boolean;
                }>;
                logo: string;
            };
            score: string;
            linescores: Array<{
                value: number;
            }>;
            statistics: any[];
            records: Array<{
                name: string;
                abbreviation: string;
                type: string;
                summary: string;
            }>;
        }>;
        notes: any[];
        status: {
            clock: number;
            displayClock: string;
            period: number;
            type: {
                id: string;
                name: string;
                state: string;
                completed: boolean;
                description: string;
                detail: string;
                shortDetail: string;
            };
        };
        broadcasts: Array<{
            market: string;
            names: string[];
        }>;
        leaders: Array<{
            name: string;
            displayName: string;
            shortDisplayName: string;
            abbreviation: string;
            leaders: Array<{
                displayValue: string;
                value: number;
                athlete: {
                    id: string;
                    fullName: string;
                    displayName: string;
                    shortName: string;
                    links: Array<{
                        rel: string[];
                        href: string;
                    }>;
                    headshot: string;
                    jersey: string;
                    position: string;
                    team: {
                        id: string;
                    };
                    active: boolean;
                };
                team: {
                    id: string;
                };
            }>;
        }>;
        format: {
            regulation: {
                periods: number;
            };
        };
        startDate: string;
        geoBroadcasts: Array<{
            type: {
                id: string;
                shortName: string;
            };
            market: {
                id: string;
                type: string;
            };
            media: {
                shortName: string;
            };
        }>;
        headlines: Array<{
            description: string;
            type: string;
            shortLinkText: string;
            video: Array<{
                id: number;
                source: string;
                headline: string;
                thumbnail: string;
                duration: number;
                tracking: {
                    sportName: string;
                    leagueName: string;
                    coverageType: string;
                    trackingName: string;
                    trackingId: string;
                };
                deviceRestrictions: {
                    type: string;
                    devices: string[];
                };
                links: {
                    api: {
                        self: {
                            href: string;
                        };
                        artwork: {
                            href: string;
                        };
                    };
                    web: {
                        href: string;
                        short: {
                            href: string;
                        };
                        self: {
                            href: string;
                        };
                    };
                    source: {
                        mezzanine: {
                            href: string;
                        };
                        flash: {
                            href: string;
                        };
                        hds: {
                            href: string;
                        };
                        HLS: {
                            href: string;
                            HD: {
                                href: string;
                            };
                        };
                        HD: {
                            href: string;
                        };
                        full: {
                            href: string;
                        };
                        href: string;
                    };
                    mobile: {
                        alert: {
                            href: string;
                        };
                        source: {
                            href: string;
                        };
                        href: string;
                        streaming: {
                            href: string;
                        };
                        progressiveDownload: {
                            href: string;
                        };
                    };
                };
            }>;
        }>;
    }>;
    links: Array<{
        language: string;
        rel: string[];
        href: string;
        text: string;
        shortText: string;
        isExternal: boolean;
        isPremium: boolean;
    }>;
    weather: {
        displayValue: string;
        temperature: number;
        highTemperature: number;
        conditionId: string;
        link: {
            language: string;
            rel: string[];
            href: string;
            text: string;
            shortText: string;
            isExternal: boolean;
            isPremium: boolean;
        };
    };
    status: {
        clock: number;
        displayClock: string;
        period: number;
        type: {
            id: string;
            name: string;
            state: string;
            completed: boolean;
            description: string;
            detail: string;
            shortDetail: string;
        };
    };
}

export interface ESPNResponse {
    leagues: Array<{
        id: string;
        uid: string;
        name: string;
        abbreviation: string;
        slug: string;
        season: {
            year: number;
            startDate: string;
            endDate: string;
            displayName: string;
            type: {
                id: string;
                type: number;
                name: string;
                abbreviation: string;
            };
        };
        logos: Array<{
            href: string;
            width: number;
            height: number;
            alt: string;
            rel: string[];
            lastUpdated: string;
        }>;
        calendarType: string;
        calendarIsWhitelist: boolean;
        calendarStartDate: string;
        calendarEndDate: string;
        calendar: string[];
    }>;
    season: {
        type: number;
        year: number;
    };
    week: {
        number: number;
    };
    events: ESPNGame[];
}

export interface NFLMatchup {
    home: string;
    away: string;
    day: string;
    date: Date;
    gameId: string;
    venue: string;
    weather?: {
        temperature: number;
        conditions: string;
    };
}

export class NFLScheduleAPI {
    private readonly ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
    private readonly CURRENT_SEASON = 2025;

    /**
     * Get real NFL schedule for a specific week
     */
    public async getWeeklySchedule(week: number, season: number = this.CURRENT_SEASON): Promise<NFLMatchup[]> {
        try {
            console.log(`🔄 Fetching real NFL schedule for Week ${week}, ${season}...`);
            
            // ESPN API URL for NFL schedule
            const url = `${this.ESPN_BASE_URL}/scoreboard?week=${week}&seasontype=2&year=${season}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json() as ESPNResponse;
            
            if (!data.events || data.events.length === 0) {
                console.log(`⚠️  No games found for Week ${week}, ${season}. Using fallback schedule.`);
                return this.getFallbackSchedule(week);
            }

            const matchups: NFLMatchup[] = data.events.map(event => {
                const competition = event.competitions[0];
                const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
                const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
                
                if (!homeTeam || !awayTeam) {
                    throw new Error('Unable to determine home/away teams');
                }

                const gameDate = new Date(competition.date);
                const dayOfWeek = this.getDayOfWeek(gameDate);

                return {
                    home: homeTeam.team.abbreviation,
                    away: awayTeam.team.abbreviation,
                    day: dayOfWeek,
                    date: gameDate,
                    gameId: event.id,
                    venue: competition.venue?.fullName || 'TBD',
                    weather: event.weather ? {
                        temperature: event.weather.temperature,
                        conditions: event.weather.displayValue
                    } : undefined
                };
            });

            console.log(`✅ Successfully fetched ${matchups.length} games for Week ${week}`);
            return matchups;

        } catch (error) {
            console.error(`❌ Error fetching NFL schedule:`, error);
            console.log(`🔄 Falling back to sample schedule for Week ${week}`);
            return this.getFallbackSchedule(week);
        }
    }

    /**
     * Get the current NFL week based on date
     */
    public getCurrentWeek(): number {
        const now = new Date();
        const seasonStart = new Date(this.CURRENT_SEASON, 8, 5); // Approximate season start (September 5)
        
        const daysDiff = Math.floor((now.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
        const week = Math.floor(daysDiff / 7) + 1;
        
        // Clamp to valid week range (1-22, including playoffs)
        return Math.max(1, Math.min(22, week));
    }

    /**
     * Get team schedule for the entire season
     */
    public async getTeamSchedule(teamAbbreviation: string, season: number = this.CURRENT_SEASON): Promise<NFLMatchup[]> {
        const allGames: NFLMatchup[] = [];
        
        // Regular season (weeks 1-18) + playoffs (weeks 19-22)
        for (let week = 1; week <= 18; week++) {
            try {
                const weekGames = await this.getWeeklySchedule(week, season);
                const teamGames = weekGames.filter(game => 
                    game.home === teamAbbreviation || game.away === teamAbbreviation
                );
                allGames.push(...teamGames);
            } catch (error) {
                console.warn(`Could not fetch week ${week} for team ${teamAbbreviation}`);
            }
        }

        return allGames;
    }

    /**
     * Check if a week has games scheduled
     */
    public async hasGamesScheduled(week: number, season: number = this.CURRENT_SEASON): Promise<boolean> {
        try {
            const games = await this.getWeeklySchedule(week, season);
            return games.length > 0;
        } catch {
            return false;
        }
    }

    /**
     * Get fallback schedule when API fails
     */
    private getFallbackSchedule(week: number): NFLMatchup[] {
        console.log(`📋 Using fallback schedule for Week ${week}`);
        
        const fallbackMatchups = [
            { home: 'KC', away: 'BUF', day: 'Thursday' },
            { home: 'DAL', away: 'NYG', day: 'Sunday' },
            { home: 'GB', away: 'CHI', day: 'Sunday' },
            { home: 'SF', away: 'LAR', day: 'Sunday' },
            { home: 'MIA', away: 'NYJ', day: 'Sunday' },
            { home: 'PIT', away: 'BAL', day: 'Sunday' },
            { home: 'MIN', away: 'DET', day: 'Sunday' },
            { home: 'TEN', away: 'IND', day: 'Sunday' },
            { home: 'JAX', away: 'HOU', day: 'Sunday' },
            { home: 'DEN', away: 'LV', day: 'Sunday' },
            { home: 'LAC', away: 'ARI', day: 'Sunday' },
            { home: 'SEA', away: 'TB', day: 'Sunday' },
            { home: 'ATL', away: 'CAR', day: 'Sunday' },
            { home: 'PHI', away: 'WAS', day: 'Sunday' },
            { home: 'NO', away: 'CLE', day: 'Monday' },
            { home: 'NE', away: 'CIN', day: 'Monday' }
        ];

        // Rotate based on week to simulate different schedules
        const startIndex = (week - 1) * 2 % fallbackMatchups.length;
        const selectedGames = fallbackMatchups.slice(startIndex, startIndex + 8).concat(
            fallbackMatchups.slice(0, Math.max(0, startIndex + 8 - fallbackMatchups.length))
        );

        return selectedGames.map(matchup => {
            const gameDate = this.calculateGameDate(week, matchup.day);
            return {
                ...matchup,
                date: gameDate,
                gameId: `fallback-${week}-${matchup.home}-${matchup.away}`,
                venue: 'TBD'
            };
        });
    }

    /**
     * Convert date to day of week string
     */
    private getDayOfWeek(date: Date): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }

    /**
     * Calculate game date for fallback schedule
     */
    private calculateGameDate(week: number, day: string): Date {
        const seasonStart = new Date(this.CURRENT_SEASON, 8, 5); // September 5
        const weekStart = new Date(seasonStart);
        weekStart.setDate(seasonStart.getDate() + (week - 1) * 7);

        const gameDate = new Date(weekStart);
        
        switch (day) {
            case 'Thursday':
                gameDate.setDate(weekStart.getDate() + 4);
                gameDate.setHours(20, 15); // 8:15 PM ET
                break;
            case 'Sunday':
                gameDate.setDate(weekStart.getDate() + 7);
                gameDate.setHours(13, 0); // 1:00 PM ET
                break;
            case 'Monday':
                gameDate.setDate(weekStart.getDate() + 8);
                gameDate.setHours(20, 15); // 8:15 PM ET
                break;
            default:
                gameDate.setDate(weekStart.getDate() + 7);
                gameDate.setHours(13, 0);
        }

        return gameDate;
    }

    /**
     * Get live scores for games in progress
     */
    public async getLiveScores(): Promise<Array<{gameId: string, homeTeam: string, awayTeam: string, homeScore: number, awayScore: number, status: string, quarter: string}>> {
        try {
            console.log('🌐 Connecting to ESPN NFL API for live scores...');
            const url = `${this.ESPN_BASE_URL}/scoreboard`;
            const response = await fetch(url, { timeout: 10000 });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json() as ESPNResponse;

            if (!data.events || data.events.length === 0) {
                console.log('📅 No games currently in progress');
                return this.getSampleLiveScores();
            }

            const liveScores = data.events.map(event => {
                const competition = event.competitions[0];
                const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
                const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
                
                return {
                    gameId: event.id,
                    homeTeam: homeTeam?.team.abbreviation || 'TBD',
                    awayTeam: awayTeam?.team.abbreviation || 'TBD',
                    homeScore: parseInt(homeTeam?.score || '0'),
                    awayScore: parseInt(awayTeam?.score || '0'),
                    status: competition.status.type.description,
                    quarter: competition.status.period ? `Q${competition.status.period}` : 'Final'
                };
            });

            console.log(`✅ Retrieved ${liveScores.length} live game(s)`);
            return liveScores;

        } catch (error) {
            console.log('⚠️  Live API unavailable, showing sample scores...');
            return this.getSampleLiveScores();
        }
    }

    /**
     * Get sample live scores for demonstration
     */
    private getSampleLiveScores(): Array<{gameId: string, homeTeam: string, awayTeam: string, homeScore: number, awayScore: number, status: string, quarter: string}> {
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Show sample scores on Sunday (game day) or for demo purposes
        if (dayOfWeek === 0 || process.argv.includes('--demo')) {
            return [
                {
                    gameId: 'sample-1',
                    homeTeam: 'KC',
                    awayTeam: 'BUF', 
                    homeScore: 14,
                    awayScore: 10,
                    status: 'In Progress',
                    quarter: 'Q2'
                },
                {
                    gameId: 'sample-2',
                    homeTeam: 'SF',
                    awayTeam: 'DAL',
                    homeScore: 21,
                    awayScore: 17,
                    status: 'Final',
                    quarter: 'Final'
                },
                {
                    gameId: 'sample-3',
                    homeTeam: 'PHI',
                    awayTeam: 'NYG',
                    homeScore: 7,
                    awayScore: 3,
                    status: 'In Progress', 
                    quarter: 'Q1'
                }
            ];
        }
        
        return []; // No sample scores on non-game days
    }
}

export default NFLScheduleAPI;
