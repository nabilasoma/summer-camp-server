const express = require('express')
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000


app.use(cors());
app.use(express.json())



const verifyJWT = async(req, res, next) => {
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true, message: 'Unauthorized User'})
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.SECRET_TOKEN, (error, decoded) => {
    if(error){
      return res.status(403).send({error: true, message: 'Unauthorized User'})
    }
    req.decoded = decoded;
    next();
  })
}


const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-qizxwwv-shard-00-00.5rfymji.mongodb.net:27017,ac-qizxwwv-shard-00-01.5rfymji.mongodb.net:27017,ac-qizxwwv-shard-00-02.5rfymji.mongodb.net:27017/?ssl=true&replicaSet=atlas-14dsd9-shard-0&authSource=admin&retryWrites=true&w=majority`

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5rfymji.mongodb.net/?retryWrites=true&w=majority`;

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
    const addAClassCollection = client.db('myYogaDb').collection('addaclasses');
    const myClassCollection = client.db('myYogaDb').collection('myclasses');
    


    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_TOKEN, {expiresIn: '72h'})
      res.send({token})
    })



    // user related api
    app.post('/users', async(req, res) => {
      const user = req.body;
      console.log(user)
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        return res.send({message: 'already exist'})
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });


    app.patch('/users/admin/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result)
    });


    app.patch('/users/instructor/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result)
    });


    app.get('/users/admin/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const user = await userCollection.findOne(query);
      const result = {admin: user?.role === 'admin'}
      res.send(result);
    });


    app.get('/users/instructor/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const user = await userCollection.findOne(query);
      const result = { instructor: user?.role === 'instructor' }
      res.send(result);
    });


    // add a class api
    app.post('/addaclasses', async(req, res) => {
      const addclass = req.body;
      const result = await addAClassCollection.insertOne(addclass);
      res.send(result);
    });

 // My Classes Instructor api

    app.get('/addaclasses', async(req, res) => {
      const result = await addAClassCollection.find().toArray();
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
    });

    app.post('/selectedClasses', async(req, res) => {
      const item = req.body;
      console.log(item)
      const result = await selectedClassesCollection.insertOne(item)
      res.send(result)
    });

    app.delete('/selectedClasses/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await selectedClassesCollection.deleteOne(query);
      res.send(result);
    });

   
    




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