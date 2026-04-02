import type { GroupLabel } from '@/types/tournament';

export type ScheduleRound = 'GS' | 'R32' | 'R16' | 'QF' | 'SF' | '3P' | 'F';

export interface ScheduleMatch {
  matchNum: number;
  round: ScheduleRound;
  group?: GroupLabel;
  dateISO: string;       // e.g. "2026-06-11"
  timeEST: string;       // e.g. "3:00 PM ET"
  homeId?: string;       // team ID if known (group stage)
  awayId?: string;
  homeLabel: string;     // team name or seeding label
  awayLabel: string;
  stadium: string;
  city: string;
  country: 'USA' | 'Canada' | 'Mexico';
  bracketMatchId?: string; // links to knockoutBracket store (R32 only)
}

export const SCHEDULE: ScheduleMatch[] = [
  // ─── GROUP STAGE ───────────────────────────────────────────────
  // Group A
  {
    matchNum: 1, round: 'GS', group: 'A',
    dateISO: '2026-06-11', timeEST: '3:00 PM ET',
    homeId: 'MEX', awayId: 'RSA', homeLabel: 'Mexico', awayLabel: 'South Africa',
    stadium: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico',
  },
  {
    matchNum: 2, round: 'GS', group: 'A',
    dateISO: '2026-06-11', timeEST: '10:00 PM ET',
    homeId: 'KOR', awayId: 'CZE', homeLabel: 'South Korea', awayLabel: 'Czechia',
    stadium: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico',
  },
  // Group B
  {
    matchNum: 3, round: 'GS', group: 'B',
    dateISO: '2026-06-12', timeEST: '3:00 PM ET',
    homeId: 'CAN', awayId: 'BIH', homeLabel: 'Canada', awayLabel: 'Bosnia & Herzegovina',
    stadium: 'BMO Field', city: 'Toronto', country: 'Canada',
  },
  // Group D
  {
    matchNum: 4, round: 'GS', group: 'D',
    dateISO: '2026-06-12', timeEST: '9:00 PM ET',
    homeId: 'USA', awayId: 'PAR', homeLabel: 'USA', awayLabel: 'Paraguay',
    stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA',
  },
  // Group B
  {
    matchNum: 5, round: 'GS', group: 'B',
    dateISO: '2026-06-13', timeEST: '3:00 PM ET',
    homeId: 'QAT', awayId: 'SUI', homeLabel: 'Qatar', awayLabel: 'Switzerland',
    stadium: "Levi's Stadium", city: 'Santa Clara', country: 'USA',
  },
  // Group C
  {
    matchNum: 6, round: 'GS', group: 'C',
    dateISO: '2026-06-13', timeEST: '6:00 PM ET',
    homeId: 'BRA', awayId: 'MAR', homeLabel: 'Brazil', awayLabel: 'Morocco',
    stadium: 'MetLife Stadium', city: 'East Rutherford', country: 'USA',
  },
  {
    matchNum: 7, round: 'GS', group: 'C',
    dateISO: '2026-06-13', timeEST: '9:00 PM ET',
    homeId: 'HAI', awayId: 'SCO', homeLabel: 'Haiti', awayLabel: 'Scotland',
    stadium: 'Gillette Stadium', city: 'Foxborough', country: 'USA',
  },
  // Group D
  {
    matchNum: 8, round: 'GS', group: 'D',
    dateISO: '2026-06-14', timeEST: '12:00 AM ET',
    homeId: 'AUS', awayId: 'TUR', homeLabel: 'Australia', awayLabel: 'Türkiye',
    stadium: 'BC Place', city: 'Vancouver', country: 'Canada',
  },
  // Group E
  {
    matchNum: 9, round: 'GS', group: 'E',
    dateISO: '2026-06-14', timeEST: '1:00 PM ET',
    homeId: 'GER', awayId: 'CUW', homeLabel: 'Germany', awayLabel: 'Curaçao',
    stadium: 'NRG Stadium', city: 'Houston', country: 'USA',
  },
  // Group F
  {
    matchNum: 10, round: 'GS', group: 'F',
    dateISO: '2026-06-14', timeEST: '4:00 PM ET',
    homeId: 'NED', awayId: 'JPN', homeLabel: 'Netherlands', awayLabel: 'Japan',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
  },
  // Group E
  {
    matchNum: 11, round: 'GS', group: 'E',
    dateISO: '2026-06-14', timeEST: '7:00 PM ET',
    homeId: 'CIV', awayId: 'ECU', homeLabel: "Côte d'Ivoire", awayLabel: 'Ecuador',
    stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA',
  },
  // Group F
  {
    matchNum: 12, round: 'GS', group: 'F',
    dateISO: '2026-06-14', timeEST: '10:00 PM ET',
    homeId: 'SWE', awayId: 'TUN', homeLabel: 'Sweden', awayLabel: 'Tunisia',
    stadium: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico',
  },
  // Group H
  {
    matchNum: 13, round: 'GS', group: 'H',
    dateISO: '2026-06-15', timeEST: '12:00 PM ET',
    homeId: 'ESP', awayId: 'CPV', homeLabel: 'Spain', awayLabel: 'Cape Verde',
    stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA',
  },
  // Group G
  {
    matchNum: 14, round: 'GS', group: 'G',
    dateISO: '2026-06-15', timeEST: '3:00 PM ET',
    homeId: 'BEL', awayId: 'EGY', homeLabel: 'Belgium', awayLabel: 'Egypt',
    stadium: 'Lumen Field', city: 'Seattle', country: 'USA',
  },
  // Group H
  {
    matchNum: 15, round: 'GS', group: 'H',
    dateISO: '2026-06-15', timeEST: '6:00 PM ET',
    homeId: 'KSA', awayId: 'URU', homeLabel: 'Saudi Arabia', awayLabel: 'Uruguay',
    stadium: 'Hard Rock Stadium', city: 'Miami', country: 'USA',
  },
  // Group G
  {
    matchNum: 16, round: 'GS', group: 'G',
    dateISO: '2026-06-15', timeEST: '9:00 PM ET',
    homeId: 'IRN', awayId: 'NZL', homeLabel: 'Iran', awayLabel: 'New Zealand',
    stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA',
  },
  // Group I
  {
    matchNum: 17, round: 'GS', group: 'I',
    dateISO: '2026-06-16', timeEST: '3:00 PM ET',
    homeId: 'FRA', awayId: 'SEN', homeLabel: 'France', awayLabel: 'Senegal',
    stadium: 'MetLife Stadium', city: 'East Rutherford', country: 'USA',
  },
  {
    matchNum: 18, round: 'GS', group: 'I',
    dateISO: '2026-06-16', timeEST: '6:00 PM ET',
    homeId: 'IRQ', awayId: 'NOR', homeLabel: 'Iraq', awayLabel: 'Norway',
    stadium: 'Gillette Stadium', city: 'Foxborough', country: 'USA',
  },
  // Group J
  {
    matchNum: 19, round: 'GS', group: 'J',
    dateISO: '2026-06-16', timeEST: '9:00 PM ET',
    homeId: 'ARG', awayId: 'ALG', homeLabel: 'Argentina', awayLabel: 'Algeria',
    stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA',
  },
  {
    matchNum: 20, round: 'GS', group: 'J',
    dateISO: '2026-06-17', timeEST: '12:00 AM ET',
    homeId: 'AUT', awayId: 'JOR', homeLabel: 'Austria', awayLabel: 'Jordan',
    stadium: "Levi's Stadium", city: 'Santa Clara', country: 'USA',
  },
  // Group K
  {
    matchNum: 21, round: 'GS', group: 'K',
    dateISO: '2026-06-17', timeEST: '1:00 PM ET',
    homeId: 'POR', awayId: 'COD', homeLabel: 'Portugal', awayLabel: 'DR Congo',
    stadium: 'NRG Stadium', city: 'Houston', country: 'USA',
  },
  // Group L
  {
    matchNum: 22, round: 'GS', group: 'L',
    dateISO: '2026-06-17', timeEST: '4:00 PM ET',
    homeId: 'ENG', awayId: 'CRO', homeLabel: 'England', awayLabel: 'Croatia',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
  },
  {
    matchNum: 23, round: 'GS', group: 'L',
    dateISO: '2026-06-17', timeEST: '7:00 PM ET',
    homeId: 'GHA', awayId: 'PAN', homeLabel: 'Ghana', awayLabel: 'Panama',
    stadium: 'BMO Field', city: 'Toronto', country: 'Canada',
  },
  // Group K
  {
    matchNum: 24, round: 'GS', group: 'K',
    dateISO: '2026-06-17', timeEST: '10:00 PM ET',
    homeId: 'UZB', awayId: 'COL', homeLabel: 'Uzbekistan', awayLabel: 'Colombia',
    stadium: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico',
  },
  // Group A
  {
    matchNum: 25, round: 'GS', group: 'A',
    dateISO: '2026-06-18', timeEST: '12:00 PM ET',
    homeId: 'CZE', awayId: 'RSA', homeLabel: 'Czechia', awayLabel: 'South Africa',
    stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA',
  },
  // Group B
  {
    matchNum: 26, round: 'GS', group: 'B',
    dateISO: '2026-06-18', timeEST: '3:00 PM ET',
    homeId: 'SUI', awayId: 'BIH', homeLabel: 'Switzerland', awayLabel: 'Bosnia & Herzegovina',
    stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA',
  },
  {
    matchNum: 27, round: 'GS', group: 'B',
    dateISO: '2026-06-18', timeEST: '6:00 PM ET',
    homeId: 'CAN', awayId: 'QAT', homeLabel: 'Canada', awayLabel: 'Qatar',
    stadium: 'BC Place', city: 'Vancouver', country: 'Canada',
  },
  // Group A
  {
    matchNum: 28, round: 'GS', group: 'A',
    dateISO: '2026-06-18', timeEST: '9:00 PM ET',
    homeId: 'MEX', awayId: 'KOR', homeLabel: 'Mexico', awayLabel: 'South Korea',
    stadium: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico',
  },
  // Group D
  {
    matchNum: 29, round: 'GS', group: 'D',
    dateISO: '2026-06-19', timeEST: '3:00 PM ET',
    homeId: 'USA', awayId: 'AUS', homeLabel: 'USA', awayLabel: 'Australia',
    stadium: 'Lumen Field', city: 'Seattle', country: 'USA',
  },
  // Group C
  {
    matchNum: 30, round: 'GS', group: 'C',
    dateISO: '2026-06-19', timeEST: '6:00 PM ET',
    homeId: 'SCO', awayId: 'MAR', homeLabel: 'Scotland', awayLabel: 'Morocco',
    stadium: 'Gillette Stadium', city: 'Foxborough', country: 'USA',
  },
  {
    matchNum: 31, round: 'GS', group: 'C',
    dateISO: '2026-06-19', timeEST: '9:00 PM ET',
    homeId: 'BRA', awayId: 'HAI', homeLabel: 'Brazil', awayLabel: 'Haiti',
    stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA',
  },
  // Group D
  {
    matchNum: 32, round: 'GS', group: 'D',
    dateISO: '2026-06-20', timeEST: '12:00 AM ET',
    homeId: 'TUR', awayId: 'PAR', homeLabel: 'Türkiye', awayLabel: 'Paraguay',
    stadium: "Levi's Stadium", city: 'Santa Clara', country: 'USA',
  },
  // Group F
  {
    matchNum: 33, round: 'GS', group: 'F',
    dateISO: '2026-06-20', timeEST: '1:00 PM ET',
    homeId: 'NED', awayId: 'SWE', homeLabel: 'Netherlands', awayLabel: 'Sweden',
    stadium: 'NRG Stadium', city: 'Houston', country: 'USA',
  },
  // Group E
  {
    matchNum: 34, round: 'GS', group: 'E',
    dateISO: '2026-06-20', timeEST: '4:00 PM ET',
    homeId: 'GER', awayId: 'CIV', homeLabel: 'Germany', awayLabel: "Côte d'Ivoire",
    stadium: 'BMO Field', city: 'Toronto', country: 'Canada',
  },
  {
    matchNum: 35, round: 'GS', group: 'E',
    dateISO: '2026-06-20', timeEST: '8:00 PM ET',
    homeId: 'ECU', awayId: 'CUW', homeLabel: 'Ecuador', awayLabel: 'Curaçao',
    stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA',
  },
  // Group F
  {
    matchNum: 36, round: 'GS', group: 'F',
    dateISO: '2026-06-21', timeEST: '12:00 AM ET',
    homeId: 'TUN', awayId: 'JPN', homeLabel: 'Tunisia', awayLabel: 'Japan',
    stadium: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico',
  },
  // Group H
  {
    matchNum: 37, round: 'GS', group: 'H',
    dateISO: '2026-06-21', timeEST: '12:00 PM ET',
    homeId: 'ESP', awayId: 'KSA', homeLabel: 'Spain', awayLabel: 'Saudi Arabia',
    stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA',
  },
  // Group G
  {
    matchNum: 38, round: 'GS', group: 'G',
    dateISO: '2026-06-21', timeEST: '3:00 PM ET',
    homeId: 'BEL', awayId: 'IRN', homeLabel: 'Belgium', awayLabel: 'Iran',
    stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA',
  },
  // Group H
  {
    matchNum: 39, round: 'GS', group: 'H',
    dateISO: '2026-06-21', timeEST: '6:00 PM ET',
    homeId: 'URU', awayId: 'CPV', homeLabel: 'Uruguay', awayLabel: 'Cape Verde',
    stadium: 'Hard Rock Stadium', city: 'Miami', country: 'USA',
  },
  // Group G
  {
    matchNum: 40, round: 'GS', group: 'G',
    dateISO: '2026-06-21', timeEST: '9:00 PM ET',
    homeId: 'NZL', awayId: 'EGY', homeLabel: 'New Zealand', awayLabel: 'Egypt',
    stadium: 'BC Place', city: 'Vancouver', country: 'Canada',
  },
  // Group J
  {
    matchNum: 41, round: 'GS', group: 'J',
    dateISO: '2026-06-22', timeEST: '1:00 PM ET',
    homeId: 'ARG', awayId: 'AUT', homeLabel: 'Argentina', awayLabel: 'Austria',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
  },
  // Group I
  {
    matchNum: 42, round: 'GS', group: 'I',
    dateISO: '2026-06-22', timeEST: '5:00 PM ET',
    homeId: 'FRA', awayId: 'IRQ', homeLabel: 'France', awayLabel: 'Iraq',
    stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA',
  },
  {
    matchNum: 43, round: 'GS', group: 'I',
    dateISO: '2026-06-22', timeEST: '8:00 PM ET',
    homeId: 'NOR', awayId: 'SEN', homeLabel: 'Norway', awayLabel: 'Senegal',
    stadium: 'BMO Field', city: 'Toronto', country: 'Canada',
  },
  // Group J
  {
    matchNum: 44, round: 'GS', group: 'J',
    dateISO: '2026-06-22', timeEST: '11:00 PM ET',
    homeId: 'JOR', awayId: 'ALG', homeLabel: 'Jordan', awayLabel: 'Algeria',
    stadium: "Levi's Stadium", city: 'Santa Clara', country: 'USA',
  },
  // Group K
  {
    matchNum: 45, round: 'GS', group: 'K',
    dateISO: '2026-06-23', timeEST: '1:00 PM ET',
    homeId: 'POR', awayId: 'UZB', homeLabel: 'Portugal', awayLabel: 'Uzbekistan',
    stadium: 'NRG Stadium', city: 'Houston', country: 'USA',
  },
  // Group L
  {
    matchNum: 46, round: 'GS', group: 'L',
    dateISO: '2026-06-23', timeEST: '4:00 PM ET',
    homeId: 'ENG', awayId: 'GHA', homeLabel: 'England', awayLabel: 'Ghana',
    stadium: 'Gillette Stadium', city: 'Foxborough', country: 'USA',
  },
  {
    matchNum: 47, round: 'GS', group: 'L',
    dateISO: '2026-06-23', timeEST: '7:00 PM ET',
    homeId: 'PAN', awayId: 'CRO', homeLabel: 'Panama', awayLabel: 'Croatia',
    stadium: 'Gillette Stadium', city: 'Foxborough', country: 'USA',
  },
  // Group K
  {
    matchNum: 48, round: 'GS', group: 'K',
    dateISO: '2026-06-23', timeEST: '10:00 PM ET',
    homeId: 'COL', awayId: 'COD', homeLabel: 'Colombia', awayLabel: 'DR Congo',
    stadium: 'Estadio Akron', city: 'Guadalajara', country: 'Mexico',
  },
  // Group B (simultaneous)
  {
    matchNum: 49, round: 'GS', group: 'B',
    dateISO: '2026-06-24', timeEST: '3:00 PM ET',
    homeId: 'SUI', awayId: 'CAN', homeLabel: 'Switzerland', awayLabel: 'Canada',
    stadium: 'BC Place', city: 'Vancouver', country: 'Canada',
  },
  {
    matchNum: 50, round: 'GS', group: 'B',
    dateISO: '2026-06-24', timeEST: '3:00 PM ET',
    homeId: 'BIH', awayId: 'QAT', homeLabel: 'Bosnia & Herzegovina', awayLabel: 'Qatar',
    stadium: 'Lumen Field', city: 'Seattle', country: 'USA',
  },
  // Group C (simultaneous)
  {
    matchNum: 51, round: 'GS', group: 'C',
    dateISO: '2026-06-24', timeEST: '6:00 PM ET',
    homeId: 'MAR', awayId: 'HAI', homeLabel: 'Morocco', awayLabel: 'Haiti',
    stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA',
  },
  {
    matchNum: 52, round: 'GS', group: 'C',
    dateISO: '2026-06-24', timeEST: '6:00 PM ET',
    homeId: 'SCO', awayId: 'BRA', homeLabel: 'Scotland', awayLabel: 'Brazil',
    stadium: 'Hard Rock Stadium', city: 'Miami', country: 'USA',
  },
  // Group A (simultaneous)
  {
    matchNum: 53, round: 'GS', group: 'A',
    dateISO: '2026-06-24', timeEST: '9:00 PM ET',
    homeId: 'RSA', awayId: 'KOR', homeLabel: 'South Africa', awayLabel: 'South Korea',
    stadium: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico',
  },
  {
    matchNum: 54, round: 'GS', group: 'A',
    dateISO: '2026-06-24', timeEST: '9:00 PM ET',
    homeId: 'CZE', awayId: 'MEX', homeLabel: 'Czechia', awayLabel: 'Mexico',
    stadium: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico',
  },
  // Group E (simultaneous)
  {
    matchNum: 55, round: 'GS', group: 'E',
    dateISO: '2026-06-25', timeEST: '4:00 PM ET',
    homeId: 'CUW', awayId: 'CIV', homeLabel: 'Curaçao', awayLabel: "Côte d'Ivoire",
    stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA',
  },
  {
    matchNum: 56, round: 'GS', group: 'E',
    dateISO: '2026-06-25', timeEST: '4:00 PM ET',
    homeId: 'ECU', awayId: 'GER', homeLabel: 'Ecuador', awayLabel: 'Germany',
    stadium: 'MetLife Stadium', city: 'East Rutherford', country: 'USA',
  },
  // Group F (simultaneous)
  {
    matchNum: 57, round: 'GS', group: 'F',
    dateISO: '2026-06-25', timeEST: '7:00 PM ET',
    homeId: 'TUN', awayId: 'NED', homeLabel: 'Tunisia', awayLabel: 'Netherlands',
    stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA',
  },
  {
    matchNum: 58, round: 'GS', group: 'F',
    dateISO: '2026-06-25', timeEST: '7:00 PM ET',
    homeId: 'JPN', awayId: 'SWE', homeLabel: 'Japan', awayLabel: 'Sweden',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
  },
  // Group D (simultaneous)
  {
    matchNum: 59, round: 'GS', group: 'D',
    dateISO: '2026-06-25', timeEST: '10:00 PM ET',
    homeId: 'TUR', awayId: 'USA', homeLabel: 'Türkiye', awayLabel: 'USA',
    stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA',
  },
  {
    matchNum: 60, round: 'GS', group: 'D',
    dateISO: '2026-06-25', timeEST: '10:00 PM ET',
    homeId: 'PAR', awayId: 'AUS', homeLabel: 'Paraguay', awayLabel: 'Australia',
    stadium: "Levi's Stadium", city: 'Santa Clara', country: 'USA',
  },
  // Group I (simultaneous)
  {
    matchNum: 61, round: 'GS', group: 'I',
    dateISO: '2026-06-26', timeEST: '3:00 PM ET',
    homeId: 'NOR', awayId: 'FRA', homeLabel: 'Norway', awayLabel: 'France',
    stadium: 'Gillette Stadium', city: 'Foxborough', country: 'USA',
  },
  {
    matchNum: 62, round: 'GS', group: 'I',
    dateISO: '2026-06-26', timeEST: '3:00 PM ET',
    homeId: 'SEN', awayId: 'IRQ', homeLabel: 'Senegal', awayLabel: 'Iraq',
    stadium: 'BMO Field', city: 'Toronto', country: 'Canada',
  },
  // Group H (simultaneous)
  {
    matchNum: 63, round: 'GS', group: 'H',
    dateISO: '2026-06-26', timeEST: '8:00 PM ET',
    homeId: 'CPV', awayId: 'KSA', homeLabel: 'Cape Verde', awayLabel: 'Saudi Arabia',
    stadium: 'NRG Stadium', city: 'Houston', country: 'USA',
  },
  {
    matchNum: 64, round: 'GS', group: 'H',
    dateISO: '2026-06-26', timeEST: '8:00 PM ET',
    homeId: 'URU', awayId: 'ESP', homeLabel: 'Uruguay', awayLabel: 'Spain',
    stadium: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico',
  },
  // Group G (simultaneous)
  {
    matchNum: 65, round: 'GS', group: 'G',
    dateISO: '2026-06-26', timeEST: '11:00 PM ET',
    homeId: 'NZL', awayId: 'BEL', homeLabel: 'New Zealand', awayLabel: 'Belgium',
    stadium: 'BC Place', city: 'Vancouver', country: 'Canada',
  },
  {
    matchNum: 66, round: 'GS', group: 'G',
    dateISO: '2026-06-26', timeEST: '11:00 PM ET',
    homeId: 'EGY', awayId: 'IRN', homeLabel: 'Egypt', awayLabel: 'Iran',
    stadium: 'Lumen Field', city: 'Seattle', country: 'USA',
  },
  // Group L (simultaneous)
  {
    matchNum: 67, round: 'GS', group: 'L',
    dateISO: '2026-06-27', timeEST: '5:00 PM ET',
    homeId: 'PAN', awayId: 'ENG', homeLabel: 'Panama', awayLabel: 'England',
    stadium: 'MetLife Stadium', city: 'East Rutherford', country: 'USA',
  },
  {
    matchNum: 68, round: 'GS', group: 'L',
    dateISO: '2026-06-27', timeEST: '5:00 PM ET',
    homeId: 'CRO', awayId: 'GHA', homeLabel: 'Croatia', awayLabel: 'Ghana',
    stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA',
  },
  // Group K (simultaneous)
  {
    matchNum: 69, round: 'GS', group: 'K',
    dateISO: '2026-06-27', timeEST: '7:30 PM ET',
    homeId: 'COL', awayId: 'POR', homeLabel: 'Colombia', awayLabel: 'Portugal',
    stadium: 'Hard Rock Stadium', city: 'Miami', country: 'USA',
  },
  {
    matchNum: 70, round: 'GS', group: 'K',
    dateISO: '2026-06-27', timeEST: '7:30 PM ET',
    homeId: 'COD', awayId: 'UZB', homeLabel: 'DR Congo', awayLabel: 'Uzbekistan',
    stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA',
  },
  // Group J (simultaneous)
  {
    matchNum: 71, round: 'GS', group: 'J',
    dateISO: '2026-06-27', timeEST: '10:00 PM ET',
    homeId: 'ALG', awayId: 'AUT', homeLabel: 'Algeria', awayLabel: 'Austria',
    stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA',
  },
  {
    matchNum: 72, round: 'GS', group: 'J',
    dateISO: '2026-06-27', timeEST: '10:00 PM ET',
    homeId: 'JOR', awayId: 'ARG', homeLabel: 'Jordan', awayLabel: 'Argentina',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
  },

  // ─── ROUND OF 32 ───────────────────────────────────────────────
  {
    matchNum: 73, round: 'R32',
    dateISO: '2026-06-28', timeEST: '3:00 PM ET',
    homeLabel: 'Group A Runner-Up', awayLabel: 'Group B Runner-Up',
    stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA',
    bracketMatchId: 'R32_M1',
  },
  {
    matchNum: 74, round: 'R32',
    dateISO: '2026-06-29', timeEST: '4:30 PM ET',
    homeLabel: 'Group E Winner', awayLabel: '3rd Place (A/B/C/D/F)',
    stadium: 'Gillette Stadium', city: 'Foxborough', country: 'USA',
    bracketMatchId: 'R32_M3',
  },
  {
    matchNum: 75, round: 'R32',
    dateISO: '2026-06-29', timeEST: '9:00 PM ET',
    homeLabel: 'Group F Winner', awayLabel: 'Group C Runner-Up',
    stadium: 'Estadio BBVA', city: 'Monterrey', country: 'Mexico',
    bracketMatchId: 'R32_M4',
  },
  {
    matchNum: 76, round: 'R32',
    dateISO: '2026-06-29', timeEST: '1:00 PM ET',
    homeLabel: 'Group C Winner', awayLabel: 'Group F Runner-Up',
    stadium: 'NRG Stadium', city: 'Houston', country: 'USA',
    bracketMatchId: 'R32_M2',
  },
  {
    matchNum: 77, round: 'R32',
    dateISO: '2026-06-30', timeEST: '5:00 PM ET',
    homeLabel: 'Group I Winner', awayLabel: '3rd Place (C/D/F/G/H)',
    stadium: 'MetLife Stadium', city: 'East Rutherford', country: 'USA',
    bracketMatchId: 'R32_M6',
  },
  {
    matchNum: 78, round: 'R32',
    dateISO: '2026-06-30', timeEST: '1:00 PM ET',
    homeLabel: 'Group E Runner-Up', awayLabel: 'Group I Runner-Up',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
    bracketMatchId: 'R32_M5',
  },
  {
    matchNum: 79, round: 'R32',
    dateISO: '2026-06-30', timeEST: '9:00 PM ET',
    homeLabel: 'Group A Winner', awayLabel: '3rd Place (C/E/F/H/I)',
    stadium: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico',
    bracketMatchId: 'R32_M7',
  },
  {
    matchNum: 80, round: 'R32',
    dateISO: '2026-07-01', timeEST: '12:00 PM ET',
    homeLabel: 'Group L Winner', awayLabel: '3rd Place (E/H/I/J/K)',
    stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA',
    bracketMatchId: 'R32_M16',
  },
  {
    matchNum: 81, round: 'R32',
    dateISO: '2026-07-01', timeEST: '8:00 PM ET',
    homeLabel: 'Group D Winner', awayLabel: '3rd Place (B/E/F/I/J)',
    stadium: "Levi's Stadium", city: 'Santa Clara', country: 'USA',
    bracketMatchId: 'R32_M10',
  },
  {
    matchNum: 82, round: 'R32',
    dateISO: '2026-07-01', timeEST: '4:00 PM ET',
    homeLabel: 'Group G Winner', awayLabel: '3rd Place (A/E/H/I/J)',
    stadium: 'Lumen Field', city: 'Seattle', country: 'USA',
    bracketMatchId: 'R32_M9',
  },
  {
    matchNum: 83, round: 'R32',
    dateISO: '2026-07-02', timeEST: '7:00 PM ET',
    homeLabel: 'Group K Runner-Up', awayLabel: 'Group L Runner-Up',
    stadium: 'BMO Field', city: 'Toronto', country: 'Canada',
    bracketMatchId: 'R32_M12',
  },
  {
    matchNum: 84, round: 'R32',
    dateISO: '2026-07-02', timeEST: '3:00 PM ET',
    homeLabel: 'Group H Winner', awayLabel: 'Group J Runner-Up',
    stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA',
    bracketMatchId: 'R32_M8',
  },
  {
    matchNum: 85, round: 'R32',
    dateISO: '2026-07-02', timeEST: '11:00 PM ET',
    homeLabel: 'Group B Winner', awayLabel: '3rd Place (E/F/G/I/J)',
    stadium: 'BC Place', city: 'Vancouver', country: 'Canada',
    bracketMatchId: 'R32_M13',
  },
  {
    matchNum: 86, round: 'R32',
    dateISO: '2026-07-03', timeEST: '6:00 PM ET',
    homeLabel: 'Group J Winner', awayLabel: 'Group H Runner-Up',
    stadium: 'Hard Rock Stadium', city: 'Miami', country: 'USA',
    bracketMatchId: 'R32_M11',
  },
  {
    matchNum: 87, round: 'R32',
    dateISO: '2026-07-03', timeEST: '9:30 PM ET',
    homeLabel: 'Group K Winner', awayLabel: '3rd Place (D/E/I/J/L)',
    stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA',
    bracketMatchId: 'R32_M15',
  },
  {
    matchNum: 88, round: 'R32',
    dateISO: '2026-07-03', timeEST: '2:00 PM ET',
    homeLabel: 'Group D Runner-Up', awayLabel: 'Group G Runner-Up',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
    bracketMatchId: 'R32_M14',
  },

  // ─── ROUND OF 16 ───────────────────────────────────────────────
  {
    matchNum: 89, round: 'R16',
    dateISO: '2026-07-04', timeEST: '5:00 PM ET',
    homeLabel: 'Winner M74', awayLabel: 'Winner M77',
    stadium: 'Lincoln Financial Field', city: 'Philadelphia', country: 'USA',
  },
  {
    matchNum: 90, round: 'R16',
    dateISO: '2026-07-04', timeEST: '1:00 PM ET',
    homeLabel: 'Winner M73', awayLabel: 'Winner M75',
    stadium: 'NRG Stadium', city: 'Houston', country: 'USA',
  },
  {
    matchNum: 91, round: 'R16',
    dateISO: '2026-07-05', timeEST: '4:00 PM ET',
    homeLabel: 'Winner M76', awayLabel: 'Winner M78',
    stadium: 'MetLife Stadium', city: 'East Rutherford', country: 'USA',
  },
  {
    matchNum: 92, round: 'R16',
    dateISO: '2026-07-05', timeEST: '8:00 PM ET',
    homeLabel: 'Winner M79', awayLabel: 'Winner M80',
    stadium: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico',
  },
  {
    matchNum: 93, round: 'R16',
    dateISO: '2026-07-06', timeEST: '3:00 PM ET',
    homeLabel: 'Winner M83', awayLabel: 'Winner M84',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
  },
  {
    matchNum: 94, round: 'R16',
    dateISO: '2026-07-06', timeEST: '8:00 PM ET',
    homeLabel: 'Winner M81', awayLabel: 'Winner M82',
    stadium: 'Lumen Field', city: 'Seattle', country: 'USA',
  },
  {
    matchNum: 95, round: 'R16',
    dateISO: '2026-07-07', timeEST: '12:00 PM ET',
    homeLabel: 'Winner M86', awayLabel: 'Winner M88',
    stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA',
  },
  {
    matchNum: 96, round: 'R16',
    dateISO: '2026-07-07', timeEST: '4:00 PM ET',
    homeLabel: 'Winner M85', awayLabel: 'Winner M87',
    stadium: 'BC Place', city: 'Vancouver', country: 'Canada',
  },

  // ─── QUARTERFINALS ─────────────────────────────────────────────
  {
    matchNum: 97, round: 'QF',
    dateISO: '2026-07-09', timeEST: '4:00 PM ET',
    homeLabel: 'Winner M89', awayLabel: 'Winner M90',
    stadium: 'Gillette Stadium', city: 'Foxborough', country: 'USA',
  },
  {
    matchNum: 98, round: 'QF',
    dateISO: '2026-07-10', timeEST: '3:00 PM ET',
    homeLabel: 'Winner M93', awayLabel: 'Winner M94',
    stadium: 'SoFi Stadium', city: 'Los Angeles', country: 'USA',
  },
  {
    matchNum: 99, round: 'QF',
    dateISO: '2026-07-11', timeEST: '5:00 PM ET',
    homeLabel: 'Winner M91', awayLabel: 'Winner M92',
    stadium: 'Hard Rock Stadium', city: 'Miami', country: 'USA',
  },
  {
    matchNum: 100, round: 'QF',
    dateISO: '2026-07-11', timeEST: '9:00 PM ET',
    homeLabel: 'Winner M95', awayLabel: 'Winner M96',
    stadium: 'Arrowhead Stadium', city: 'Kansas City', country: 'USA',
  },

  // ─── SEMIFINALS ────────────────────────────────────────────────
  {
    matchNum: 101, round: 'SF',
    dateISO: '2026-07-14', timeEST: '3:00 PM ET',
    homeLabel: 'Winner M97', awayLabel: 'Winner M98',
    stadium: 'AT&T Stadium', city: 'Arlington', country: 'USA',
  },
  {
    matchNum: 102, round: 'SF',
    dateISO: '2026-07-15', timeEST: '3:00 PM ET',
    homeLabel: 'Winner M99', awayLabel: 'Winner M100',
    stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'USA',
  },

  // ─── THIRD PLACE ───────────────────────────────────────────────
  {
    matchNum: 103, round: '3P',
    dateISO: '2026-07-18', timeEST: '5:00 PM ET',
    homeLabel: 'Loser M101', awayLabel: 'Loser M102',
    stadium: 'Hard Rock Stadium', city: 'Miami', country: 'USA',
  },

  // ─── FINAL ─────────────────────────────────────────────────────
  {
    matchNum: 104, round: 'F',
    dateISO: '2026-07-19', timeEST: '3:00 PM ET',
    homeLabel: 'Winner M101', awayLabel: 'Winner M102',
    stadium: 'MetLife Stadium', city: 'East Rutherford', country: 'USA',
  },
];
