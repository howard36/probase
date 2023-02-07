import { insertOne, findOne } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export default function handler(req, res) {
  // console.log(req);
  const { cid } = req.query;
  if (req.method === 'POST') {
    // Process a POST request
    const { title, statement, subject, answer, solution } = req.body;

    findOne('collections', {
      filter: { cid },
      projection: { '_id': 1 },
    }).then(collection => {
      const id = new ObjectId(collection._id)
      // TODO: assign PID based on existing problems
      const pid = 'A3';
      const problem = {
        pid,
        title,
        subject,
        statement,
        answer,
        solutions: [solution],
        authors: [],
        collection_id: id,
      };
      console.log(problem);
      insertOne("problems", {
        document: problem,
      }).then(_ => console.log("done"));
    })
  } else {
    // Handle any other HTTP method
  }
}

