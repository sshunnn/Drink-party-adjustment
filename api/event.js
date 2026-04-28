import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  const KV_KEY = 'nomikai_event_data';
  const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  try {
    if (req.method === 'GET') {
      const data = await redis.get(KV_KEY);
      // Return empty initial state if nothing exists
      const initialData = { dates: [], locations: [], participants: [], votes: [] };
      return res.status(200).json(data || initialData);
    } 
    
    if (req.method === 'POST') {
      const newData = req.body;
      await redis.set(KV_KEY, newData);
      return res.status(200).json({ success: true, data: newData });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Redis Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
