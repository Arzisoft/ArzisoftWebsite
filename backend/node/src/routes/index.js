const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('home', { currentPage: 'home' }));
router.get('/services', (req, res) => res.render('services', { currentPage: 'services' }));
router.get('/product', (req, res) => res.render('product', { currentPage: 'product' }));
router.get('/ai', (req, res) => res.render('ai', { currentPage: 'ai' }));
router.get('/devgrup', (req, res) => res.render('devgrup', { currentPage: 'devgrup' }));
router.get('/login', (req, res) => res.render('login', { currentPage: 'login' }));
router.get('/get-started', (req, res) => res.render('get-started', { currentPage: 'get-started' }));
router.get('/resources', (req, res) => res.render('resources', { currentPage: 'resources' }));

module.exports = router;
