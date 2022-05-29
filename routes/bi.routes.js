const { Router } = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('@fast-csv/parse');

const router = Router();

const upload = multer({ dest: "data/" });

router.get('/d' , (req, res) => {
    res.send('ok')
})

router.post('/data', upload.single('file'), function(req, res) {
    // res.json({});

    console.log(req.file);

    // fs.createReadStream(path.resolve(req.file.destination, req.file.originalname))
    // .pipe(csv.parse({ headers: true }))
    // .on('error', error => console.error(error))
    // .on('data', row => console.log(row))
    // .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

    
});

module.exports = router;
