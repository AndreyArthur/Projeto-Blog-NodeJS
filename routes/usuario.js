const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario')
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { session } = require('passport');


router.get('/registro', (req, res) => {
  res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
  let erros = []

  if(req.body.nome == false) {
    erros.push({texto: 'Nome Inválido'})
  }

  if(req.body.email == false) {
    erros.push({texto: 'Email Inválido'})
  }

  if(req.body.senha == false) {
    erros.push({texto: 'Senha Inválida'})
  }

  if(req.body.senha.length < 4) {
    erros.push({texto: 'Senha muito curta'})
  }

  if(req.body.senha != req.body.senha2) {
    erros.push({texto: 'As senha de confirmação está diferente, tente novamente'})
  }

  if(erros.length > 0) {
    res.render('usuarios/registro', {erros: erros})
  } else {
    Usuario.findOne({email: req.body.email}).lean()
      .then( usuario => {
        if(usuario) {
          req.flash('error_msg', 'Já existe uma conta com esse e-mail.')
          res.redirect('/usuarios/registro')
        } else {
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha
          })

          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if(erro) {
                req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
                res.redirect('/')
              } else {
                novoUsuario.senha = hash

                novoUsuario.save()
                  .then( () => {
                    req.flash('succes_msg', 'Usuário criado com sucesso')
                    res.redirect('/')
                  }).catch( err => {
                    req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente')
                    res.redirect('/usuarios/registro')
                  })
              }
            })
          })

        }
      }).catch( err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/')
      })
  }
})

router.get('/login', (req, res) => {
  res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'Deslogado com sucesso')
  res.redirect('/')
})

module.exports = router;