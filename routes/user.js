const express = require('express');
const { editMember, getUser, checkProfile} = require('../controller/userController');
const { uploadS3 } = require('../util/S3/config')

const router = express.Router();

router.route('/update')
    .get(getUser)
    .patch(uploadS3.single('profile'), editMember);

module.exports = router;