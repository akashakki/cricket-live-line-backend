const express = require('express');
const { adminAuthController } = require('../../controllers')
const router = express.Router();

router.get('/preview', adminAuthController.getMedia);
// router.get('/audio-url', adminAuthController.getAudioURL);
// router.get('/get-base64', adminAuthController.getImageBase64);


module.exports = router;