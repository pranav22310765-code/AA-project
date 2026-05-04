const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// GET - Get live queue (all waiting patients sorted by priority & arrival time)
router.get('/live', queueController.getLiveQueue);

// GET - Get queue statistics
router.get('/stats', queueController.getQueueStats);

module.exports = router;
