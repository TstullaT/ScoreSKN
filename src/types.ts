import { LucideIcon, Trophy, CircleDot, Timer, Dribbble } from "lucide-react";

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
  homeScore?: number;
  awayScore?: number;
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
  scheduleCsvUrl?: string;
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
        scheduleCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1215230199&single=true&output=csv",
        standings: [],
        schedule: [],
        topScorers: []
      },
      {
        id: "division-1",
        name: "SKNFA Division 1",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1809975653&single=true&output=csv",
        standings: [],
        schedule: [],
        topScorers: []
      },
      {
        id: "u13",
        name: "SKNFA Under 13",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1495966735&single=true&output=csv",
        standings: [],
        schedule: [],
        topScorers: []
      }
    ]
  },
  {
    id: "BASKETBALL",
    icon: Dribbble,
    leagues: [
      {
        id: "sknaba-premier",
        name: "SKNABA Premier League",
        standings: [],
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