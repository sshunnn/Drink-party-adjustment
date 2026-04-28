import React, { useState, useEffect } from 'react';
import { Check, User, Trash2, Calendar, MapPin } from 'lucide-react';
import { EventData, VoteRecord, VoteType } from '../types';

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
      setLocationVotes(prev => ({ ...prev, [id]: prev[id] === vote ? null : vote }));
    }
  };

  const renderVoteIcon = (vote: VoteType) => {
    if (vote === 'yes') return '〇';
    if (vote === 'no') return '×';
    return '-';
  };

  const submitVote = () => {
    if (!voterName) {
      alert('お名前を選択してください');
      return;
    }

    const unvotedDates = eventData.dates.filter(d => dateVotes[d.id] === undefined || dateVotes[d.id] === null);
    if (unvotedDates.length > 0) {
      alert('すべての日程について、〇か×を選択してください。');
      return;
    }

    const unvotedLocations = eventData.locations.filter(l => locationVotes[l.id] === undefined || locationVotes[l.id] === null);
    if (unvotedLocations.length > 0) {
      alert('すべての場所について、〇か×を選択してください。');
      return;
    }

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
    <div className="glass-card mb-8">
      <h2 className="mb-6 flex items-center gap-2">
        投票スペース
      </h2>

      <div className="mb-8" style={{ maxWidth: '400px' }}>
        <label className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
          <User size={18} /> あなたのお名前を選択してください
        </label>
        {eventData.participants && eventData.participants.length > 0 ? (
          <select 
            className="input-field" 
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            style={{ appearance: 'auto', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            ※ 代表者が参加者を登録するまでお待ちください。
          </p>
        )}
      </div>

      {eventData.dates.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--accent-gold)' }}>
            <Calendar size={18} /> 日程の投票
          </h3>
          <div className="vote-table-container">
            <table className="vote-table">
              <thead>
                <tr>
                  <th className="sticky-col">参加者</th>
                  {eventData.dates.map(d => (
                    <th key={d.id} className="text-center">{d.name}</th>
                  ))}
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {/* Existing Votes */}
                {eventData.votes.map(vote => (
                  <tr key={vote.id}>
                    <td className="sticky-col font-medium">{vote.name}</td>
                    {eventData.dates.map(d => (
                      <td key={d.id} className="text-center">
                        <span className={`vote-btn ${vote.dateVotes[d.id] || ''}`}>
                          {renderVoteIcon(vote.dateVotes[d.id])}
                        </span>
                      </td>
                    ))}
                    <td className="text-center">
                      {myVoteIds.includes(vote.id) && (
                        <button onClick={() => onDeleteVote(vote.id)} className="btn-icon" style={{ color: 'var(--vote-no)' }} title="自分の投票を削除">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Input Row for New Vote */}
                <tr style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
                  <td className="sticky-col">
                    {voterName || <span style={{ color: 'var(--text-secondary)' }}>未選択</span>}
                  </td>
                  {eventData.dates.map(d => (
                    <td key={d.id} className="text-center">
                      <div className="flex justify-center gap-2">
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
                    </td>
                  ))}
                  <td className="text-center"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {eventData.locations.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--accent-gold)' }}>
            <MapPin size={18} /> 場所の投票
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
                {/* Existing Votes */}
                {eventData.votes.map(vote => (
                  <tr key={vote.id}>
                    <td className="sticky-col font-medium">{vote.name}</td>
                    {eventData.locations.map(l => (
                      <td key={l.id} className="text-center">
                        <span className={`vote-btn ${vote.locationVotes[l.id] || ''}`}>
                          {renderVoteIcon(vote.locationVotes[l.id])}
                        </span>
                      </td>
                    ))}
                    <td className="text-center">
                      {myVoteIds.includes(vote.id) && (
                        <button onClick={() => onDeleteVote(vote.id)} className="btn-icon" style={{ color: 'var(--vote-no)' }} title="自分の投票を削除">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Input Row for New Vote */}
                <tr style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
                  <td className="sticky-col">
                    {voterName || <span style={{ color: 'var(--text-secondary)' }}>未選択</span>}
                  </td>
                  {eventData.locations.map(l => (
                    <td key={l.id} className="text-center">
                      <div className="flex justify-center gap-2">
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
                    </td>
                  ))}
                  <td className="text-center"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button onClick={submitVote} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
          <Check size={20} /> すべての投票を確定する
        </button>
      </div>

    </div>
  );
}
