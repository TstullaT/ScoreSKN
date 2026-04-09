import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Trophy, Calendar, Users, ChevronRight, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { SPORTS_DATA, SportType, League, SportData, Team } from "./types";

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
  // If this is a live league (has csvUrl) and we have an empty array (meaning fetch finished but no data)
  // we show a message instead of falling back to static data.
  if (league.csvUrl && liveStandings && liveStandings.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No live standings data available at the moment.</p>
        <p className="text-slate-400 text-xs mt-1">Please check back later or contact the administrator.</p>
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
              <tr 
                key={team.id} 
                className={`
                  ${(league.id === 'd1' ? i < 2 : i < 4) ? "border-l-4 border-l-green-500" : 
                    (league.id === 'pl' && (i === 8 || i === 9)) ? "border-l-4 border-l-red-500" : 
                    "border-l-4 border-l-transparent"}
                `}
              >
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

  const fetchLeagueData = async (url: string) => {
    setLoading(true);
    setError(null);
    setLastUpdated(null);
    try {
      // Use a public CORS proxy to avoid issues on static deployments like Netlify
      const PROXY_URL = "https://api.allorigins.win/raw?url=";
      const response = await fetch(PROXY_URL + encodeURIComponent(SHEET_URL));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data (Status: ${response.status})`);
      }
      
      const csvData = await response.text();
      console.log("Raw CSV Data (first 200 chars):", csvData.substring(0, 200));
      
      if (!csvData || csvData.trim().length === 0) {
        throw new Error("The data source returned no content.");
      }

      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("PapaParse Results:", results);
          if (results.data && results.data.length > 0) {
            // Find the actual keys in the CSV to handle different naming/casing
            const firstRow = results.data[0] as any;
            const keys = Object.keys(firstRow);
            
            // Log keys for debugging
            console.log("Detected CSV Keys:", keys);

            // Try to find "Last Updated" date in headers or rows
            let foundDate: string | null = null;
            
            // Check if any header contains the date info
            const dateHeader = keys.find(k => k.toLowerCase().includes('updated') || k.toLowerCase().includes('date'));
            if (dateHeader && (dateHeader.toLowerCase().includes('last') || dateHeader.includes(':'))) {
              const parts = dateHeader.split(':');
              foundDate = parts.length > 1 ? parts[1].trim() : dateHeader.replace(/last updated/i, '').trim();
            }

            // If not in headers, check the first few rows for a standalone date cell
            if (!foundDate) {
              for (const row of results.data.slice(0, 5) as any[]) {
                for (const val of Object.values(row)) {
                  const s = String(val);
                  if (s.toLowerCase().includes('updated')) {
                    const parts = s.split(':');
                    foundDate = parts.length > 1 ? parts[1].trim() : s.replace(/last updated/i, '').trim();
                    break;
                  }
                }
                if (foundDate) break;
              }
            }
            
            if (foundDate) setLastUpdated(foundDate);

            const teamKey = keys.find(k => {
              const clean = k.toLowerCase().trim();
              return clean.includes('team') || clean.includes('club') || clean === 't' || clean.includes('name');
            });
            
            const ptsKey = keys.find(k => {
              const clean = k.toLowerCase().trim();
              return clean === 'pts' || clean === 'points' || (clean.includes('pts') && !clean.includes('pts/')) || clean.includes('points');
            });
            
            const playedKey = keys.find(k => {
              const clean = k.toLowerCase().trim();
              return clean === 'p' || clean === 'played' || clean === 'gp' || clean === 'mp' || clean === 'm';
            });
            
            const winsKey = keys.find(k => {
              const clean = k.toLowerCase().trim();
              return clean === 'w' || clean === 'wins' || clean === 'won';
            });
            
            const drawsKey = keys.find(k => {
              const clean = k.toLowerCase().trim();
              return clean === 'd' || clean === 'draws' || clean === 'drawn';
            });
            
            const lossesKey = keys.find(k => {
              const clean = k.toLowerCase().trim();
              return clean === 'l' || clean === 'losses' || clean === 'lost';
            });

            const mappedData: Team[] = results.data
              .filter((row: any) => teamKey && row[teamKey] && String(row[teamKey]).trim().length > 0)
              .map((row: any, index: number) => {
                const parseVal = (key?: string) => {
                  if (!key) return undefined;
                  const val = String(row[key]).trim();
                  const num = parseInt(val.replace(/[^0-9-]/g, ''));
                  return isNaN(num) ? 0 : num;
                };

                return {
                  id: `live-${index}`,
                  name: String(row[teamKey!]).trim(),
                  played: parseVal(playedKey),
                  wins: parseVal(winsKey),
                  draws: parseVal(drawsKey),
                  losses: parseVal(lossesKey),
                  points: parseVal(ptsKey) || 0
                };
              });
            
            console.log("Mapped Data:", mappedData);
            setLiveStandings(mappedData);
          } else {
            console.warn("No data rows found in CSV");
            setLiveStandings([]);
          }
          setLoading(false);
        },
        error: (err: any) => {
          console.error("CSV Parsing Error:", err);
          setError("Failed to process the data format.");
          setLoading(false);
        }
      });
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch live data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'league-detail' && selectedLeague?.csvUrl) {
      fetchLeagueData(selectedLeague.csvUrl);
    } else {
      setLiveStandings(null);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-blue-900 text-white pt-12 pb-6 px-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {view !== 'home' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <BackButton onClick={goBack} />
              </motion.div>
            )}
          </AnimatePresence>
          
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">
            {view === 'home' ? 'SPORTSKN' : selectedSport?.id}
          </h1>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">
            {view === 'home' ? 'Select your sport' : view === 'leagues' ? 'Choose a league' : selectedLeague?.name}
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-8">
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
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-4 group hover:border-blue-500 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <sport.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{sport.id}</span>
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
              {selectedSport?.orgName && (
                <div className="flex bg-slate-200 p-1 rounded-xl mb-4">
                  <button className="flex-1 py-2.5 bg-white text-blue-600 rounded-lg font-bold text-[10px] shadow-sm uppercase tracking-widest">
                    {selectedSport.orgName}
                  </button>
                </div>
              )}
              {selectedSport?.leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => handleLeagueClick(league)}
                  className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-blue-500 transition-all active:scale-[0.98]"
                >
                  <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{league.name}</span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
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
              <div className="flex bg-slate-200 p-1 rounded-xl mb-6">
                <button 
                  onClick={() => setActiveTab('standings')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'standings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Standings
                </button>
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'schedule' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule
                </button>
                <button 
                  onClick={() => setActiveTab('scorers')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'scorers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Scorers
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-blue-600 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="font-bold text-sm uppercase tracking-widest">Loading Live Data...</span>
                    </div>
                  ) : error ? (
                    <div className="bg-white p-12 rounded-xl border border-red-100 text-center shadow-sm">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="w-6 h-6 text-red-400" />
                      </div>
                      <p className="text-red-600 font-bold uppercase tracking-tight">Connection Error</p>
                      <p className="text-slate-500 text-sm mt-1 mb-6">We couldn't reach the live data source. This might be due to a network issue or an invalid URL.</p>
                      <button 
                        onClick={() => selectedLeague?.csvUrl && fetchLeagueData(selectedLeague.csvUrl)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-md active:scale-95"
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
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
