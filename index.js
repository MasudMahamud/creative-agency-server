const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
// const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n50q4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'))
app.use(fileUpload());

client.connect(err => {
  const serviceCollection = client.db("creativeAgency").collection("service");
  const orderCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("review");
  const adminCollection = client.db("creativeAgency").collection("admin");

  //service process 
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
    serviceCollection.insertOne({ name, description, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/allService', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  //end--->service process

  //review
  app.post('/addReview', (req, res) => {

    const name = req.body.name;
    const designation = req.body.name;
    const description = req.body.description;

    reviewCollection.insertOne({ name, designation, description })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/allReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
  //end--->review

  //order process here
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/uniqueOrder', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/allOrder', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
  //end--->order process

  //addAdmin
  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/allAdmin', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  //end---> addAdmin

  //admin_dashboard_open
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0)
      })
  })
  //end

});


app.get('/', (req, res) => {
  res.send('Hello World! I am Working')
})

app.listen(process.env.PORT || 4000);