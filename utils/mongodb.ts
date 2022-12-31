const CLUSTER_NAME = process.env.MONGODB_CLUSTER_NAME;
const DB_NAME = process.env.MONGODB_DB_NAME;
const APP_ID = process.env.MONGODB_APP_ID;
const API_KEY = process.env.MONGODB_API_KEY;

if (!CLUSTER_NAME || !DB_NAME || !APP_ID || !API_KEY) {
  throw new Error(
    'Please define the MONGODB environment variables inside .env.local'
  )
}

const baseURL = `https://data.mongodb-api.com/app/${APP_ID}/endpoint/data/v1`;

async function findOne(collection: string, options: object = {}): Promise<any> {
  const endpoint = `${baseURL}/action/findOne`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
    body: JSON.stringify({
      'dataSource': CLUSTER_NAME,
      'database': DB_NAME,
      'collection': collection,
      ...options,
    })
  });

  const data = await response.json();
  return data.document;
}

async function find(collection: string, options: object = {}): Promise<any[]> {
  const endpoint = `${baseURL}/action/find`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
    body: JSON.stringify({
      'dataSource': CLUSTER_NAME,
      'database': DB_NAME,
      'collection': collection,
      ...options,
    })
  });

  const data = await response.json();
  return data.documents;
}

async function aggregate(collection: string, pipeline: object[]): Promise<any[]> {
  const endpoint = `${baseURL}/action/aggregate`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
    body: JSON.stringify({
      'dataSource': CLUSTER_NAME,
      'database': DB_NAME,
      'collection': collection,
      'pipeline': pipeline,
    })
  });

  const data = await response.json();
  return data.documents;
}


export { findOne, find, aggregate };
