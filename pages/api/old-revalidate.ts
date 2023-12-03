import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  // Check for secret to confirm this is a valid request
  // if (secret !== process.env.MY_SECRET_TOKEN) {
  //   return res.status(401).json({ message: 'Invalid token' })
  // }
  if (typeof path !== "string") {
    return res.status(400).json({ message: 'Missing path' })
  }
 
  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    console.log({path})
    await res.revalidate(path)
    return res.json({ revalidated: true })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    console.error(err)
    return res.status(500).send('Error revalidating')
  }
}
