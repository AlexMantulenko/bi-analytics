const express = require('express');
const cors = require('cors')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('@fast-csv/parse');
const bodyParser = require('body-parser');
const { 
    moving_avg,
    weighted_moving_avg ,
    exponential_moving_avg,
    smoothed_moving_avg
} = require('./modules/mov-avg.js');

const indicators = require('./modules/indicators.js');

const app = express();

app.use(express.json({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

const db_path = './data/db.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'data/')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    },
  })
  
const upload = multer({ storage: storage })

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
}

app.post('/data-ma', (req, res) => {
    let rawdata = fs.readFileSync(db_path);
    let data = JSON.parse(rawdata);
    let column_data = data.map(item => Number(item[`${req.body.column}`])), result;

    switch(req.body.type) {
        case "ma":
            result = moving_avg(column_data, Number(req.body.size));
            break;
        case "wma":
            result = weighted_moving_avg(column_data, Number(req.body.size));
            break;
        case "ema":
            result = exponential_moving_avg(column_data, Number(req.body.size));
            break;
    }

    res.json({ 
        [`${req.body.type}_${req.body.column}`]: result.map(el => el.toFixed(2))
    });
})

app.post('/data-indicators', (req, res) => {
    let rawdata = fs.readFileSync(db_path);
    let data = JSON.parse(rawdata);
    let column_data = data.map(item => Number(item[`${req.body.column}`])), result;

    switch(req.body.type) {
        case "RSI":
            result = indicators.RSI(column_data, Number(req.body.period));
            break;
    }

    res.json({ 
        [`${req.body.type}_${req.body.column}`]: result.map(el => el.toFixed(2))
    });
})

app.post('/data', upload.single('file'), async (req, res) => {
    try {
        if(!isEmpty(req.body)) {
            // if table from client
            let data = req.body.tableData, filteredTable = data.filter((el, i) => i != 0), objTable = [];

            for(let i = 0; i < filteredTable.length; i++) {
                objTable.push({});
                for(let j = 0; j < data[0].length; j++) {
                    objTable[i][data[0][j]] = filteredTable[i][j];
                }
            }

            res.json({ 
                tableName: req.body.tableName,
                tableData: objTable 
            });
        }        
        else if(!req.file) {
            console.log("err");
            res.status(400);
        }
        else {
            await new Promise((resolve, reject) => {
                const data = [];

                csv.parseFile(path.resolve(req.file.destination, req.file.originalname), { headers: true, delimiter: ',' })
                .on("error", reject)
                .on("data", row => {
                    data.push(row);
                })
                .on("end", () => {
                    resolve(data);
    
                    let jsonData = JSON.stringify(data);
                    fs.writeFileSync(db_path, jsonData);

                    res.json({ 
                        tableName: path.parse(req.file.originalname).name,
                        tableData: data 
                    });

                });
            });
        
            fs.unlinkSync(path.resolve(req.file.destination, req.file.originalname));
        }

    }
    catch(e) {
        res.status(500).json({ message: "Something went wrong..." });
    }
    
});

async function start() {
    try {
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
    }
    catch(e) {
        console.log('Server error', e.message);
    }
}
    
start();