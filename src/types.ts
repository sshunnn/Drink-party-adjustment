export type VoteType = 'yes' | 'maybe' | 'no' | null;

export interface VoteRecord {
  id: string; // voter ID
  name: string; // voter name
  dateVotes: Record<string, VoteType>; // date ID -> vote
  locationVotes: Record<string, VoteType>; // location ID -> vote
}

export interface Candidate {
  id: string;
  name: string; // e.g. "2023/10/25 19:00~" or "Izakaya A"
}

export interface EventData {
  dates: Candidate[];
  locations: Candidate[];
  participants: Candidate[];
  votes: VoteRecord[];
}
