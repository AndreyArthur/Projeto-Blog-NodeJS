// Carregando Módulos
  const express = require('express');
  const handlebars = require('express-handlebars');
  const bodyParser = require('body-parser');
  const app = express();
  const admin = require('./routes/admin');
  const path = require('path');
  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;
  const session = require('express-session');
  const flash = require('connect-flash');
  // const mongoose = require('mongoose');

// Configurações

  // Body Parser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
  // Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
  // Mongoose
    mongoose.Promise = global.Promise;
      mongoose.connect('mongodb://localhost/blogapp', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then( () => {
          console.log('MongoDB conectado');
        }).catch( (err) => {
          console.log('Houve um erro ao se conectar ao MongoDB: ' + err);
        })
  // Public
    app.use(express.static(
      path.join(__dirname,'public')
    ))
  // Sessions
    app.use(session({
      secret: 'cursodenode',
      resave: true,
      saveUninitializad: true
    }))
    app.use(flash())
    // Middleware
      app.use( (req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        next();
      })
// Rotas
  app.use('/admin', admin);

// Outros

  {const port = 3000;
  app.listen(port, () => console.log('O Servidor está aberto em http://localhost:'+port))}