import { MongoClient, ServerApiVersion } from 'mongodb'

// Define the URI for MongoDB from environment variables or fallback to an empty string
const uri = process.env.ATLAS_URI || ''

// Create a MongoClient instance with the necessary options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

let db

// Define a function to establish a connection to MongoDB
const connectDB = async () => {
  try {
    // Connect the client to the server
    await client.connect()

    // Ping the MongoDB deployment to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )

    // Set the database instance to a specific database (e.g., 'employees')
    db = client.db('employees')

    return db // Optionally return the db instance
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
    throw err
  }
}

// Optionally, you can also export the `db` variable separately if needed
export default connectDB
