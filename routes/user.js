const express = require('express');
const { editMember, getUser } = require('../controller/user');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer({
    dest: 'uploads/'
})

const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch (error) {
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
})

router.patch('/update', upload.single('profile'), editMember);

router.get('/update', getUser);

module.exports = router;