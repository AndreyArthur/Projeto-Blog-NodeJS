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
  require('./models/Postagem')
  const Postagem = mongoose.model('postagens');
  require('./models/Categoria')
  const Categoria = mongoose.model('categorias')
  const usuarios = require('./routes/usuario');
  const passport = require('passport');
  require('./config/auth')(passport)
  const {eAdmin} = require('./helpers/eAdmin');
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
      saveUninitialized: true
    }))
    
    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())
    // Middleware
      app.use( (req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null;
        next();
      })
// Rotas
  app.get('/', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).limit(4)
      .then( postagem => {
        res.render('index', {postagem: postagem})
      }).catch( err => {
        req.flash('error_ msg', 'Houve um erro interno')
        res.redirect('/404')
      })
  })

  app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean()
      .then( postagem => {
        if(postagem) {
          res.render('postagem/index', {postagem: postagem})
        } else {
          req.flash('error_msg', 'Esta página não existe')
          res.redirect('/')
        }
      }).catch( err => {
        req.flash('error_msg', 'Houve um erro interno, por favor, tente novamente')
        res.redirect('/')
      })
  })

  app.get('/categorias', (req, res) => {
    Categoria.find().lean()
      .then( categorias => {
        res.render('categorias/index', {categorias: categorias})
      }).catch( err => {
        req.flash('error_msg', 'Houve um erro ao listar categorias')
        res.redirect('/')
      })
  })

  app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).lean()
      .then( categoria => {
        if(categoria) {
          Postagem.find({categoria: categoria._id}).lean()
            .then( postagem => {
              res.render('categorias/postagens', {postagem: postagem, categoria: categoria})
            }).catch( err => {
              req.flash('error_msg', 'Houve um erro ao listar os posts')
              res.redirect('/')
            })
        } else {
          req.flash('error_msg', 'Essa categoria não existe')
          res.redirect('/')
        }
      }).catch( err => {
        req.flash('error_msg', 'Houve um erro ao carregar a página dessa categoria '+ err)
        res.redirect('/')
      })
  }) 

  app.get('/404', (req,res) => {
    res.send('Erro 404, essa página não existe!')
  })

  app.use('/admin', eAdmin, admin);

  app.use('/usuarios', usuarios)

// Outros

  {const port = 3000;
  app.listen(port, () => console.log('O Servidor está aberto em http://localhost:'+port))}