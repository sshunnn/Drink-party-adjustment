import { useState, useEffect } from 'react';
import { Wine, Copy } from 'lucide-react';
import { EventData, Candidate, VoteRecord } from './types';
import EventCreation from './components/EventCreation';
import VotingTable from './components/VotingTable';
import ResultSummary from './components/ResultSummary';

const initialData: EventData = {
  dates: [],
  locations: [],
  participants: [],
  votes: [],
};

function App() {
  const [eventData, setEventData] = useState<EventData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  // Fetch from Vercel API
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/event');
        if (response.ok) {
          const parsed = await response.json();
          setEventData({
            dates: parsed.dates || [],
            locations: parsed.locations || [],
            participants: parsed.participants || [],
            votes: parsed.votes || [],
          });
        }
      } catch (e) {
        console.error('Failed to fetch data from API', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // Sync state changes to API
  const syncToAPI = async (newData: EventData) => {
    try {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (e) {
      console.error('Failed to save data to API', e);
    }
  };

  const updateEventData = (updater: (prev: EventData) => EventData) => {
    setEventData(prev => {
      const newData = updater(prev);
      syncToAPI(newData);
      return newData;
    });
  };

  const handleUpdateDates = (newDates: Candidate[]) => {
    updateEventData(prev => ({ ...prev, dates: newDates }));
  };

  const handleUpdateLocations = (newLocations: Candidate[]) => {
    updateEventData(prev => ({ ...prev, locations: newLocations }));
  };

  const handleUpdateParticipants = (newParticipants: Candidate[]) => {
    updateEventData(prev => ({ ...prev, participants: newParticipants }));
  };

  const handleAddVote = (vote: VoteRecord) => {
    updateEventData(prev => {
      const existingIndex = prev.votes.findIndex(v => v.id === vote.id);
      if (existingIndex >= 0) {
        const newVotes = [...prev.votes];
        newVotes[existingIndex] = vote;
        return { ...prev, votes: newVotes };
      }
      return { ...prev, votes: [...prev.votes, vote] };
    });
  };

  const handleDeleteVote = (voteId: string) => {
    updateEventData(prev => ({
      ...prev,
      votes: prev.votes.filter(v => v.id !== voteId)
    }));
  };

  const handleReset = () => {
    if (confirm('すべてのデータをリセットしますか？')) {
      updateEventData(() => initialData);
    }
  };

  const copyShareLink = () => {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url).then(() => {
      alert('参加者用リンクをコピーしました！このURLを皆さんに共有してください。');
    });
  };

  if (!isLoaded) return null;

  const hasCandidates = eventData.dates.length > 0 || eventData.locations.length > 0;

  return (
    <div className="container animate-fade-in">
      <header className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="btn-icon" style={{ background: 'var(--bg-glass)', width: '64px', height: '64px', color: 'var(--accent-gold)' }}>
            <Wine size={32} />
          </div>
        </div>
        <h1 className="title-gradient mb-2" style={{ fontSize: '2.5rem' }}>華麗なる居酒屋</h1>
        <p style={{ color: 'var(--text-secondary)' }}>飲み会日程・場所調整アプリ</p>
        {isAdmin && (
          <div className="mt-4">
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              代表者モードで編集中
            </span>
          </div>
        )}
      </header>

      <main>
        {isAdmin && (
          <EventCreation 
            dates={eventData.dates} 
            locations={eventData.locations}
            participants={eventData.participants}
            onUpdateDates={handleUpdateDates}
            onUpdateLocations={handleUpdateLocations}
            onUpdateParticipants={handleUpdateParticipants}
          />
        )}

        {!hasCandidates && !isAdmin && (
          <div className="glass-card text-center" style={{ padding: '4rem 2rem' }}>
            <Wine size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem', opacity: 0.5 }} />
            <h2 className="mb-2">準備中です</h2>
            <p style={{ color: 'var(--text-secondary)' }}>代表者が候補を設定するまでお待ちください。</p>
          </div>
        )}

        {hasCandidates && (
          <>
            <VotingTable 
              eventData={eventData}
              onAddVote={handleAddVote}
              onDeleteVote={handleDeleteVote}
            />

            {eventData.votes.length > 0 && (
              <ResultSummary eventData={eventData} />
            )}
          </>
        )}

        {isAdmin && (
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            <button onClick={copyShareLink} className="btn-primary" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>
              <Copy size={18} /> 参加者用リンクをコピー
            </button>
            {hasCandidates && (
              <button onClick={handleReset} className="btn-secondary" style={{ color: 'var(--vote-no)' }}>
                データをすべてリセット
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
