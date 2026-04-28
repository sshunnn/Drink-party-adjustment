import React, { useState } from 'react';
import { Plus, X, Calendar, MapPin, Users } from 'lucide-react';
import { Candidate } from '../types';
import { formatDateWithDay } from '../utils';

interface EventCreationProps {
  dates: Candidate[];
  locations: Candidate[];
  participants: Candidate[];
  onUpdateDates: (dates: Candidate[]) => void;
  onUpdateLocations: (locations: Candidate[]) => void;
  onUpdateParticipants: (participants: Candidate[]) => void;
}

export default function EventCreation({ dates, locations, participants, onUpdateDates, onUpdateLocations, onUpdateParticipants }: EventCreationProps) {
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newParticipant, setNewParticipant] = useState('');

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate.trim()) return;
    onUpdateDates([...dates, { id: generateId(), name: newDate.trim() }]);
    setNewDate('');
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    onUpdateLocations([...locations, { id: generateId(), name: newLocation.trim() }]);
    setNewLocation('');
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.trim()) return;
    onUpdateParticipants([...participants, { id: generateId(), name: newParticipant.trim() }]);
    setNewParticipant('');
  };

  const removeDate = (id: string) => {
    onUpdateDates(dates.filter(d => d.id !== id));
  };

  const removeLocation = (id: string) => {
    onUpdateLocations(locations.filter(l => l.id !== id));
  };

  const removeParticipant = (id: string) => {
    onUpdateParticipants(participants.filter(p => p.id !== id));
  };

  return (
    <div className="glass-card">
      <h2 className="mb-6 flex items-center gap-2">
        候補の追加
      </h2>
      
      <div className="flex-col gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Dates Section */}
        <div>
          <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            <Calendar size={18} /> 日程候補
          </h3>
          <form onSubmit={handleAddDate} className="flex gap-2 mb-4">
            <input 
              type="date" 
              className="input-field" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>
              <Plus size={20} />
            </button>
          </form>
          
          <div className="flex-col gap-2">
            {dates.map((date) => (
              <div key={date.id} className="flex justify-between items-center" style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span>{formatDateWithDay(date.name)}</span>
                <button onClick={() => removeDate(date.id)} className="btn-icon" style={{ color: 'var(--vote-no)' }}>
                  <X size={16} />
                </button>
              </div>
            ))}
            {dates.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>候補日がありません</p>}
          </div>
        </div>

        {/* Locations Section */}
        <div>
          <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            <MapPin size={18} /> お店・場所の候補
          </h3>
          <form onSubmit={handleAddLocation} className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="input-field" 
              placeholder="例: 鳥貴族 新宿店" 
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>
              <Plus size={20} />
            </button>
          </form>
          
          <div className="flex-col gap-2">
            {locations.map((loc) => (
              <div key={loc.id} className="flex justify-between items-center" style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span>{loc.name}</span>
                <button onClick={() => removeLocation(loc.id)} className="btn-icon" style={{ color: 'var(--vote-no)' }}>
                  <X size={16} />
                </button>
              </div>
            ))}
            {locations.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>候補地がありません</p>}
          </div>
        </div>

        {/* Participants Section */}
        <div>
          <h3 className="mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            <Users size={18} /> 参加予定者
          </h3>
          <form onSubmit={handleAddParticipant} className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="input-field" 
              placeholder="例: 山田 太郎" 
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>
              <Plus size={20} />
            </button>
          </form>
          
          <div className="flex-col gap-2">
            {participants.map((p) => (
              <div key={p.id} className="flex justify-between items-center" style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span>{p.name}</span>
                <button onClick={() => removeParticipant(p.id)} className="btn-icon" style={{ color: 'var(--vote-no)' }}>
                  <X size={16} />
                </button>
              </div>
            ))}
            {participants.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>参加者がいません</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
