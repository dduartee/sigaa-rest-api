const express = require('express')
const Router = express.Router();

//rotas
const bonds = require('../data/bonds');
const courses = require('../data/courses');
const grades = require('../data/grades');
const homeworks = require('../data/homeworks');
const members = require('../data/members');
const news = require('../data/news');

Router.post('/bonds', (req, res) =>  bonds(req,res));
Router.post('/courses', (req,res) =>  courses(req, res));
Router.post('/grades', (req,res) =>  grades(req, res));
Router.post('/members', (req,res) =>  members(req, res));
Router.post('/homeworks', (req,res) =>  homeworks(req, res));
Router.post('/news', (req,res) =>  news(req, res));

module.exports = Router;