import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DBNAME = process.env.MONGODB_DBNAME

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}
if (!MONGODB_DBNAME) {
  throw new Error(
    'Please define the MONGODB_DBNAME environment variable inside .env.local'
  )
}


/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { db: null, promise: null }
}

async function dbConnect() {
  if (cached.db) {
    console.log("Already cached, returning")
    return cached.db
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    console.log("Constructing MongoClient")
    let client = new MongoClient(MONGODB_URI, opts)
    console.log("Making promise")
    cached.promise = client.connect()
    console.log("Made promise")
  }

  try {
    console.log("about to await promise")
    let conn = await cached.promise
    console.log("awaited promise")
    cached.db = await conn.db(MONGODB_DBNAME)
    console.log("set cached.db")
  } catch (e) {
    console.log("ERROR")
    cached.promise = null
    console.log(e)
    throw e
  }

  console.log("Returning")
  return cached.db
}

export default dbConnect

