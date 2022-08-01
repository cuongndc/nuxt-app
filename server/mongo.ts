import { MongoClient } from 'mongodb'
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://cuongnd:aPOEFnnYrKjH5fnn@cluster0.qkg20.mongodb.net/comics-db', {})
export default client
