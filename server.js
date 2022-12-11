const express = require ('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');
const { entries } = require('lodash');
const { Clarifai } = require ('clarifai');
const Image = require('./image');

const db= knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1', //localhost
      user : 'postgres', //add your user name for the database here
      password : '1234', //add your correct password in here
      database : 'smart-brain' //add your database name you created here
    }
});


console.log(db.select('*').from('users').then(data => {
    console.log(data);
}));


const app = express();
app.use(bodyParser.json());
app.use(cors())



app.get('/', (req, res)=> {
    res.send(database.users)
})


app.post('/signin', (req,res)=> {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json('incorrect form submission');
    }
    db.select('email', 'hash').from('login')
      .where('email', '=', email)
      .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
          return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
              res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
          res.status(400).json('wrong credentials')
        }
      })
      .catch(err => res.status(400).json('wrong credentials'))
  }
)
app.post('/register', (req,res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        res.status(400).json('incorrect form submisssion')
    }
    const hash = bcrypt.hashSync(password);
        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
               return trx('users')
                .returning('*')
                .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()

                })
                .then(user => {
                  res.json(user[0]);
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
        })
    
    .catch(err => res.status(400).json('unable to register'))
    })
    //bcrypt.hash(password, null, null, function(err, hash) {
    //    console.log(hash);
   // });
  //  database.users.push({
    //    id:'125',
     //   name:name,
    // email:email,
     //   password:password,
      //  entries:0,
      //  joined: new Date()
    //})
    

app.get('/profile/:id', (req,res)=> {
    const  { id } = req.params;
    db.select('*').from('users').where({id})
     .then(user => {
        console.log(user)
        if(user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('not found') 
        }
        ;
    })
    .catch(err => res.status(400).json('error'))
    
 
})

app.put('/image', (req, res) => {Image.handleImage(req,res,db)})
app.post('/imageurl', (req, res) => {Image.handleApiCall(req,res)})

app.listen(3001, ()=> {
   console.log('app is runing')
})