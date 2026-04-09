import { Trophy, Calendar, Users, ChevronRight, ChevronLeft, LayoutGrid, Dumbbell, Target, Trophy as TrophyIcon, CircleDot, Flag, Activity, Dribbble } from "lucide-react";

export type SportType = 'Football' | 'Basketball' | 'Netball' | 'Cricket';

export interface Team {
  id: string;
  name: string;
  played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  points: number;
}

export interface Match {
  id: string;
  home: string;
  away: string;
  date: string;
  time: string;
}

export interface Scorer {
  id: string;
  name: string;
  team: string;
  goals: number;
}

export interface League {
  id: string;
  name: string;
  csvUrl?: string;
  standings: Team[];
  schedule: Match[];
  topScorers: Scorer[];
}

export interface SportData {
  id: SportType;
  icon: any;
  orgName?: string;
  leagues: League[];
}

export const SPORTS_DATA: SportData[] = [
  {
    id: 'Football',
    icon: TrophyIcon,
    orgName: 'Sknfa',
    leagues: [
      {
        id: 'pl',
        name: 'Premier League',
        csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1488245481&single=true&output=csv',
        standings: [
          { id: '1', name: 'Old Road United Jets', played: 18, wins: 15, draws: 1, losses: 2, points: 46 },
          { id: '2', name: 'Newtown United', played: 18, wins: 9, draws: 4, losses: 5, points: 31 },
          { id: '3', name: 'St. Peters FC', played: 18, wins: 8, draws: 4, losses: 6, points: 28 },
          { id: '4', name: 'Cayon Rockets', played: 18, wins: 8, draws: 4, losses: 6, points: 28 },
          { id: '5', name: 'St. Paul\'s United', played: 18, wins: 7, draws: 6, losses: 5, points: 27 },
          { id: '6', name: 'Village Superstars', played: 18, wins: 7, draws: 4, losses: 7, points: 25 },
        ],
        schedule: [
          { id: 'm1', home: 'Newtown United', away: 'St. Peters FC', date: 'Sat, Apr 11', time: '15:00' },
          { id: 'm2', home: 'Cayon Rockets', away: 'Old Road United Jets', date: 'Sun, Apr 12', time: '16:30' },
        ],
        topScorers: [
          { id: 's1', name: 'Keithroy Freeman', team: 'St. Paul\'s United', goals: 12 },
          { id: 's2', name: 'Tiquanny Williams', team: 'Old Road United Jets', goals: 10 },
        ]
      },
      {
        id: 'd1',
        name: 'Division 1',
        csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1809975653&single=true&output=csv',
        standings: [
          { id: '1', name: 'Saddlers United', played: 15, wins: 12, draws: 2, losses: 1, points: 38 },
          { id: '2', name: 'Mantab FC', played: 15, wins: 11, draws: 2, losses: 2, points: 35 },
        ],
        schedule: [],
        topScorers: []
      },
      {
        id: 'u13',
        name: 'Under 13',
        standings: [
          { id: '1', name: 'Youth Academy A', played: 0, wins: 0, draws: 0, losses: 0, points: 0 },
          { id: '2', name: 'Youth Academy B', played: 0, wins: 0, draws: 0, losses: 0, points: 0 },
        ],
        schedule: [],
        topScorers: []
      }
    ]
  },
  {
    id: 'Basketball',
    icon: Dribbble,
    orgName: 'Sknaba',
    leagues: [
      {
        id: 'sknaba',
        name: 'SKNABA Premier',
        standings: [
          { id: '1', name: 'Hitters', played: 10, wins: 9, draws: 0, losses: 1, points: 18 },
          { id: '2', name: 'Ghetto Roots', played: 10, wins: 8, draws: 0, losses: 2, points: 16 },
        ],
        schedule: [],
        topScorers: []
      }
    ]
  },
  {
    id: 'Netball',
    icon: LayoutGrid,
    orgName: 'Sna',
    leagues: [
      {
        id: 'sna',
        name: 'National League',
        standings: [
          { id: '1', name: 'St. Kitts Elite', played: 6, wins: 6, draws: 0, losses: 0, points: 12 },
          { id: '2', name: 'Nevis Stars', played: 6, wins: 5, draws: 0, losses: 1, points: 10 },
        ],
        schedule: [],
        topScorers: []
      }
    ]
  },
  {
    id: 'Cricket',
    icon: Flag,
    orgName: 'Sknca',
    leagues: [
      {
        id: 'cpl',
        name: 'CPL T20',
        standings: [
          { id: '1', name: 'St Kitts & Nevis Patriots', played: 5, wins: 4, draws: 0, losses: 1, points: 8 },
          { id: '2', name: 'Guyana Amazon Warriors', played: 5, wins: 3, draws: 0, losses: 2, points: 6 },
        ],
        schedule: [],
        topScorers: []
      }
    ]
  }
];
