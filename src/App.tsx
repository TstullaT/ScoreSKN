import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trophy, Calendar, Users, ChevronRight, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import Papa from "papaparse";
// Fixed the path from ../types to ./types
import { SPORTS_DATA, SportData, League, Team } from "./types";

// These are placed at the very top (Global scope) so they are never "undefined"
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1488245481&single=true&output=csv";
const PROXY_URL = "https://api.allorigins.win/raw?url=";

// --- Sub-components ---

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-1 text-blue-100 hover:text-white transition-colors mb-4 group"
  >
    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
    <span className="text-sm font-medium">Back</span>
  </button>
);

const StandingsTab = ({ league, liveStandings, lastUpdated }: { league: League, liveStandings: Team[] | null, lastUpdated: string | null }) => {
  if (league.csvUrl && liveStandings && liveStandings.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No live standings data available at the moment.</p>
        <p className="text-slate-400 text-xs mt-1">Please check back later.</p>
      </div>
    );
  }

  const dataToUse = (liveStandings && liveStandings.length > 0) ? liveStandings : league.standings;
  const sorted = [...dataToUse].sort((a, b) => b.points - a.points);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[400px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">#</th>
              <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team</th>
              <th className="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">P</th>
              <th className="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">W</th>
              <th className="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">D</th>
              <th className="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">L</th>
              <th className="px-3 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider w-14">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((team, i) => (
              <tr key={team.id} className="border-l-4 border-l-transparent">
                <td className="px-3 py-3 text-xs font-medium text-slate-500">{i + 1}</td>
                <td className="px-3 py-3 text-sm font-bold text-slate-800 truncate max-w-[120px]">{team.name}</td>
                <td className="px-2 py-3 text-center text-xs font-medium text-slate-600">{team.played ?? '-'}</td>
                <td className="px-2 py-3 text-center text-xs font-medium text-slate-600">{team.wins ?? '-'}</td>
                <td className="px-2 py-3 text-center text-xs font-medium text-slate-600">{team.draws ?? '-'}</td>
                <td className="px-2 py-3 text-center text-xs font-medium text-slate-600">{team.losses ?? '-'}</td>
                <td className="px-3 py-3 text-right text-sm font-mono font-bold text-blue-600">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lastUpdated && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-medium italic text-right">
          Last updated: {lastUpdated}
        </div>
      )}
    </div>
  );
};

const ScheduleTab = ({ league }: { league: League }) => (
  <div className="space-y-3">
    {league.schedule.length > 0 ? league.schedule.map((match) => (
      <div key={match.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{match.date}</span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{match.time}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-right font-bold text-slate-800">{match.home}</div>
          <div className="text-slate-300 font-black italic">VS</div>
          <div className="flex-1 text-left font-bold text-slate-800">{match.away}</div>
        </div>
      </div>
    )) : (
      <div className="text-center py-12 text-slate-400 italic">No upcoming matches scheduled.</div>
    )}
  </div>
);

const ScorersTab = ({ league }: { league: League }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Player</th>
          <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider w-16">Goals</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {league.topScorers.length > 0 ? league.topScorers.map((scorer) => (
          <tr key={scorer.id}>
            <td className="px-4 py-3">
              <div className="text-sm font-bold text-slate-800">{scorer.name}</div>
              <div className="text-[10px] text-slate-400 font-medium">{scorer.team}</div>
            </td>
            <td className="px-4 py-3 text-right text-sm font-mono font-bold text-blue-600">{scorer.goals}</td>
          </tr>
        )) : (
          <tr>
            <td colSpan={2} className="text-center py-12 text-slate-400 italic">No data available.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- Main App ---

export default function SportsApp() {
  const [view, setView] = useState<'home' | 'leagues' | 'league-detail'>('home');
  const [selectedSport, setSelectedSport] = useState<SportData | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [activeTab, setActiveTab] = useState<'standings' | 'schedule' | 'scorers'>('standings');
  const [liveStandings, setLiveStandings] = useState<Team[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagueData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Added a cache-buster (&cb=) to ensure we always get new data
      const finalUrl = PROXY_URL + encodeURIComponent(SHEET_URL + "&cb=" + Date.now());
      const response = await fetch(finalUrl);
      
      if (!response.ok) throw new Error(`Fetch failed (Status: ${response.status})`);
      
      const csvData = await response.text();

      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const keys = Object.keys(results.data[0] as any);
            
            // Logic to find column names regardless of capitalization
            const teamKey = keys.find(k => k.toLowerCase().includes('team') || k.toLowerCase().includes('club'));
            const ptsKey = keys.find(k => k.toLowerCase() === 'pts' || k.toLowerCase().includes('points'));

            const mappedData: Team[] = results.data
              .filter((row: any) => teamKey && row[teamKey])
              .map((row: any, index: number) => ({
                id: `live-${index}`,
                name: String(row[teamKey!]),
                played: parseInt(row['P'] || row['Played'] || 0),
                wins: parseInt(row['W'] || row['Wins'] || 0),
                draws: parseInt(row['D'] || row['Draws'] || 0),
                losses: parseInt(row['L'] || row['Losses'] || 0),
                points: parseInt(row[ptsKey!] || 0)
              }));
            
            setLiveStandings(mappedData);
            setLastUpdated(new Date().toLocaleTimeString());
          }
          setLoading(false);
        }
      });
    } catch (err) {
      setError("Unable to load live scores. Check your connection.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'league-detail' && selectedLeague?.csvUrl) {
      fetchLeagueData();
    }
  }, [view, selectedLeague]);

  const goBack = () => {
    if (view === 'league-detail') setView('leagues');
    else if (view === 'leagues') setView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-blue-900 text-white pt-12 pb-6 px-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-md mx-auto">
          {view !== 'home' && <BackButton onClick={goBack} />}
          <h1 className="text-3xl font-black italic uppercase">
            {view === 'home' ? 'SPORTSKN' : selectedSport?.id}
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" className="grid grid-cols-2 gap-4">
              {SPORTS_DATA.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => { setSelectedSport(sport); setView('leagues'); }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-4 hover:border-blue-500 transition-all"
                >
                  <sport.icon className="w-6 h-6 text-blue-600" />
                  <span className="font-bold">{sport.id}</span>
                </button>
              ))}
            </motion.div>
          )}

          {view === 'leagues' && (
            <div className="space-y-3">
              {selectedSport?.leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => { setSelectedLeague(league); setView('league-detail'); }}
                  className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between"
                >
                  <span className="font-bold">{league.name}</span>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </div>
          )}

          {view === 'league-detail' && selectedLeague && (
            <div className="space-y-6">
              <div className="flex bg-slate-200 p-1 rounded-xl">
                {['standings', 'schedule', 'scorers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : error ? (
                <div className="text-center p-8 bg-white rounded-xl border border-red-100">
                  <p className="text-red-500 font-bold">{error}</p>
                </div>
              ) : (
                <>
                  {activeTab === 'standings' && <StandingsTab league={selectedLeague} liveStandings={liveStandings} lastUpdated={lastUpdated} />}
                  {activeTab === 'schedule' && <ScheduleTab league={selectedLeague} />}
                  {activeTab === 'scorers' && <ScorersTab league={selectedLeague} />}
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
