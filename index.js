const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const approveClassesCollection = client.db('myYogaDb').collection('approveClasses');
    const selectedClassesCollection = client.db('myYogaDb').collection('selectedClasses');
    const userCollection = client.db('myYogaDb').collection('users');


    // user related api
    app.post('/users', async(req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    })



    // selected class api. when I select any class it will show in my selected page
    app.get('/selectedClasses', async(req, res) => {
      const email = req.query.email;
      if(!email){
        return res.send([]);
      }
      const query = {email: email}
      const result = await selectedClassesCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/selectedClasses', async(req, res) => {
      const item = req.body;
      console.log(item)
      const result = await selectedClassesCollection.insertOne(item)
      res.send(result)
    })

    app.delete('/selectedClasses/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await selectedClassesCollection.deleteOne(query);
      res.send(result);
    })



    // for showing all classed card in Classes Page
    app.get('/approveClasses', async(req, res) => {
      const result = await approveClassesCollection.find().toArray();
      res.send(result)
    })


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