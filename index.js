const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 4000


app.use(cors());
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rfymji.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const classCollection = client.db('myYogaDb').collection('classes');
    const instructorCollections = client.db('myYogaDb').collection('instructors');



    // show 6 cards classes api
    app.get('/classes', async(req, res) => {
      const query = {};
      const options = {
        // sort returned documents in ascending order by title (A->Z)
        sort: { "studentNumber": -1 },
      };
      const result = await classCollection.find(query, options).toArray();
      res.send(result);
    })



    // all instructors get api for Instructors Page
    app.get('/instructors', async (req, res) => {
      const result = await instructorCollections.find().toArray();
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('summer server is running')
})

app.listen(port, () => {
    console.log(`summer server is running on port: ${port}`)
})