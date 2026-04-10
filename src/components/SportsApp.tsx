import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Trophy, Calendar, Users, ChevronRight, Loader2, Info, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { SPORTS_DATA, SportData, League, Team } from "../types";

// --- Sub-components ---

const BackButton = ({ onClick, theme }: { onClick: () => void, theme: 'light' | 'dark' }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1 transition-colors mb-4 group ${theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-green-600 hover:text-green-800'}`}
  >
    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
    <span className="text-sm font-medium">Back</span>
  </button>
);

const StandingsTab = ({ league, liveStandings, lastUpdated, isLoading, theme }: { league: League, liveStandings: Team[] | null, lastUpdated: string | null, isLoading: boolean, theme: 'light' | 'dark' }) => {
  // If no live data and no hardcoded data, show empty
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
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-900/40 backdrop-blur-xl border-white/20' : 'bg-white border-slate-200'} rounded-2xl shadow-2xl overflow-hidden border relative group`}>
      {/* Glowing border effect */}
      <div className={`absolute inset-0 border rounded-2xl pointer-events-none transition-colors duration-500 ${theme === 'dark' ? 'border-blue-500/20 group-hover:border-blue-500/40' : 'border-transparent group-hover:border-blue-500/10'}`} />
      
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
          <motion.tbody 
            className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {sorted.map((team, i) => {
              const rank = i + 1;
              let statusColor = "border-l-transparent";
              
              // Custom Logic based on League Name from types.ts
              if (league.name.includes("Premier")) {
                if (rank <= 4) statusColor = "border-l-green-500";
              } else if (league.name.includes("Division 1")) {
                if (rank <= 2) statusColor = "border-l-green-500";
              }

              return (
                <motion.tr 
                  key={team.id} 
                  variants={itemVariants}
                  className={`
                    transition-colors border-l-4 ${statusColor}
                    ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
                  `}
                >
                  <td className="px-3 py-4 text-xs font-black text-slate-500">{rank}</td>
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
            <span>{isLoading ? 'Syncing...' : 'Data Stable'}</span>
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
      <div key={match.id} className={`p-4 rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{match.date}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${theme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50'}`}>{match.time}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className={`flex-1 text-right font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{match.home}</div>
          <div className="text-slate-300 font-black italic">VS</div>
          <div className={`flex-1 text-left font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{match.away}</div>
        </div>
      </div>
    )) : (
      <div className="text-center py-12 text-slate-400 italic">No upcoming matches scheduled.</div>
    )}
  </div>
);

const ScorersTab = ({ league, theme }: { league: League, theme: 'light' | 'dark' }) => (
  <div className={`rounded-xl shadow-sm overflow-hidden border ${theme === 'dark' ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200'}`}>
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
              <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{scorer.name}</div>
              <div className="text-[10px] text-slate-400 font-medium">{scorer.team}</div>
            </td>
            <td className={`px-4 py-3 text-right text-sm font-mono font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-green-600'}`}>{scorer.goals}</td>
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

// --- Main Screens ---

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

  const fetchLeagueData = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use a public CORS proxy to avoid issues on static deployments like Netlify
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&cb=${Date.now()}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error("Fetch failed");
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
      setError("Unable to sync live data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'league-detail') {
      if (selectedLeague?.csvUrl) {
        fetchLeagueData(selectedLeague.csvUrl);
      } else {
        // Clear live standings if the league has no live URL (like Under 13)
        setLiveStandings(null);
        setLastUpdated(null);
      }
    }
  }, [view, selectedLeague]);

  const handleSportClick = (sport: SportData) => {
    setSelectedSport(sport);
    setView('leagues');
  };

  const handleLeagueClick = (league: League) => {
    setSelectedLeague(league);
    setActiveTab('standings');
    setView('league-detail');
  };

  const goBack = () => {
    if (view === 'league-detail') setView('leagues');
    else if (view === 'leagues') setView('home');
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className={`min-h-screen font-sans pb-12 overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-500 ${theme === 'dark' ? 'bg-green-600/10' : 'bg-green-500/10'}`} />
        <div className={`absolute -top-[5%] -right-[5%] w-[40%] h-[40%] blur-[100px] rounded-full transition-colors duration-500 ${theme === 'dark' ? 'bg-red-600/10' : 'bg-red-500/10'}`} />
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[20%] blur-[80px] transition-colors duration-500 ${theme === 'dark' ? 'bg-yellow-500/5' : 'bg-yellow-500/5'}`} />
      </div>

      {/* Header */}
      <header className={`relative pt-16 pb-8 px-6 sticky top-0 z-20 backdrop-blur-md border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-b from-black to-slate-900/40 border-white/5' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-md mx-auto relative">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`absolute -top-8 right-0 p-2 rounded-full border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <AnimatePresence mode="wait">
            {view !== 'home' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <BackButton onClick={goBack} theme={theme} />
              </motion.div>
            )}
          </AnimatePresence>
          
          <h1 className={`text-5xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500 ${theme === 'dark' ? 'from-white via-yellow-400 to-white drop-shadow-[0_0_15px_rgba(252,209,22,0.3)]' : 'from-slate-900 via-green-600 to-slate-900 drop-shadow-sm'}`}>
            {view === 'home' ? 'SPORTSKN' : selectedSport?.id}
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-10 relative z-10">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              {SPORTS_DATA.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => handleSportClick(sport)}
                  className={`p-8 rounded-3xl shadow-2xl border flex flex-col items-center justify-center gap-4 group transition-all active:scale-95 relative overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-green-500/50 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-green-500/50 hover:shadow-xl'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br transition-opacity opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'from-green-500/5 to-transparent' : 'from-green-500/5 to-transparent'}`} />
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner border ${theme === 'dark' ? 'bg-white/5 border-white/5 text-yellow-500 group-hover:bg-green-600 group-hover:text-white' : 'bg-slate-50 border-slate-100 text-green-600 group-hover:bg-green-600 group-hover:text-white'}`}>
                    <sport.icon className="w-7 h-7" />
                  </div>
                  <span className={`font-black italic uppercase tracking-wider transition-colors ${theme === 'dark' ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-green-600'}`}>{sport.id}</span>
                </button>
              ))}
            </motion.div>
          )}

          {view === 'leagues' && (
            <motion.div 
              key="leagues"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {selectedSport?.leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => handleLeagueClick(league)}
                  className={`w-full p-6 rounded-2xl shadow-xl border flex items-center justify-between group transition-all active:scale-[0.98] ${theme === 'dark' ? 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-yellow-500/50 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-green-500/50 hover:shadow-lg'}`}
                >
                  <span className={`font-black italic uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-green-600'}`}>{league.name}</span>
                  <ChevronRight className={`w-5 h-5 transition-all ${theme === 'dark' ? 'text-slate-600 group-hover:text-yellow-500 group-hover:translate-x-1' : 'text-slate-300 group-hover:text-green-500 group-hover:translate-x-1'}`} />
                </button>
              ))}
            </motion.div>
          )}

          {view === 'league-detail' && selectedLeague && (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Tabs */}
              <div className={`flex p-1 rounded-2xl mb-8 border ${theme === 'dark' ? 'bg-white/5 backdrop-blur-md border-white/10' : 'bg-slate-200 border-slate-300'}`}>
                {['standings', 'schedule', 'scorers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? (theme === 'dark' ? 'bg-green-600 text-white shadow-lg italic' : 'bg-green-600 text-white shadow-sm italic') : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab === 'standings' && <Trophy className="w-3.5 h-3.5" />}
                    {tab === 'schedule' && <Calendar className="w-3.5 h-3.5" />}
                    {tab === 'scorers' && <Users className="w-3.5 h-3.5" />}
                    {tab}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className={`flex flex-col items-center justify-center py-20 gap-4 ${theme === 'dark' ? 'text-yellow-500' : 'text-green-600'}`}>
                  <div className="relative">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <div className={`absolute inset-0 blur-lg animate-pulse ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`} />
                  </div>
                  <span className="font-black text-[10px] uppercase tracking-[0.4em] italic">Fetching Data...</span>
                </div>
              ) : error ? (
                <div className={`p-12 rounded-3xl border text-center shadow-2xl ${theme === 'dark' ? 'bg-white/5 backdrop-blur-xl border-red-500/20' : 'bg-white border-red-100'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50'}`}>
                    <Info className="w-8 h-8 text-red-500" />
                  </div>
                  <p className={`font-black uppercase tracking-widest italic text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Connection Error</p>
                  <p className="text-slate-400 text-sm mt-2 mb-8 max-w-[240px] mx-auto">{error}</p>
                  <button 
                    onClick={() => selectedLeague?.csvUrl && fetchLeagueData(selectedLeague.csvUrl)}
                    className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 italic ${theme === 'dark' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'standings' && <StandingsTab league={selectedLeague} liveStandings={liveStandings} lastUpdated={lastUpdated} isLoading={loading} theme={theme} />}
                  {activeTab === 'schedule' && <ScheduleTab league={selectedLeague} theme={theme} />}
                  {activeTab === 'scorers' && <ScorersTab league={selectedLeague} theme={theme} />}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
