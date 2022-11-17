const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.static(__dirname)); 

//create
app.get('/shop', (req,res)=>{
    const db = dbService.getDbServiceInstance();
    const result = db.getAllProduct();
    result
    .then(data => res.json({ data: data}))
    .catch(err => console.log(err));
});


//read
app.post('/get', (req,res)=>{
    const db = dbService.getDbServiceInstance();
    const { id, amount, total, cartID } = req.body;
    const result = db.getProduct(id);
    result
    .then(data => res.json({ data: data, amount: amount, total: total, cartID: cartID }))
    .catch(err => console.log(err));
});
app.post('/login', (req,res)=>{
    const db = dbService.getDbServiceInstance();
    const { username, password } = req.body;
    const result = db.userLogin(username, password);
    result
    .then(data => res.json({ data: data}))
    .catch(err => console.log(err));
});
app.post('/register', (req,res)=>{
    const db = dbService.getDbServiceInstance();
    const { username, email, password } = req.body;
    const result = db.insertNewUser(username,email, password);
    result
    .then(data => res.json({ data: data}))
    .catch(err => console.log(err));
});
app.post('/sell', (req,res)=>{
    const db = dbService.getDbServiceInstance();
    const { name, price, image, sellerUsername } = req.body;
    const result = db.insertNewProduct(name, price, image, sellerUsername);
    result
    .then(data => res.json({ data: data}))
    .catch(err => console.log(err));
});
app.post('/send', (req,res)=>{
    const db = dbService.getDbServiceInstance();
    const { name, amount, price, username } = req.body;
    const result = db.insertNewCart(name, amount, price, username);
    result
    .then(data => res.json({ data: data}))
    .catch(err => console.log(err));
});
app.post('/cart', (req,res)=>{
    const db = dbService.getDbServiceInstance();
    const { username } = req.body;
    const result = db.getAllCart(username);
    result
    .then(data => res.json({ data: data}))
    .catch(err => console.log(err));
});
//update

//delete

//open
app.listen(5000, ()=>{
    console.log('Server is open at: http://localhost:5000');
});