import { LucideIcon, CircleDot, Dribbble, createLucideIcon } from "lucide-react";
import { soccerBall } from "@lucide/lab";

export const SoccerBall = createLucideIcon("SoccerBall", soccerBall);

export const CricketBat = createLucideIcon("CricketBat", [
  ["path", { d: "M11 2.5a.8.8 0 0 1 .8-.8h.4a.8.8 0 0 1 .8.8V7.5h-2z", key: "handle" }],
  ["path", { d: "M11 4.2h2", key: "grip1" }],
  ["path", { d: "M11 5.8h2", key: "grip2" }],
  ["path", { d: "M11 7.5c0 1.5-3.5 2-3.5 3.5v9.5c0 .8 2 1.5 4.5 1.5s4.5-.7 4.5-1.5V11c0-1.5-3.5-2-3.5-3.5", key: "blade" }],
  ["path", { d: "M12 9.5v12", key: "spine" }]
]);

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
  venue?: string;
  matchweek?: string;
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
    icon: SoccerBall,
    leagues: [
      {
        id: "premier-league",
        name: "SKNFA Premier League 2026",
        csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1488245481&single=true&output=csv",
        scheduleCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1215230199&single=true&output=csv",
        standings: [],
        schedule: [
          // Matchweek 1 (Sept 4-6, 2026)
          { id: "skn-mw1-1", home: "Development Bank St. Peters", away: "Azul Cayon Rockets", date: "9/4/2026", time: "7:00 PM", homeScore: 0, awayScore: 0, venue: "NBG Technical Center", matchweek: "Matchweek 1" },
          { id: "skn-mw1-2", home: "TGE Dieppe Bay Eagles", away: "607 Construction Lodge Patriots", date: "9/5/2026", time: "5:00 PM", homeScore: 5, awayScore: 1, venue: "NBG Technical Center", matchweek: "Matchweek 1" },
          { id: "skn-mw1-3", home: "S L Horsford St. Pauls United", away: "SOL Island Auto Conaree", date: "9/5/2026", time: "7:30 PM", homeScore: 3, awayScore: 0, venue: "NBG Technical Center", matchweek: "Matchweek 1" },
          { id: "skn-mw1-4", home: "Rams Village Superstars", away: "SKELEC Garden Hotspurs", date: "9/6/2026", time: "5:00 PM", homeScore: 4, awayScore: 0, venue: "NBG Technical Center", matchweek: "Matchweek 1" },
          { id: "skn-mw1-5", home: "Honda Newtown United", away: "MFCR United Old Road Jets", date: "9/6/2026", time: "7:30 PM", homeScore: 2, awayScore: 0, venue: "NBG Technical Center", matchweek: "Matchweek 1" },

          // Matchweek 2 & 3 (Sept 17-20, 2026)
          { id: "skn-mw2-1", home: "607 Construction Lodge Patriots", away: "SOL Island Auto Conaree", date: "9/17/2026", time: "7:00 PM", homeScore: 0, awayScore: 2, venue: "NBG Technical Center", matchweek: "Matchweek 2" },
          { id: "skn-mw2-2", home: "TGE Dieppe Bay Eagles", away: "MFCR United Old Road Jets", date: "9/18/2026", time: "7:00 PM", homeScore: 3, awayScore: 8, venue: "NBG Technical Center", matchweek: "Matchweek 2" },
          { id: "skn-mw2-3", home: "Honda Newtown United", away: "Azul Cayon Rockets", date: "9/19/2026", time: "6:00 PM", homeScore: 4, awayScore: 0, venue: "NBG Technical Center", matchweek: "Matchweek 3" },
          { id: "skn-mw2-4", home: "S L Horsford St. Pauls United", away: "SKELEC Garden Hotspurs", date: "9/19/2026", time: "8:15 PM", homeScore: 3, awayScore: 0, venue: "NBG Technical Center", matchweek: "Matchweek 3" },
          { id: "skn-mw2-5", home: "Rams Village Superstars", away: "Development Bank St. Peters", date: "9/20/2026", time: "6:00 PM", homeScore: 2, awayScore: 1, venue: "NBG Technical Center", matchweek: "Matchweek 3" },

          // Matchweek 4 (Upcoming)
          { id: "skn-mw4-1", home: "Azul Cayon Rockets", away: "SKELEC Garden Hotspurs", date: "9/25/2026", time: "6:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 4" },
          { id: "skn-mw4-2", home: "MFCR United Old Road Jets", away: "607 Construction Lodge Patriots", date: "9/25/2026", time: "8:15 PM", venue: "NBG Technical Center", matchweek: "Matchweek 4" },
          { id: "skn-mw4-3", home: "SOL Island Auto Conaree", away: "Development Bank St. Peters", date: "9/26/2026", time: "5:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 4" },
          { id: "skn-mw4-4", home: "Honda Newtown United", away: "Rams Village Superstars", date: "9/26/2026", time: "7:30 PM", venue: "NBG Technical Center", matchweek: "Matchweek 4" },
          { id: "skn-mw4-5", home: "S L Horsford St. Pauls United", away: "TGE Dieppe Bay Eagles", date: "9/27/2026", time: "6:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 4" },

          // Matchweek 5
          { id: "skn-mw5-1", home: "SKELEC Garden Hotspurs", away: "607 Construction Lodge Patriots", date: "10/2/2026", time: "6:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 5" },
          { id: "skn-mw5-2", home: "Azul Cayon Rockets", away: "MFCR United Old Road Jets", date: "10/2/2026", time: "8:15 PM", venue: "NBG Technical Center", matchweek: "Matchweek 5" },
          { id: "skn-mw5-3", home: "Development Bank St. Peters", away: "Honda Newtown United", date: "10/3/2026", time: "5:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 5" },
          { id: "skn-mw5-4", home: "Rams Village Superstars", away: "S L Horsford St. Pauls United", date: "10/3/2026", time: "7:30 PM", venue: "NBG Technical Center", matchweek: "Matchweek 5" },
          { id: "skn-mw5-5", home: "TGE Dieppe Bay Eagles", away: "SOL Island Auto Conaree", date: "10/4/2026", time: "6:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 5" },

          // Matchweek 6
          { id: "skn-mw6-1", home: "Honda Newtown United", away: "TGE Dieppe Bay Eagles", date: "10/9/2026", time: "6:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 6" },
          { id: "skn-mw6-2", home: "SOL Island Auto Conaree", away: "Azul Cayon Rockets", date: "10/9/2026", time: "8:15 PM", venue: "NBG Technical Center", matchweek: "Matchweek 6" },
          { id: "skn-mw6-3", home: "SKELEC Garden Hotspurs", away: "MFCR United Old Road Jets", date: "10/10/2026", time: "5:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 6" },
          { id: "skn-mw6-4", home: "607 Construction Lodge Patriots", away: "Rams Village Superstars", date: "10/10/2026", time: "7:30 PM", venue: "NBG Technical Center", matchweek: "Matchweek 6" },
          { id: "skn-mw6-5", home: "Development Bank St. Peters", away: "S L Horsford St. Pauls United", date: "10/11/2026", time: "6:00 PM", venue: "NBG Technical Center", matchweek: "Matchweek 6" }
        ],
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
    icon: CricketBat,
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