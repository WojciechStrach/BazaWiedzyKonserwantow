const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const neo4j = require('neo4j');
const db = new neo4j.GraphDatabase('http://neo4j:baza@localhost:7474');
const productModel = require('./models/product');

const app = express();

//middleware
app.use(bodyParser.json())
const urlencodedParser = bodyParser.json({ extended: false });


app.get('/', function(req, res){
    res.status(200).send('<h1>Knowledge database API</h1>');
});

app.post('/search', urlencodedParser, function(req,res){

    var body = req.body;
    var searchValue;
    
    if (typeof body.search === "undefined"){

        let jsonString = JSON.stringify({"search":"query_that_you_want_to_search"});
        let response = 'JSON data are not valid, please provide data in ' + jsonString + ' format';

        res.status(400).send('<h4>' + response + '</h4>');

    }else{

        searchValue = body.search;
        
        var product = new productModel.ProductModel();

        db.cypher({
            query: 'MATCH (x:Nazwa {Nazwa: {productSearch}})' +
                   'RETURN x',
            params: { 
                productSearch: searchValue,
            },
        }, function (err, results) {

            if (err) {
                console.log(err);
                res.status(400).send('<h4>Unexpecting error occured ' + err + '</h4>');
            }

            var result = results[0];
            if (!result) {
                res.status(204);
            } else {

                product.setProductName(results[0].x.properties.Nazwa);
                product.setProductPictureUrl(results[0].x.properties.Url_obrazka);

                db.cypher({
                    query: 'MATCH (x:Nazwa {Nazwa: {preservativesSearch}})' +
                           'OPTIONAL MATCH (x)-[r:Zawiera]->(y)' +
                           'RETURN y',
                    params: { 
                        preservativesSearch: results[0].x.properties.Nazwa,
                    },
                }, function (preservativesErr, preservativesResults) {
        
                    if (preservativesErr) {
                        console.log(preservativesErr);
                        res.status(400).send('<h4>Unexpecting error occured ' + preservativesErr + '</h4>');
                    }
        
                    var preservativesResult = preservativesResults[0];
                    if (!preservativesResult) {
                        
                    } else {
                        console.log(preservativesResults[0].y.properties);
                        
                        for (let i=0; i<preservativesResults.length; i++){
                            for (var preservative in preservativesResults[i].y.properties) {
                                console.log("Item name: "+preservative.Opis);
                                // console.log("Source: "+result[i][name].sourceUuid);
                                // console.log("Target: "+result[i][name].targetUuid);
                            }
                        }
                        
                    }

                }
                )};    
        });
    }   

});

app.listen(3000, function(){
    console.log('Server Started on port 3000');
});