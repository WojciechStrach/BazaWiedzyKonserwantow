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

                        let preservativesTempObject = [];
                                                
                        for (let i=0; i<preservativesResults.length; i++){
                            let tempObject = {};
                            for (let preservative in preservativesResults[i].y.properties) {                                                              
                                tempObject[preservative] = preservativesResults[i].y.properties[preservative];
                            };
                            preservativesTempObject.push(tempObject);
                        };

                        let diseasesTempObject = [];

                        for (let preservativeSign in preservativesTempObject){
                            if (preservativesTempObject.hasOwnProperty(preservativeSign)) {

                                db.cypher({
                                    query: 'MATCH (x:Oznaczenie {Oznaczenie:{diseaseSearch}})' +
                                           'OPTIONAL MATCH (x)-[r:Może_powodować]->(y)' +
                                           'RETURN y',
                                    params: { 
                                        diseaseSearch: preservativesTempObject[preservativeSign].Oznaczenie,
                                    },
                                }, function (diseasesErr, diseasesResults) {
                        
                                    if (diseasesErr) {
                                        console.log(diseasesErr);
                                        res.status(400).send('<h4>Unexpecting error occured ' + diseasesErr + '</h4>');
                                    }
                        
                                    var diseaseResult = diseasesResults[0];
                                    if (!diseaseResult) {
                                        
                                    } else {

                                        for(let nullValues in diseasesResults){
                                            if(diseasesResults[nullValues].y === null){
                                                let index = diseasesResults.indexOf(diseasesResults[nullValues].y);
                                                console.log(index);
                                            }
                                        }

                                        // for (let i=0; i<diseasesResults.length; i++){
                                        //     let tempObject = {};
                                        //     for (let disease in diseasesResults[i].y.properties) {                                                              
                                        //         tempObject[disease] = diseasesResults[i].y.properties[disease];
                                        //         console.log(disease);
                                        //     };
                                            
                                        //     diseasesTempObject.push(tempObject);
                                        // };
                                    }



                                 
                                    }
                                )};
                        
                            }
                            
                            product.setPreservatives(preservativesTempObject);
                            product.setDiseases(diseasesTempObject);

                            //console.log(JSON.stringify(product));
                        }

                }
                )};    
        });
    }   

});

app.listen(3000, function(){
    console.log('Server Started on port 3000');
});