const { MongoClient } = require('mongodb');
const { ForeignKeyError } = require('./errors/ForeignKeyError.js');
const { createHash } = require('crypto');


//this is the connection info for our specific DB
//DB name = 422database
//user = root
//pw = TargaryensFTW
const MONGO_CONNECTION_STRING = "mongodb+srv://root:TargaryensFTW@422databse.axyczfl.mongodb.net/?retryWrites=true&w=majority";
const uri = MONGO_CONNECTION_STRING;
const client = new MongoClient(uri);

//clears the database for the purpose of a fresh batch of data
exports.resetDatabase = async function(){
    try{
        await client.connect();
        var db = client.db("cars");
        await db.collection("brand").deleteMany();
        await db.collection("car_type").deleteMany();
        await db.collection("model").deleteMany();
        await db.collection("model_year").deleteMany();
        await db.collection("package").deleteMany();
        await db.collection("package_detail").deleteMany();
        await db.collection("part").deleteMany();
        await db.collection("part_allowed").deleteMany();
        await db.collection("part_type").deleteMany();
        db = client.db("users");
        await db.collection("user").deleteMany();
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exports.addBrand = async function(name){//good example to copy & paste for simple tables
    try{
        await client.connect();
        const db = client.db("cars"); //select database
        const collection = db.collection('brand'); //select collection (table)
        var doc = {}; //empty document to insert (will be modified)

        if(await collection.countDocuments() == 0){ //check if collection empty
            doc = {brand_id: 0, brand_name: name}; //start at index 0
        } else { //not empty
            //query DB to find last record & imcrement index from there
            const query = {};
            const options = {
                //sort by brand_id -> descending
                sort: { "brand_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.brand_id + 1;
            doc = {brand_id: id, brand_name: name};
        }

        //insert document
        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}

exports.addCarType = async function(name){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('car_type');
        var doc = {};

        if(await collection.countDocuments() == 0){
            doc = {car_type_id: 0, car_type_name: name};
        } else {
            const query = {};
            const options = {
                //sort by car_type_id -> descending
                sort: { "car_type_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.car_type_id + 1;
            doc = {car_type_id: id, car_type_name: name};
        }

        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}

exports.addModel = async function(name, brand_id, car_type_id){//good example to copy & paste for tables w/ FKs
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('model');
        var doc = {};

        if(await collection.countDocuments() == 0){
            doc = {model_id: 0, model_name: name, brand_id, car_type_id};
        } else {
            const query = {};
            const options = {
                //sort by model_id -> descending
                sort: { "model_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.model_id + 1;
            //check brand FK
            if(!(await exists({brand_id: brand_id}, db.collection('brand')))){
                throw new ForeignKeyError("provided brand does not exist");
            }
            //check car_type FK
            if(!(await exists({car_type_id: car_type_id}, db.collection('car_type')))){
                throw new ForeignKeyError("provided car_type does not exist");
            }
            doc = {model_id: id, model_name: name, brand_id, car_type_id};
        }
        await collection.insertOne(doc);        
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}

exports.addModelYear = async function(model_id, year, main_image, header_image, description, featured, quantity){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('model_year');
        // var doc = {};

        if(await collection.countDocuments() == 0){
            doc = {model_year_id: 0, model_id, year, main_image, header_image, description, featured, quantity};
        } else {
            const query = {};
            const options = {
                //sort by model_year_id -> descending
                sort: { "model_year_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.model_year_id + 1;
            //check model FK
            if(!(await exists({model_id: model_id}, db.collection('model')))){
                return new ForeignKeyError("provided model does not exist");
            }
            doc = {model_year_id: id, model_id, year, main_image, header_image, description, featured, quantity};
        }
        var value = await collection.insertOne(doc); 
        // console.log(value.acknowledged);
        // TODO - catch any error here?
        return value.acknowledged;
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
        // return false;
    }
}

exports.addPackage = async function(model_year_id, package_name, base_price){//good example to copy & paste for simple tables
    try{
        await client.connect();
        const db = client.db("cars"); //select database
        const collection = db.collection('package'); //select collection (table)
        var doc = {}; //empty document to insert (will be modified)

        if(await collection.countDocuments() == 0){ //check if collection empty
            doc = {package_id: 0, model_year_id, package_name, base_price}; //start at index 0
        } else { //not empty
            //query DB to find last record & imcrement index from there
            const query = {};
            const options = {
                //sort by brand_id -> descending
                sort: { "package_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.package_id + 1;
            doc = {package_id : id, model_year_id, package_name, base_price};
        }

        //insert document
        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}

exports.addPackageDetail = async function(package_id, part_id){//good example to copy & paste for simple tables
    try{
        await client.connect();
        const db = client.db("cars"); //select database
        const collection = db.collection('package_detail'); //select collection (table)
        var doc = {package_id, part_id}; //empty document to insert (will be modified)
        //insert document
        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}

exports.addPart = async function(part_type_id, part_name){//good example to copy & paste for simple tables
    try{
        await client.connect();
        const db = client.db("cars"); //select database
        const collection = db.collection('part'); //select collection (table)
        var doc = {}; //empty document to insert (will be modified)

        if(await collection.countDocuments() == 0){ //check if collection empty
            doc = {part_id: 0, part_type_id, part_name}; //start at index 0
        } else { //not empty
            //query DB to find last record & imcrement index from there
            const query = {};
            const options = {
                //sort by part_id -> descending
                sort: { "part_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.part + 1;
            doc = {part_id : id, part_type_id, part_name};
        }

        //insert document
        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}

exports.addPartAllowed = async function(part_id, model_year_id){
    try{
        await client.connect();
        const db = client.db("cars"); //select database
        const collection = db.collection('part_allowed'); //select collection (table)
        var doc = {part_id, model_year_id};

        //insert document
        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}

exports.addPartType = async function(part_type_name){
    try{
        await client.connect();
        const db = client.db("cars"); //select database
        const collection = db.collection('part_type'); //select collection (table)
        var doc = {}; //empty document to insert (will be modified)

        if(await collection.countDocuments() == 0){ //check if collection empty
            doc = {part_type_id: 0, part_type_name}; //start at index 0
        } else { //not empty
            //query DB to find last record & imcrement index from there
            const query = {};
            const options = {
                //sort by part_type_id -> descending
                sort: { "part_type_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.part + 1;
            doc = {part_type_id: id, part_type_name};
        }

        //insert document
        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}


//CAR READ OPERATIONS
exports.getCar = async function(id){
    await client.connect();
        const db = client.db("cars");
        const model_year_collection = db.collection('model_year');
        const model_collection = db.collection('model');
        const brand_collection = db.collection('brand');
        const car_type_collection = db.collection('car_type');

        var query = {model_year_id: parseInt(id)}
        var model_year_data = await model_year_collection.findOne(query);

        query = {model_id : model_year_data.model_id};
        var model_data = await model_collection.findOne(query);

        query = {brand_id : model_data.brand_id};
        var brand_data = await brand_collection.findOne(query);

        query = {car_type_id : model_data.car_type_id};
        var car_type_data = await car_type_collection.findOne(query);

        var tempCar = {
            car_id: model_year_data.model_year_id,
            car_name: {
                model_id:model_data.model_id, 
                model:model_data.model_name, 
                brand_id:brand_data.brand_id,
                brand:brand_data.brand_name, 
                year:model_year_data.year
            },
            category_id:model_data.car_type_id,
            category:car_type_data.car_type_name,
            main_image:model_year_data.main_image,
            header_image:model_year_data.header_image,
            description:model_year_data.description,
            quantity:model_year_data.quantity,
            featured:model_year_data.featured,
        };

        return tempCar;
}

exports.getCars = async function(){
    try{
        await client.connect();
        const findResult = {cars:[]};

        const db = client.db("cars");
        const model_year_collection = db.collection('model_year');
        const model_collection = db.collection('model');
        const brand_collection = db.collection('brand');
        const car_type_collection = db.collection('car_type');

        var model_year_data = await model_year_collection.find({}).toArray();

        for (var i = 0;i<model_year_data.length;i++){
            var findmodelid = {model_id : model_year_data[i]['model_id']};
            var model_data = await model_collection.find(findmodelid).toArray();

            var findbrandid = {brand_id : model_data[0]['brand_id']};
            var brand_data = await brand_collection.find(findbrandid).toArray();

            var findcartypeid = {car_type_id : model_data[0]['car_type_id']};
            var car_type_data = await car_type_collection.find(findcartypeid).toArray();

            var tempCar = {
                car_id: model_year_data[i]['model_year_id'],
                car_name: {
                    model_id:model_data[0]['model_id'], 
                    model:model_data[0]['model_name'], 
                    brand_id:brand_data[0]['brand_id'],
                    brand:brand_data[0]['brand_name'], 
                    year:model_year_data[i]['year']
                },
                category_id:model_data[0]['car_type_id'],
                category:car_type_data[0]['car_type_name'],
                main_image:model_year_data[i]['main_image'],
                header_image:model_year_data[i]['header_image'],
                description:model_year_data[i]['description'],
                quantity:model_year_data[i]['quantity'],
                featured:model_year_data[i]['featured'],
            };
                
            findResult['cars'].push(tempCar);
        }

        return findResult;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exports.getCarsByProperties = async function(doc){
    var cars = await this.getCars();
    var result = cars.cars;

    //check against brands
    if(doc.brands != null){
        let newResult = [];
        result.forEach(car => {
            doc.brands.forEach(brand =>{
                if(brand == car.car_name.brand_id){
                    newResult.push(car)
                }
            })
        })
        result = newResult
    }

    //check against models
    if(doc.models != null){
        let newResult = [];
        result.forEach(car => {
            doc.models.forEach(model =>{
                if(model == car.car_name.model_id){
                    newResult.push(car)
                }
            })
        })
        result = newResult
    }

    //check against years
    if(doc.years != null){
        let newResult = [];
        result.forEach(car => {
            doc.years.forEach(year =>{
                if(year == car.car_name.year){
                    newResult.push(car)
                }
            })
        })
        result = newResult
    }

    //check against categories
    if(doc.categories != null){
        let newResult = [];
        result.forEach(car => {
            doc.categories.forEach(category =>{
                if(category == car.category_id){
                    newResult.push(car)
                }
            })
        })
        result = newResult
    }

    //TODO - check against engine types
    // if(doc.categories != null){
    //     let newResult = [];
    //     result.forEach(car => {
    //         doc.categories.forEach(category =>{
    //             if(category == car.category_id){
    //                 newResult.push(car)
    //             }
    //         })
    //     })
    //     result = newResult
    // } 

    return {cars: result};
}

exports.getFeaturedCars = async function(){
    var cars = await this.getCars();
    var featuredCars = {cars: []}

    for(var car of cars.cars.slice()){
        if(car.featured){
            featuredCars.cars.push(car);
        }
    }

    return featuredCars;
}

exports.getBrand = async function(id){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('brand');

        doc = {brand_id: id};
        const findResult = await collection.find(doc).toArray();
        if(findResult.length == 1){
            return findResult[0];
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return false;
}

exports.getBrands = async function(){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('brand');

        const findResult = await collection.find({}).toArray();
        return {brands: findResult};
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exports.getCarType = async function(id){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('car_type');

        doc = {car_type_id: id};
        const findResult = await collection.find(doc).toArray();
        if(findResult.length == 1){
            return findResult[0];
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return false;
}

exports.getCarTypes = async function(){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('car_type');

        const findResult = await collection.find({}).toArray();
        return {carTypes: findResult};
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exports.getModel = async function(id){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('model');

        doc = {model_id: id};
        const findResult = await collection.find(doc).toArray();
        if(findResult.length == 1){
            return findResult[0];
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return false;
}

exports.getModels = async function(){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('model');

        const findResult = await collection.find({}).toArray();
        return {models: findResult};
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exports.getModelYear = async function(id){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('model_year');

        doc = {model_year_id: id};
        const findResult = await collection.find(doc).toArray();
        if(findResult.length == 1){
            return findResult[0];
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return false;
}

exports.getModelYears = async function(){
    try{
        await client.connect();
        const db = client.db("cars");
        const collection = db.collection('model_year');

        const findResult = await collection.find({}).toArray();
        return findResult;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//CAR UPDATE OPERATIONS
// TODO - validate model_id
exports.updateCar = async function(json){
    try{
        await client.connect();
        const db = client.db("cars");
        var collection = db.collection('model_year');

        var myquery = { model_year_id: json.model_year_id };
    
        var newvalues = { $set: {
            model_id: json.model_id, 
            year: json.year,
            main_image: json.main_image,
            header_image: json.header_image,
            description: json.description,
            quantity: json.quantity,
            featured: json.featured} 
        };

        await collection.updateOne(myquery, newvalues);

        collection = db.collection('model');
        myquery = { model_id: json.model_id };

        newvalues = { $set: {
            car_type_id: json.category}
        };

        await collection.updateOne(myquery, newvalues);

        return true;
    } catch (e) {
        console.error(e);
        return false;
    } finally {
        await client.close();
    }
}

///USER ADD OPERATIONS///
exports.addUser = async function(user, pw){
/*Changes
* username -> email
user_type
firstname & lastname
phone number
 */

    try{
        await client.connect();
        const db = client.db("users");
        const collection = db.collection('user');
        var doc = {};

        if(await collection.countDocuments() == 0){
            doc = {user_id: 0, username: user, password: hash(pw)};
        } else {
            const query = {};
            const options = {
                //sort by user_id -> descending
                sort: { "user_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.user_id + 1;
            doc = {user_id: id,  username: user, password: hash(pw)};
        }

        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}

exports.checkUser = async function(user, pw){
    try{
        await client.connect();
        const db = client.db("users");
        const collection = db.collection('user');

        doc = {username: user, password: hash(pw)};
        const findResult = await collection.find(doc).toArray();
        if(findResult.length == 1){
            return findResult[0];
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return false;
}

//ERRORS

exports.logError = async (error) => {
    try{
        await client.connect();
        const db = client.db("errors");
        const collection = db.collection('error');
        var doc = {};

        if(await collection.countDocuments() == 0){
            doc = {error_id: 0, [error.name]: error.message, timestamp: Date.now()};
        } else {
            const query = {};
            const options = {
                //sort by user_id -> descending
                sort: { "error_id": -1 }
            };
            latestRecord = await collection.findOne(query, options);
            id = latestRecord.error_id + 1;
            doc = {error_id: id, [error.name]: error.message, timestamp:Date.now()};
        }

        await collection.insertOne(doc);
    } catch (e) {
    console.error(e);
    } finally {
        await client.close();
    }
}


///UTILITY FUNCTIONS///
exists = async function(document, collection){
    try{
        const findResult = await collection.findOne(document, {});
        if(findResult != null){
            return true;
        }
    } catch (e) {
        console.error(e);
    }
    return false;
}

hash = function(str){
    return createHash('sha256').update(str).digest('hex');
}