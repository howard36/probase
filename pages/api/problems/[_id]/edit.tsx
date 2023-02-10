import { updateOne } from '@/utils/mongodb';

export default function handler(req, res) {
  const { _id } = req.query;
  console.log(_id);

  if (req.method === 'POST') {
    // Process a POST request
    const { title, statement, subject, answer, solution } = req.body;

    updateOne('problems', {
      "filter": { _id: { $oid: _id } },
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

