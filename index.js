var express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config()
const mongo = require('mongodb');
const port = process.env.PORT || 3000;
const mongoclient = mongo.MongoClient;
const mongourl = "mongodb+srv://sumanth:12345@sumanth.w8xsd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var db ;

app.get('/', (req, res) => {
    res.send('welcome to node mongo');
})
//api for cities on homepage
app.get('/cities', (req, res) => {
    db.collection('cities').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

//api for restaurants on homepage for dropdown
app.get('/restaurants', (req, res) => {
    db.collection('restaurant').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

//api for restaurants with respect to cityId in dropDown
app.get('/restaurants/:cityid', (req, res) => {
    var cityid = req.params.cityid;
    db.collection('restaurant').find({city:cityid}).toArray((err,result) => {
            if(err) throw err;
            res.send(result);
    })
})

//api for restaurants with respect to cityId or mealType
app.get('/rest', (req, res) => {
    var query = {};
    if(req.query.cityid){
        query = {city:req.query.cityid};
    }
    else if(req.query.mealtype){
        query = {"type.mealtype":req.query.mealtype};
    }

    db.collection('restaurant').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

//api for filter with cusine and cost with respect to the mealtype
app.get('/filter/:mealtype', (req, res) => {
   
  //api for sorting with respect to the price 
    var sort = {cost:1};
    if(req.query.sortkey){
        sort = {cost:req.query.sortkey};
    }
  
    //api for pagination to display two items per page
    var skip = 0;
    var limit = 1000000000000;
    if(req.query.skip && req.query.limit){
        skip = Number(req.query.skip);
        limit = Number(req.query.limit);
    }

    var mealtype = req.params.mealtype;
    var query = {"type.mealtype": mealtype};
    if(req.query.cusine && req.query.lcost && req.query.hcost) {
        query = { $and: [{cost:{$gt:Number(req.query.lcost),$lt:Number(req.query.hcost)}}],
                    'Cuisine.cuisine':req.query.cusine,
                    'type.mealtype':mealtype
    }
    }
    else if(req.query.cusine){
        query = {'Cuisine.cuisine':req.query.cusine , 'type.mealtype':mealtype}
    }

    else if(req.query.lcost && req.query.hcost){
        var lcost = Number(req.query.lcost);
        var hcost = Number(req.query.hcost);
        query = { $and: [{cost:{$gt:lcost,$lt:hcost}}],'type.mealtype':mealtype}
    }

    db.collection('restaurant').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

// api for homepage quicksearch
app.get('/quicksearch', (req, res) => {
    db.collection('mealtype').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

mongoclient.connect(mongourl, (err,client) => {
    if (err) {console.log("error while connection");}
    db = client.db('edumato');
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})
