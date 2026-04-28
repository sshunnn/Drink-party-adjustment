import { useState, useEffect } from 'react';
import { Check, Trash2, Calendar, MapPin, ClipboardList } from 'lucide-react';
import { EventData, VoteRecord, VoteType } from '../types';
import { formatDateWithDay } from '../utils';

interface VotingTableProps {
  eventData: EventData;
  onAddVote: (vote: VoteRecord) => void;
  onDeleteVote: (voteId: string) => void;
}

export default function VotingTable({ eventData, onAddVote, onDeleteVote }: VotingTableProps) {
  const [voterName, setVoterName] = useState('');
  const [dateVotes, setDateVotes] = useState<Record<string, VoteType>>({});
  const [locationVotes, setLocationVotes] = useState<Record<string, VoteType>>({});
  const [myVoteIds, setMyVoteIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('my_vote_ids');
    if (saved) {
      try {
        setMyVoteIds(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveMyVoteId = (id: string) => {
    const updated = [...myVoteIds, id];
    setMyVoteIds(updated);
    localStorage.setItem('my_vote_ids', JSON.stringify(updated));
  };

  const setVote = (type: 'date' | 'location', id: string, vote: VoteType) => {
    if (type === 'date') {
      setDateVotes(prev => ({ ...prev, [id]: prev[id] === vote ? null : vote }));
    } else {
      if (vote === 'yes') {
        const yesCount = Object.values(locationVotes).filter(v => v === 'yes').length;
        if (locationVotes[id] !== 'yes' && yesCount >= 2) {
          alert('場所で「〇」をつけられるのは最大2つまでです。');
          return;
        }
      }
      setLocationVotes(prev => ({ ...prev, [id]: prev[id] === vote ? null : vote }));
    }
  };

  const unvotedDatesCount = eventData.dates.filter(d => dateVotes[d.id] === undefined || dateVotes[d.id] === null).length;
  const unvotedLocationsCount = eventData.locations.filter(l => locationVotes[l.id] === undefined || locationVotes[l.id] === null).length;
  
  // Step completion logic
  const isStep1Done = voterName !== '';
  const isStep2Done = isStep1Done && unvotedDatesCount === 0;
  const isStep3Done = isStep2Done && unvotedLocationsCount === 0;
  
  // Submit is allowed if all configured sections are voted
  const canSubmit = (eventData.dates.length === 0 || isStep2Done) && (eventData.locations.length === 0 || isStep3Done) && isStep1Done;

  const renderVoteIcon = (vote: VoteType) => {
    if (vote === 'yes') return '〇';
    if (vote === 'no') return '×';
    return '-';
  };

  const submitVote = () => {
    if (!canSubmit) return;

    const voteRecord: VoteRecord = {
      id: Math.random().toString(36).substring(2, 9),
      name: voterName,
      dateVotes: { ...dateVotes },
      locationVotes: { ...locationVotes }
    };

    onAddVote(voteRecord);
    saveMyVoteId(voteRecord.id);
    
    // Reset form
    setVoterName('');
    setDateVotes({});
    setLocationVotes({});
  };

  return (
    <>
      {/* 1. あなたの投票フォーム (Wizard) */}
      <div className="glass-card mb-8">
        <h2 className="mb-6 flex items-center gap-2">
          <Check size={24} style={{ color: 'var(--accent-gold)' }} />
          あなたの希望を入力
        </h2>

        {/* STEP 1: 名前 */}
        <div className="step-section">
          <div className="step-header">
            <span className="step-number">1</span>
            お名前を選択してください
            {isStep1Done && <Check size={20} style={{ color: 'var(--vote-yes)', marginLeft: 'auto' }} />}
          </div>
          {eventData.participants && eventData.participants.length > 0 ? (
            <select 
              className="input-field" 
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              style={{ appearance: 'auto', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', maxWidth: '400px' }}
            >
              <option value="">名前を選択してください</option>
              {eventData.participants.map(p => {
                const isVoted = eventData.votes.some(v => v.name === p.name);
                return (
                  <option key={p.id} value={p.name} disabled={isVoted}>
                    {p.name} {isVoted ? '(投票済)' : ''}
                  </option>
                );
              })}
            </select>
          ) : (
            <p style={{ color: 'var(--vote-no)', fontSize: '0.9rem' }}>
              ※ 代表者が参加者を登録するまでお待ちください。
            </p>
          )}
        </div>

        {/* STEP 2: 日程 */}
        {eventData.dates.length > 0 && (
          <div className={`step-section ${!isStep1Done ? 'step-disabled' : ''}`}>
            <div className="step-header">
              <span className="step-number">2</span>
              日程の希望をすべて選んでください
              {isStep2Done && <Check size={20} style={{ color: 'var(--vote-yes)', marginLeft: 'auto' }} />}
            </div>
            <div className="flex-col gap-2">
              {eventData.dates.map(d => (
                <div key={d.id} className="choice-card">
                  <span className="choice-card-title">{formatDateWithDay(d.name)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setVote('date', d.id, 'yes')}
                      className={`vote-btn ${dateVotes[d.id] === 'yes' ? 'yes' : ''}`}
                    >
                      〇
                    </button>
                    <button 
                      onClick={() => setVote('date', d.id, 'no')}
                      className={`vote-btn ${dateVotes[d.id] === 'no' ? 'no' : ''}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {unvotedDatesCount > 0 && isStep1Done && (
              <p className="mt-4 text-center" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                残り {unvotedDatesCount} 件選択してください
              </p>
            )}
          </div>
        )}

        {/* STEP 3: 場所 */}
        {eventData.locations.length > 0 && (
          <div className={`step-section ${!isStep2Done ? 'step-disabled' : ''}`}>
            <div className="step-header">
              <span className="step-number">3</span>
              場所の希望を選んでください (最大2つまで〇)
              {isStep3Done && <Check size={20} style={{ color: 'var(--vote-yes)', marginLeft: 'auto' }} />}
            </div>
            <div className="flex-col gap-2">
              {eventData.locations.map(l => (
                <div key={l.id} className="choice-card">
                  <span className="choice-card-title">{l.name}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setVote('location', l.id, 'yes')}
                      className={`vote-btn ${locationVotes[l.id] === 'yes' ? 'yes' : ''}`}
                    >
                      〇
                    </button>
                    <button 
                      onClick={() => setVote('location', l.id, 'no')}
                      className={`vote-btn ${locationVotes[l.id] === 'no' ? 'no' : ''}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Submit */}
        <div className={`flex justify-center mt-8 ${!canSubmit ? 'step-disabled' : ''}`}>
          <button 
            onClick={submitVote} 
            className="btn-primary" 
            disabled={!canSubmit}
            style={{ 
              padding: '1.25rem 4rem', 
              fontSize: '1.2rem',
              boxShadow: canSubmit ? '0 0 20px rgba(245, 158, 11, 0.6)' : 'none'
            }}
          >
            <Check size={24} /> この内容で投票を確定する
          </button>
        </div>
      </div>

      {/* 2. みんなの投票状況 (Results Table) */}
      {eventData.votes.length > 0 && (
        <div className="glass-card mb-8">
          <h2 className="mb-6 flex items-center gap-2">
            <ClipboardList size={24} style={{ color: 'var(--text-secondary)' }} />
            みんなの投票状況
          </h2>

          {eventData.dates.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                <Calendar size={18} /> 日程
              </h3>
              <div className="vote-table-container">
                <table className="vote-table">
                  <thead>
                    <tr>
                      <th className="sticky-col">参加者</th>
                      {eventData.dates.map(d => (
                        <th key={d.id} className="text-center">{formatDateWithDay(d.name)}</th>
                      ))}
                      <th className="text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventData.votes.map(vote => (
                      <tr key={vote.id}>
                        <td className="sticky-col font-medium">{vote.name}</td>
                        {eventData.dates.map(d => (
                          <td key={d.id} className="text-center">
                            <span className={`vote-btn ${vote.dateVotes[d.id] || ''}`} style={{ width: '36px', height: '36px', fontSize: '1rem', pointerEvents: 'none' }}>
                              {renderVoteIcon(vote.dateVotes[d.id])}
                            </span>
                          </td>
                        ))}
                        <td className="text-center">
                          {myVoteIds.includes(vote.id) && (
                            <button onClick={() => onDeleteVote(vote.id)} className="btn-icon" style={{ color: 'var(--vote-no)' }} title="自分の投票をやり直す">
                              <Trash2 size={16} /> やり直す
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {eventData.locations.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                <MapPin size={18} /> 場所
              </h3>
              <div className="vote-table-container">
                <table className="vote-table">
                  <thead>
                    <tr>
                      <th className="sticky-col">参加者</th>
                      {eventData.locations.map(l => (
                        <th key={l.id} className="text-center">{l.name}</th>
                      ))}
                      <th className="text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventData.votes.map(vote => (
                      <tr key={vote.id}>
                        <td className="sticky-col font-medium">{vote.name}</td>
                        {eventData.locations.map(l => (
                          <td key={l.id} className="text-center">
                            <span className={`vote-btn ${vote.locationVotes[l.id] || ''}`} style={{ width: '36px', height: '36px', fontSize: '1rem', pointerEvents: 'none' }}>
                              {renderVoteIcon(vote.locationVotes[l.id])}
                            </span>
                          </td>
                        ))}
                        <td className="text-center">
                          {myVoteIds.includes(vote.id) && (
                            <button onClick={() => onDeleteVote(vote.id)} className="btn-icon" style={{ color: 'var(--vote-no)' }} title="自分の投票をやり直す">
                              <Trash2 size={16} /> やり直す
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
