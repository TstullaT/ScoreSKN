import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trophy, Calendar, Users, ChevronRight, Loader2, Info, Sun, Moon } from "lucide-react";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { SPORTS_DATA, SportData, League, Team } from "../types";

// --- Sub-components ---

const BackButton = ({ onClick, theme }: { onClick: () => void, theme: 'light' | 'dark' }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1 transition-colors group px-3 py-1 rounded-full border ${
      theme === 'dark' 
        ? 'text-slate-100 border-white/10 bg-white/5 hover:bg-white/10' 
        : 'text-green-700 border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
    }`}
  >
    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
    <span className="text-xs font-bold uppercase tracking-wider">Back</span>
  </button>
);

const StandingsTab = ({ league, liveStandings, lastUpdated, isLoading, theme }: { league: League, liveStandings: Team[] | null, lastUpdated: string | null, isLoading: boolean, theme: 'light' | 'dark' }) => {
  if (!liveStandings && league.standings.length === 0) {
    return (
      <div className={`${theme === 'dark' ? 'bg-slate-900/40 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200'} p-12 rounded-2xl border text-center shadow-2xl`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
          <Info className={`w-6 h-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-300'}`} />
        </div>
        <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-800'} font-bold uppercase tracking-tight`}>No standings available.</p>
      </div>
    );
  }

  const dataToUse = (liveStandings && liveStandings.length > 0) ? liveStandings : league.standings;
  const sorted = [...dataToUse].sort((a, b) => b.points - a.points);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-950/50 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200'} rounded-2xl shadow-2xl overflow-hidden border relative`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[400px]">
          <thead>
            <tr className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} border-b`}>
              <th className="px-3 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-10">#</th>
              <th className="px-3 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Team</th>
              <th className="px-2 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-10">P</th>
              <th className="px-2 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-10">W</th>
              <th className="px-2 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-10">D</th>
              <th className="px-2 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-10">L</th>
              <th className={`px-3 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] w-14 ${theme === 'dark' ? 'text-yellow-500' : 'text-green-600'}`}>PTS</th>
            </tr>
          </thead>
          <motion.tbody variants={containerVariants} initial="hidden" animate="show" className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
            {sorted.map((team, i) => {
              const rank = i + 1;
              let statusColor = "border-l-transparent";
              if (league.name.includes("Premier") && rank <= 4) statusColor = "border-l-green-500";
              else if (league.name.includes("Premier") && rank >= 9) statusColor = "border-l-red-600";
              else if (league.name.includes("Division 1") && rank <= 2) statusColor = "border-l-green-500";

              return (
                <motion.tr key={team.id} variants={itemVariants} className={`transition-colors border-l-4 ${statusColor} ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="px-3 py-4 text-xs font-black text-slate-400">{rank}</td>
                  <td className={`px-3 py-4 text-sm font-black italic truncate max-w-[120px] uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{team.name}</td>
                  <td className={`px-2 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{team.played ?? '-'}</td>
                  <td className={`px-2 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{team.wins ?? '-'}</td>
                  <td className={`px-2 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{team.draws ?? '-'}</td>
                  <td className={`px-2 py-4 text-center text-xs font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{team.losses ?? '-'}</td>
                  <td className={`px-3 py-4 text-right text-sm font-mono font-black ${theme === 'dark' ? 'text-yellow-500' : 'text-green-600'}`}>{team.points}</td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
      {lastUpdated && (
        <div className={`px-4 py-3 border-t text-[9px] font-black uppercase tracking-widest italic text-right flex justify-between items-center ${theme === 'dark' ? 'bg-black/20 border-white/5 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            <span>{isLoading ? 'Syncing...' : 'Live Data Active'}</span>
          </div>
          <span>Updated: {lastUpdated}</span>
        </div>
      )}
    </div>
  );
};

