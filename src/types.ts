import { LucideIcon, Trophy, CircleDot, Timer } from "lucide-react";

export interface Team {
  id: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
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
  standings: Team[];
  schedule: Match[];
  topScorers: Scorer[];
  csvUrl?: string;
}

export interface SportData {
  id: string;
  icon: LucideIcon;
  leagues: League[];
}

export const SPORTS_DATA: SportData[] = [
  {
    id: "FOOTBALL",
    icon: Trophy,
    leagues: [
      {
        id: "premier-league",
        name: "SKNFA Premier League",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1488245481&single=true&output=csv",
        standings: [],
        schedule: [
          { id: "m1", home: "Rams Village Superstars", away: "St. Paul's United", date: "Sat, June 15", time: "7:00 PM" }
        ],
        topScorers: [
          { id: "s1", name: "Keithroy Freeman", team: "St. Paul's United", goals: 12 }
        ]
      },
      {
        id: "division-1",
        name: "SKNFA Division 1",
        standings: [
          { id: "t1", name: "Mantab FC", played: 10, wins: 8, draws: 1, losses: 1, points: 25 },
          { id: "t2", name: "Security Forces", played: 10, wins: 7, draws: 2, losses: 1, points: 23 }
        ],
        schedule: [],
        topScorers: []
      }
    ]
  },
  {
    id: "NETBALL",
    icon: CircleDot,
    leagues: [
      {
        id: "skn-netball",
        name: "SKN Netball League",
        standings: [],
        schedule: [],
        topScorers: []
      }
    ]
  },
  {
    id: "CRICKET",
    icon: Timer,
    leagues: [
      {
        id: "cpl-t20",
        name: "CPL T20 (Nevis)",
        standings: [],
        schedule: [],
        topScorers: []
      }
    ]
  }
];