const express = require('express');
const router = express.Router();
const exceptionsController = require('../controllers/exceptionsController');

router.post('/', exceptionsController.create);
router.get('/revenu/:revenuId', exceptionsController.getByRevenu);
router.put('/:id', exceptionsController.update);
router.delete('/:id', exceptionsController.delete);

module.exports = router;
