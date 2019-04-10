const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const firebase = require('firebase') //-INTERN-2

//Additional - INTERN 3
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

const app = express()

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Initialize Firebase - INTERN 2
var config = {
    // FIREBASE CONFIGURATION
  };
  firebase.initializeApp(config);

var database = firebase.database(); 

// Upload File - INTERN 3
app.use(express.static(path.join(__dirname, 'public')));


cloudinary.config({ 
    //CLOUDINARY CONFIGURATION
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: (req, file, cb) => {
        cb(null, "File_" + req.body.nim);
    },
    allowedFormats: ["jpg", "png", "pdf", "jpeg", "docx", "xls", "csv"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    filename: function(req, file, cb) {
        cb(null, req.body.nim + "_" + file.originalname)
    }
});

const upload = multer({ storage: storage }); // Call Multer

//HOW TO ADD DATA TO FIREBASE - INTERN 2
app.post('/addData', upload.single('file') , async (req,res) => {  //Upload Single File - INTERN 3
    console.log(req.body);
    console.log(req.file.url)
    data = req.body;

    // key = database.ref().child('posts').push().key;
    database.ref('Person/' + data.nim).set({   //KALO PAKE .PUSH langsung input KEYNYA, Gabisa di set Childnya
        name : data.nama,
        nim  : data.nim,
        img : req.file.url
    });
    res.render('index');
    res.redirect('showData');
});

app.get('/showData', (req,res) => {
    database.ref("Person").once('value', (snapshot) => {
        console.log(snapshot.val());
        data = snapshot.val();

        res.render('show', {
            data : data
        })
    });
});

app.post('/delete', (req,res) => {
    data = req.body.del;

    ref = database.ref('Person/' + data);
    ref.remove();
    res.redirect('showData');
});

app.get("/", (req, res) => {
    res.render('index.hbs')
})

app.get('*', (req,res) => {
    res.send('Page not Found')
})


app.listen(3000, () => {
    console.log("Server on Port 3000")
})  


// HOW TO ADD TEMPORARY DATA - INTERN 1

// app.post("/input", (req,res) => {
//      //console.log(req.body)
//     console.log(JSON.stringify(req.body, null, 2));
//     res.render("input.ejs", {
//         nama: req.body.nama,
//         nim : req.body.nim
//     })
// });