const ScheduleTab = ({ league, theme }: { league: League, theme: 'light' | 'dark' }) => (
  <div className="space-y-3">
    {league.schedule.length > 0 ? league.schedule.map((match) => (
      <div key={match.id} className={`p-4 rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{match.date}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50'}`}>{match.time}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className={`flex-1 text-right font-black italic text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{match.home}</div>
          <div className="text-slate-400 text-[10px] font-black italic">VS</div>
          <div className={`flex-1 text-left font-black italic text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{match.away}</div>
        </div>
      </div>
    )) : (
      <div className="text-center py-12 text-slate-400 italic font-medium">No matches on the horizon.</div>
    )}
  </div>
);

const ScorersTab = ({ league, theme }: { league: League, theme: 'light' | 'dark' }) => (
  <div className={`rounded-xl shadow-sm overflow-hidden border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
    <table className="w-full border-collapse">
      <thead>
        <tr className={`border-b ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Player</th>
          <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider w-16">Goals</th>
        </tr>
      </thead>
      <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
        {league.topScorers.length > 0 ? league.topScorers.map((scorer) => (
          <tr key={scorer.id}>
            <td className="px-4 py-3">
              <div className={`text-sm font-black italic uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{scorer.name}</div>
              <div className={`text-[10px] font-bold ${theme === 'dark' ? 'text-yellow-500/80' : 'text-red-600'}`}>{scorer.team}</div>
            </td>
            <td className={`px-4 py-3 text-right text-sm font-mono font-black ${theme === 'dark' ? 'text-yellow-500' : 'text-green-600'}`}>{scorer.goals}</td>
          </tr>
        )) : (
          <tr>
            <td colSpan={2} className="text-center py-12 text-slate-400 italic">No scorers data yet.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default function SportsApp() {
  const [view, setView] = useState<'home' | 'leagues' | 'league-detail'>('home');
  const [selectedSport, setSelectedSport] = useState<SportData | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [activeTab, setActiveTab] = useState<'standings' | 'schedule' | 'scorers'>('standings');
  const [liveStandings, setLiveStandings] = useState<Team[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.title = "SPORTSKN";
  }, []);

  const fetchLeagueData = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      // Direct fetch from Google Sheets (published CSVs support CORS natively)
      const response = await fetch(`${url}&cb=${Date.now()}`);
      if (!response.ok) throw new Error("Google Sheets connection failed.");
      const csvData = await response.text();

      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const keys = Object.keys(results.data[0] as any);
            const teamKey = keys.find(k => k.toLowerCase().includes('team')) || 'Team';
            const ptsKey = keys.find(k => k.toLowerCase() === 'pts' || k.toLowerCase().includes('points')) || 'PTS';

            const mappedData: Team[] = results.data
              .filter((row: any) => row[teamKey])
              .map((row: any, index: number) => ({
                id: `live-${index}`,
                name: String(row[teamKey]),
                played: parseInt(row['P'] || row['Played'] || 0),
                wins: parseInt(row['W'] || row['Wins'] || 0),
                draws: parseInt(row['D'] || row['Draws'] || 0),
                losses: parseInt(row['L'] || row['Losses'] || 0),
                points: parseInt(row[ptsKey] || 0)
              }));
            setLiveStandings(mappedData);
            setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
          setLoading(false);
        }
      });
    } catch (err) {
      setError("Unable to sync live data. Please check your connection.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'league-detail' && selectedLeague?.csvUrl) {
      fetchLeagueData(selectedLeague.csvUrl);
    } else {
      setLiveStandings(null);
      setLastUpdated(null);
    }
  }, [view, selectedLeague]);

  const goBack = () => {
    if (view === 'league-detail') setView('leagues');
    else if (view === 'leagues') setView('home');
  };

  return (
    <div className={`min-h-screen font-sans pb-12 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Visual Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[120px] rounded-full opacity-20 ${theme === 'dark' ? 'bg-green-600' : 'bg-green-500'}`}></div>
        <div className={`absolute bottom-0 left-0 w-64 h-64 blur-[120px] rounded-full opacity-10 ${theme === 'dark' ? 'bg-red-600' : 'bg-red-500'}`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-[150px] rounded-full opacity-5 ${theme === 'dark' ? 'bg-yellow-500' : 'bg-yellow-400'}`}></div>
      </div>

      <header className={`relative pt-16 pb-8 px-6 sticky top-0 z-20 backdrop-blur-md border-b transition-all overflow-hidden ${theme === 'dark' ? 'bg-slate-950/90 border-white/5 shadow-2xl shadow-black' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
        {/* Flag-themed Banner Accent */}
        <div className="absolute top-0 left-0 w-full h-1 flex">
          <div className="flex-1 bg-green-600" />
          <div className="w-4 bg-yellow-400" />
          <div className="w-12 bg-black" />
          <div className="w-4 bg-yellow-400" />
          <div className="flex-1 bg-red-600" />
        </div>

        <div className="max-w-md mx-auto relative">
          <div className="flex justify-between items-center mb-6 min-h-[32px]">
            <div className="flex-1">
              <AnimatePresence>
                {view !== 'home' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <BackButton onClick={goBack} theme={theme} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className={`p-2 rounded-full border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
          
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none flex items-center">
            <span className={`bg-clip-text text-transparent bg-gradient-to-r from-green-600 ${theme === 'dark' ? 'to-white' : 'to-green-400'}`}>Sport</span>
            <span className="relative">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 ${theme === 'dark' ? 'via-white' : 'via-black'} to-red-600 pr-6`}>Skn</span>
            </span>
          </h1>
          {view === 'league-detail' && (
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-2 ${theme === 'dark' ? 'text-green-500' : 'text-red-600'}`}>{selectedLeague?.name}</p>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-10 relative z-10">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-2 gap-4">
              {SPORTS_DATA.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => { setSelectedSport(sport); setView('leagues'); }}
                  className={`p-8 rounded-[2.5rem] border flex flex-col items-center gap-4 transition-all active:scale-95 group ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:border-green-500/30'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${theme === 'dark' ? 'bg-white/5 text-yellow-400' : 'bg-slate-50 text-green-600'}`}>
                    <sport.icon className="w-7 h-7" />
                  </div>
                  <span className="font-black italic uppercase text-xs tracking-widest">{sport.id}</span>
                </button>
              ))}
            </motion.div>
          )}

          {view === 'leagues' && (
            <motion.div key="leagues" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {selectedSport?.leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => { setSelectedLeague(league); setView('league-detail'); setActiveTab('standings'); }}
                  className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] group ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-yellow-500/40' : 'bg-white border-slate-200 shadow-lg hover:border-green-500/30'}`}
                >
                  <span className="font-black italic uppercase text-sm tracking-widest">{league.name}</span>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </motion.div>
          )}

          {view === 'league-detail' && selectedLeague && (
            <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className={`flex p-1 rounded-2xl mb-8 border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-slate-200 border-slate-300 shadow-inner'}`}>
                {['standings', 'schedule', 'scorers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-green-600 text-white shadow-lg italic scale-100' : 'text-slate-500 hover:text-slate-400 scale-95'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Live Syncing...</p>
                </div>
              ) : error ? (
                <div className="text-center p-10 bg-white/5 rounded-3xl border border-red-500/20">
                  <p className="text-sm font-bold mb-4">{error}</p>
                  <button onClick={() => selectedLeague.csvUrl && fetchLeagueData(selectedLeague.csvUrl)} className="bg-green-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase italic tracking-widest shadow-lg">Retry Sync</button>
                </div>
              ) : (
                <div className="pb-10">
                  {activeTab === 'standings' && <StandingsTab league={selectedLeague} liveStandings={liveStandings} lastUpdated={lastUpdated} isLoading={loading} theme={theme} />}
                  {activeTab === 'schedule' && <ScheduleTab league={selectedLeague} theme={theme} />}
                  {activeTab === 'scorers' && <ScorersTab league={selectedLeague} theme={theme} />}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}