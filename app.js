const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const vhost = require('vhost');

// Set up the express app
const main = express();

//parse incoming requests
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

//allow cross origin http requests
main.use(cors());

//ask the user to enter a user id
main.get('/api/v1/scores', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send({
    message: 'Server up. Please provide a user id to retrieve user scores.'
  })
});

//get a single user
main.get('/api/v1/scores/:id', (req, res) => {
  const id = req.params.id;

  fs.readFile('/home/boyyoda/Module_2v1/users/' + id + '.txt', 'utf8', (err, data) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).send('null')
    }

    let contents = JSON.parse(data);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send({
      id: contents.id,
      score: contents.score
    })
  })
});

//create a new user & update user
main.post('/api/v1/scores/:id', (req, res) => {
  const dir = '/home/boyyoda/Module_2v1/users';
  
  //recording amount of files in directory before writing to a text file
  let filesBefore = fs.readdirSync(dir);
  const fileLengthA = filesBefore.length;

  const newId = req.params.id;

  let notNumber = isNaN(req.body.score);
  let newScore = parseInt(req.body.score, 10);
  
  //tests for bad client data
  if(newScore < 0 || notNumber == true ) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).send({
      Error: "Score must be a non-negative integer"
    });
  }

  let data = {
    id: newId, 
    score: newScore
  };
  
  let stringData = JSON.stringify(data);

  //Creates a new txt file in api directory to keep data persistent
  fs.writeFile("/home/boyyoda/Module_2v1/users/" + newId + '.txt', stringData, (err) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).send({
        Error: 'Unable to write to database.'
      })
    }
  });

  //recording amount of files in directory after writing to text file
  let filesAfter = fs.readdirSync(dir);
  const fileLengthB = filesAfter.length;

  //testing to see if amount of files increased after writing to a text file
  //if amount increased, we know that a user was created
  if (fileLengthA < fileLengthB) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(201).send({
      id: newId,
      score: newScore
    })
  }
  else {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send({
      id: newId,
      score: newScore
    })
  }
});

/*Setting up the redirect app

edited /etc/hosts:
added 127.0.0.1    foo.example.com
added 127.0.0.1    bar.example.com
added 127.0.0.1    example.com
*/
const redirect = express();

redirect.use(function(req, res) {
  if (!module.parent) console.log(req.vhost);
  res.redirect('http://example.com:5000/' + req.vhost[0]);
});

//setting up the vhost app
//added vhost so that XMLHttpRequests can be sent to http://example.com:5000 as opposed to 127.0.0.1:5000
let app = module.exports = express();

app.use(vhost('*.example.com', redirect));
app.use(vhost('example.com', main));

if (!module.parent) {
  const PORT = 5000;
  app.listen(5000);
  console.log(`server running on port ${PORT}`);
}