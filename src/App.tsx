import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trophy, Calendar, Users, ChevronRight, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { SPORTS_DATA, SportData, League, Team } from "./types";

// --- Global Configuration ---
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIyff_G1mCUQRIG_bIT44aQDN4IllZs7UR4V4btUBohm4h0mdxyfI7CWbxPSb12KwI4YrZh69hi3Wv/pub?gid=1488245481&single=true&output=csv";
// Swapped to a more stable proxy service
const PROXY_URL = "https://corsproxy.io/?url=";

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
        <p className="text-slate-500 font-medium">No live standings data available.</p>
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
              <tr key={team.id} className="border-l-4 border-l-transparent hover:bg-slate-50 transition-colors">
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
      // Use encodeURIComponent to safely wrap the URL for the proxy
      // Added a cache-buster (&cb=) to ensure fresh data every time
      const finalUrl = PROXY_URL + encodeURIComponent(SHEET_URL + "&cb=" + Date.now());
      
      const response = await fetch(finalUrl);
      
      if (!response.ok) {
        throw new Error(`Proxy error (Status: ${response.status})`);
      }
      
      const csvData = await response.text();

      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const keys = Object.keys(results.data[0] as any);
            
            // Flexible matching for column names (Team, P, W, D, L, PTS)
            const teamKey = keys.find(k => k.toLowerCase().includes('team') || k.toLowerCase().includes('club')) || 'Team';
            const ptsKey = keys.find(k => k.toLowerCase() === 'pts' || k.toLowerCase().includes('points')) || 'PTS';
            const pKey = keys.find(k => k.toLowerCase() === 'p' || k.toLowerCase() === 'played') || 'P';
            const wKey = keys.find(k => k.toLowerCase() === 'w' || k.toLowerCase() === 'wins') || 'W';
            const dKey = keys.find(k => k.toLowerCase() === 'd' || k.toLowerCase() === 'draws') || 'D';
            const lKey = keys.find(k => k.toLowerCase() === 'l' || k.toLowerCase() === 'losses') || 'L';

            const mappedData: Team[] = results.data
              .filter((row: any) => row[teamKey])
              .map((row: any, index: number) => ({
                id: `live-${index}`,
                name: String(row[teamKey]),
                played: parseInt(row[pKey] || 0),
                wins: parseInt(row[wKey] || 0),
                draws: parseInt(row[dKey] || 0),
                losses: parseInt(row[lKey] || 0),
                points: parseInt(row[ptsKey] || 0)
              }));
            
            setLiveStandings(mappedData);
            setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
          setLoading(false);
        },
        error: () => {
          setError("Failed to parse sheet data.");
          setLoading(false);
        }
      });
    } catch (err) {
      setError("Data source unreachable. Try again in a moment.");
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
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            {view === 'home' ? 'SPORTSKN' : selectedSport?.id}
          </h1>
          <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-1">
            {view === 'home' ? 'Local Sports Hub' : selectedLeague?.name}
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-4"
            >
              {SPORTS_DATA.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => { setSelectedSport(sport); setView('leagues'); }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-4 hover:border-blue-500 transition-all active:scale-95"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <sport.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700">{sport.id}</span>
                </button>
              ))}
            </motion.div>
          )}

          {view === 'leagues' && (
            <motion.div 
              key="leagues"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {selectedSport?.leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => { setSelectedLeague(league); setView('league-detail'); }}
                  className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-500 transition-all"
                >
                  <span className="font-bold text-slate-700">{league.name}</span>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </motion.div>
          )}

          {view === 'league-detail' && selectedLeague && (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex bg-slate-200 p-1 rounded-xl">
                {['standings', 'schedule', 'scorers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Refreshing Data...</span>
                </div>
              ) : error ? (
                <div className="text-center p-12 bg-white rounded-xl border border-red-50 shadow-sm">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-slate-500 text-sm mb-6">{error}</p>
                  <button 
                    onClick={fetchLeagueData}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md active:scale-95"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'standings' && <StandingsTab league={selectedLeague} liveStandings={liveStandings} lastUpdated={lastUpdated} />}
                  {activeTab === 'schedule' && <ScheduleTab league={selectedLeague} />}
                  {activeTab === 'scorers' && <ScorersTab league={selectedLeague} />}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
