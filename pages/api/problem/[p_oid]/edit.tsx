import { updateOne } from '@/utils/mongodb';

export default function handler(req, res) {
  const { p_oid } = req.query;
  console.log(p_oid);

  if (req.method === 'POST') {
    // Process a POST request
    const { title, statement, subject, answer, solution } = req.body;

    updateOne('problems', {
      "filter": { "_id": { "$oid": p_oid } },
      "update": {
        "$set": {
          title,
          subject,
          statement,
          answer,
          solutions: [solution],
        }
      }
    })
  } else {
    // Handle any other HTTP method
  }
}

