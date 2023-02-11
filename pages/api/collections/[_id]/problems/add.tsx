import { insertOne } from '@/utils/mongodb';

export default function handler(req, res) {
  const { _id } = req.query;

  if (req.method === 'POST') {
    // Process a POST request
    const { title, statement, subject, answer, solution } = req.body;
    // console.log(_id);

    // TODO: assign PID based on existing problems
    const pid = 'G1';
    const problem = {
      pid,
      title,
      subject,
      statement,
      answer,
      solutions: [solution],
      authors: [],
      collection_id: { $oid: _id },
    };
    // console.log(problem);
    insertOne("problems", { document: problem });
  } else {
    // Handle any other HTTP method
  }
}

