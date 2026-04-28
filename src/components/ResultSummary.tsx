import { Trophy, CalendarCheck, MapPin } from 'lucide-react';
import { EventData } from '../types';
import { formatDateWithDay } from '../utils';

interface ResultSummaryProps {
  eventData: EventData;
}

export default function ResultSummary({ eventData }: ResultSummaryProps) {
  // Score calculation: yes = 2, maybe = 1, no = 0, null = 0
  const calculateScores = (candidates: any[], voteType: 'dateVotes' | 'locationVotes') => {
    return candidates.map(c => {
      let score = 0;
      let yesCount = 0;
      eventData.votes.forEach(v => {
        const vote = v[voteType][c.id];
        if (vote === 'yes') {
          score += 1;
          yesCount += 1;
        }
      });
      return { ...c, score, yesCount };
    }).sort((a, b) => b.score - a.score || b.yesCount - a.yesCount);
  };

  const rankedDates = calculateScores(eventData.dates, 'dateVotes');
  const rankedLocations = calculateScores(eventData.locations, 'locationVotes');

  const bestDate = rankedDates.length > 0 && rankedDates[0].score > 0 ? rankedDates[0] : null;
  const bestLocation = rankedLocations.length > 0 && rankedLocations[0].score > 0 ? rankedLocations[0] : null;

  if (!bestDate && !bestLocation) return null;

  return (
    <div className="glass-card mb-8">
      <h2 className="mb-6 flex items-center gap-2">
        <Trophy style={{ color: 'var(--accent-gold)' }} />
        現在のトップ候補
      </h2>

      <div className="flex-col gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        {bestDate && (
          <div className="best-candidate" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <h3 className="mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <CalendarCheck size={16} /> 最も人気の日程
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold-light)', marginBottom: '0.5rem' }}>
              {formatDateWithDay(bestDate.name)}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              スコア: {bestDate.score} (〇: {bestDate.yesCount}人)
            </p>
          </div>
        )}

        {bestLocation && (
          <div className="best-candidate" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <h3 className="mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <MapPin size={16} /> 最も人気のお店
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold-light)', marginBottom: '0.5rem' }}>
              {bestLocation.name}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              スコア: {bestLocation.score} (〇: {bestLocation.yesCount}人)
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
}
