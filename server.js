const express = require('express');
const server = express();

require('dotenv/config');

const rateLimit = require('express-rate-limit')


const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100, // Limit each IP to 100 requests per `window` (here, per minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
server.use(limiter)







function commLogs(req, res, next) {
  var oldWrite = res.write,
      oldEnd = res.end;
  var chunks = [];

  res.write = function (chunk) {
    chunks.push(chunk);
    return oldWrite.apply(res, arguments);
  };

  res.end = async function (chunk) {
    if (chunk)
      chunks.push(chunk);
    var body = Buffer.concat(chunks).toString('utf8');
    doc = {
        url: req.url,
        method: req.method,
        host: req.hostname,
        x_api_key: req.rawHeaders[1],
        payout: JSON.parse(body)
    };
    // console.log(doc);
    await mongoDriver.logCommunication(doc);

    oldEnd.apply(res, arguments);
  };

  next();
}

server.use(commLogs);






//allow cross-origin requests
const cors = require('cors');
server.use(cors({
    origin: '*'
    //TODO - change this to vercel at the very end
}));

//allow API users to access images directory
server.use('/images', express.static('images'));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

//Custom driver for our DB
const mongoDriver = require('./mongoDriver');

//TODO catch custom errors

//TODO api security - don't think this actually blocks anything
//need to modify it to only allow requests from certain IPs and from vercel app
server.use(function apiSecurity(req, res, next){
    let host = req.header("x-api-key");
    if(host == process.env.APIKEY){
        next();
    } else {
        var doc = {error:"unauthorized host detected"};
        res.json(doc);
    }
});

//activation of "main" method
server.listen(3001, api());

//"main" method
function api() {
    console.log('API has been booted up');

    ///TEMPLATES///
    server.post('/endpoint', (req, res) => {
        console.log('This is the template for a CREATE operation');
        res.send('This is the template for a CREATE operation');
    })
    server.get('/endpoint', (req, res) => {
        res.send('This is the template for a READ operation');
    })
    server.put('/endpoint', (req, res) => {
        console.log('This is the template for an UPDATE operation');
    })
    server.delete('/endpoint', (req, res) => {
        console.log('This is the template for an DELETE operation');
    })


    ///CAR INFO///
    server.get('/getCar/:id', (req, res) => { 
        var id = req.params.id;
        mongoDriver.getCar(id).then( (value) => {res.json(value);},);
    })

    server.get('/getCars', (req, res) => { 
        mongoDriver.getCars().then( (value) => {res.json(value);},);
    })

    server.get('/getCarsByProperties', (req, res) => { 
        var doc = req.body;
        mongoDriver.getCarsByProperties(doc).then( (value) => {res.json(value);},);
    })

    server.get('/getBrands', (req, res) => { 
        mongoDriver.getBrands().then( (value) => {res.json(value);},);
    })

    server.get('/getModels', (req, res) => { 
        mongoDriver.getModels().then( (value) => {res.json(value);},);
    })

    server.get('/getCarTypes', (req, res) => { 
        mongoDriver.getCarTypes().then( (value) => {res.json(value);},);
    })

    server.get('/getFeaturedCars', (req, res) => {
        mongoDriver.getFeaturedCars().then( (value) => {res.json(value);},);
    })

    server.get('/getPackages', (req, res) => {
        mongoDriver.getPackages(req.body.year_id).then ( (value) => {res.json(value);},);
    })

    server.get('/getFilters', (req, res) => {
        mongoDriver.getFilters().then ( (value) => {res.json(value);},);
    })

    server.get('/getAllOrders', (req, res) => {
        mongoDriver.getAllOrders().then ( (value) => {res.json(value);},);
    })

    server.get('/getOrder', (req, res) => {
        mongoDriver.getOrder(req.body.order_id).then ( (value) => {res.json(value);},);
    })

    server.get('/getUserOrders', (req, res) => {
        mongoDriver.getUserOrders(req.body.user_id).then ( (value) => {res.json(value);},);
    })

    //CAR ADD
    server.put("/addCar", (req, res) => {
        mongoDriver.addModelYear(req.body.model_id, req.body.year, req.body.main_image, req.body.header_image, req.body.description, req.body.featured, req.body.quantity)
            .then((value) => {
                if(value.name != null){
                    res.json({[value.name]:value.message});
                } else {
                    res.json({inserted:value});
                }
            });
    });

    //ORDER ADD
    server.put('/addOrder', (req, res) => {
        mongoDriver.addOrder(req.body.user_id, req.body.model_year_id, req.body.package_id, req.body.date, req.body.package_price, req.body.discount, req.body.final_price)
            .then((value) => {
                if(value.name != null){
                    res.json({[value.name]:value.message});
                } else {
                    res.json({inserted:true});
                }
            });
    })

    //CAR UPDATE
    server.post("/updateCar", (req, res) =>{
        mongoDriver.updateCar(req.body).then(
            (value) => {res.json({updated:value});},
        )
    })

    //CAR DELETE
    server.delete('/deleteCar/:id', (req, res) => {
        var id = req.params.id;
        mongoDriver.deleteModelYear(id).then ( (value) => {res.json(value);},);
    })

    ///USER INFO///
    server.put('/addUser', (req, res) => {
        mongoDriver.addUser(req.body.username, req.body.admin, req.body.firstname, req.body.lastname, req.body.pw, req.body.phone_number)
            .then((value) => {
                if(value){
                    res.json({inserted:true});
                } else {
                    res.json({error:"User could not be added"});
                }
            });
    })
    server.post("/checkLogin", (req, res) =>{
        const user = req.body.username;
        const pw = req.body.password;
        mongoDriver.checkUser(user, pw).then(
            (value) => {res.json(value);},
        )
    })
}