const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const neo4j = require('neo4j');
const db = new neo4j.GraphDatabase('http://neo4j:baza@localhost:7474');

const app = express();

//middleware
app.use(bodyParser.json())
const urlencodedParser = bodyParser.json({ extended: false });


app.get('/', function(req, res){
    res.send('<h1>Knowledge database API</h1>');
});

app.post('/search', urlencodedParser, function(req,res){

    var body = req.body;
    var searchValue;
    
    if (typeof body.search === "undefined"){

        var jsonString = JSON.stringify({"search":"query_that_you_want_to_search"});
        var response = 'JSON data are not valid, please provide data in ' + jsonString + ' format';

        res.status(400).send('<h4>' + response + '</h4>');

    }else{

        searchValue = "'" + body.search + "'";
        console.log(searchValue);

        db.cypher({
            query: 'MATCH (x:Nazwa {Nazwa: {input}})' +
                   'OPTIONAL MATCH (z)-[a*0..2]->(x)-[r*0..2]->(y)' +
                   'return z,y',
            params: { 
                input: 'Pepsi Max',
            },
        }, function (err, results) {
            if (err) throw err;
            var result = results[0];
            if (!result) {
                res.json();
            } else {
                for(var values in results){
                    console.log(values.Nazwa);
                }
                res.json(results);
            }
        });
    }   

});

app.listen(3000, function(){
    console.log('Server Started on port 3000');
});