const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

// Set up the express app
const main = express();

//parse incoming requests
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

//allow cross origin http requests
main.use(cors());

//check if the users directory exists
//if not, create one
if (fs.existsSync('./users') == false){
  fs.mkdir('./users', (err) => {
    if (err) throw err; 
  });
}

//ask the user to enter a user id
main.get('', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send({
    message: 'Server up. Please provide a user id to retrieve user scores.'
  })
});

//get a single user
main.get('/:id', (req, res) => {
  const id = req.params.id;

  fs.readFile('./users/' + id + '.txt', 'utf8', (err, data) => {
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
main.post('/:id', (req, res) => {
  const dir = './users';
  
  //recording amount of files in directory before writing to a text file
  let filesBefore = fs.readdirSync(dir);
  const fileLengthA = filesBefore.length;

  const newId = req.params.id;

  let notNumber = isNaN(req.body.score);
  let newScore = parseInt(req.body.score, 10);
  
  //tests for bad client data
  if(newScore < 0 || notNumber) {
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
  fs.writeFile('./users/' + newId + '.txt', stringData, (err) => {
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

const PORT = 5000;

main.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
