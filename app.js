const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongojs = require('mongojs');
const db = mongojs('customerapp', ['users']);
let objectId = mongojs.ObjectId;
const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static path
app.use(express.static(path.join(__dirname, 'public')));

// Global vars
app.use( (req, res, next) => {
  res.locals.errors = null;
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

let users = [];

app.get('/', (req, res) => {
  db.users.find(function (err, docs) {
    res.render('index', {
      title: 'Customers',
      users: docs
    });
  })
});

app.post('/users/add', (req, res) => {

  req.checkBody('first_name', 'First Name is Required').notEmpty();
  req.checkBody('last_name', 'Last Name is Required').notEmpty();
  req.checkBody('email', 'Email is Required').notEmpty();

  const errors = req.validationErrors();

  if (errors){
    res.render('index', {
      title: 'Customers',
      users: users,
      errors: errors
    });
  } else {
    const newUser = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email
    }

    db.users.insert(newUser, (err, result)=>{
      if (err) {
        console.log(err);
      }
      res.redirect('/');
    });
  }
});

app.delete('/users/delete/:id', (req, res)=> {
  db.users.remove({_id: objectId(req.params.id)}, (err, result)=> {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server Started on Port 3000');
})
