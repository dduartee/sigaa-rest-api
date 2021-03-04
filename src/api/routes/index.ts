import express from 'express';
const Router = express.Router();

//rotas

import courses from '../v1/courses';
import grades from '../v1/grades';
import homeworks from '../v1/homeworks';
import members from '../v1/members';
import news from '../v1/news';
import bonds from '../v1/bonds';

Router.post('/bonds', (req, res) =>  bonds(req,res));
Router.post('/courses', (req,res) =>  courses(req, res));
Router.post('/grades', (req,res) =>  grades(req, res));
Router.post('/members', (req,res) =>  members(req, res));
Router.post('/homeworks', (req,res) =>  homeworks(req, res));
Router.post('/news', (req,res) =>  news(req, res));

export default Router;