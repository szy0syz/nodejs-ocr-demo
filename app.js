const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { TesseractWorker } = require('tesseract.js');

const worker = new TesseractWorker();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).single('avater');
app.set('view engine', 'ejs');

// Routes
app.get('/', (_, res) => {
  res.render('index');
});

app.post('/upload', (req, res) => {
  upload(req, res, err => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.error(err);

      worker
        .recognize(data, 'eng', { tessjs_create_pdf: '1' })
        .progress(pro => {
          console.log(pro);
        })
        .then(result => {
          console.log('[**] text:', result.text);
          res.send(result.text);
        })
        .finally(() => worker.terminate());
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running at http://localhost:5000'));
