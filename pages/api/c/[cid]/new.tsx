export default function handler(req, res) {
  const { cid } = req.query;
  if (req.method === 'POST') {
    // Process a POST request
    const title = req.body.title;
    const statement = req.body.statement;
    const problem = {
      title,
      statement,
    };
    insertOne("problems", problem);
  } else {
    // Handle any other HTTP method
  }
}

