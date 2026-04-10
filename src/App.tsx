import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trophy, Calendar, Users, ChevronRight, Loader2, Info } from "lucide-react";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import { SPORTS_DATA, SportData, League, Team } from "./types";

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
  // If no live data and no hardcoded data, show empty
  if (!liveStandings && league.standings.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No standings available.</p>
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
                <tr key={team.id} className={`border-l-4 ${statusColor} hover:bg-slate-50 transition-colors`}>
                  <td className="px-3 py-3 text-xs font-medium text-slate-500">{rank}</td>
                  <td className="px-3 py-3 text-sm font-bold text-slate-800 truncate max-w-[120px]">{team.name}</td>
                  <td className="px-2 py-3 text-center text-xs font-medium text-slate-600">{team.played ?? '-'}</td>
                  <td className="px-2 py-3 text-center text-xs font-medium text-slate-600">{team.wins ?? '-'}</td>
                  <td className="px-2 py-3 text-center text-xs font-medium text-slate-600">{team.draws ?? '-'}</td>
                  <td className="px-2 py-3 text-center text-xs font-medium text-slate-600">{team.losses ?? '-'}</td>
                  <td className="px-3 py-3 text-right text-sm font-mono font-bold text-blue-600">{team.points}</td>
                </tr>
              );
            })}
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
    try {
      const response = await fetch(`${url}&cb=${Date.now()}`);
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
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
              {SPORTS_DATA.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => { setSelectedSport(sport); setView('leagues'); }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-4 active:scale-95 transition-all"
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
            <motion.div key="leagues" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {selectedSport?.leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => { setSelectedLeague(league); setView('league-detail'); }}
                  className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-700">{league.name}</span>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </motion.div>
          )}

          {view === 'league-detail' && selectedLeague && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex bg-slate-200 p-1 rounded-xl">
                {['standings', 'schedule', 'scorers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold capitalize ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
              ) : error ? (
                <div className="text-center p-8 bg-white rounded-xl border border-red-50">
                  <p className="text-slate-500 text-sm mb-4">{error}</p>
                  <button 
                    onClick={() => selectedLeague.csvUrl && fetchLeagueData(selectedLeague.csvUrl)}
                    className="text-blue-600 text-xs font-bold underline"
                  >
                    Retry Connection
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
