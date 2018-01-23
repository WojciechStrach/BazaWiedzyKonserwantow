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
                        

                        function diseasesCallback(_callback, tabLength){

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

                                            let filteredDiseaseResults = [];
                                            
                                            for(let z=0; z<diseasesResults.length; z++){
                                                for(let value in diseasesResults[z]){
                                                    if(diseasesResults[z][value] !== null){
                                                        filteredDiseaseResults.push(diseasesResults[z][value]);
                                                    }
                                                }
                                            }


                                            for(let y=0; y<filteredDiseaseResults.length; y++){
                                                for(let filter in filteredDiseaseResults[y].properties){
                                                    diseasesTempObject.push(filteredDiseaseResults[y].properties[filter]);
                                                    //console.log(diseasesTempObject);
                                                }
                                            }

                                            
                                            tabLength--;
                                            if (tabLength === 0) {
                                                _callback();
                                            }
                                            
                                        }



                                        
                                        }
                                    )};
                                    
                                }

                            }

                            diseasesCallback(function(){

                                //console.log('________________________');
                                //console.log(diseasesTempObject);

                                product.setPreservatives(preservativesTempObject);

                                let uniqueDiseases = []
                                for(let p = 0;p < diseasesTempObject.length; p++){
                                    if(uniqueDiseases.indexOf(diseasesTempObject[p]) == -1){
                                       uniqueDiseases.push(diseasesTempObject[p])
                                    }
                                }

                                product.setDiseases(uniqueDiseases);

                                db.cypher({
                                    query: 'MATCH (x:Nazwa {Nazwa: {ownerSearch}})' +
                                           'MATCH (x)-[:Jest_instancją]->(y)' +
                                           'MATCH (y)<-[:Jest_właścicielem]-(z)' +
                                           'RETURN z' ,
                                    params: { 
                                        ownerSearch: searchValue,
                                    },
                                }, function (ownerErr, ownerResults) {
                        
                                    if (ownerErr) {
                                        console.log(ownerErr);
                                        res.status(400).send('<h4>Unexpecting error occured ' + ownerErr + '</h4>');
                                    }
                        
                                    var ownerResult = ownerResults[0];
                                    if (!ownerResult) {
                                        
                                    } else {
                                        
                                        product.setProductOwner(ownerResults[0].z.properties.Producent);

                                        db.cypher({
                                            query: 'MATCH (x:Nazwa {Nazwa: {typeSearch}})' +
                                                   'MATCH (x)-[:Jest_instancją]->(y)' +
                                                   'MATCH (y)-[:Jest_instancją]->(z)' +
                                                   'RETURN z' ,
                                            params: { 
                                                typeSearch: searchValue,
                                            },
                                        }, function (typeErr, typeResults) {
                                
                                            if (typeErr) {
                                                console.log(typeErr);
                                                res.status(400).send('<h4>Unexpecting error occured ' + typeErr + '</h4>');
                                            }
                                
                                            var typeResult = typeResults[0];
                                            if (!typeResult) {
                                                
                                            } else {

                                                product.setProductType(typeResults[0].z.properties.Rodzaj);

                                                res.json(product);
                                            }
                                        });
                                    }
                                });

                            },preservativesTempObject.length);
                            
                            

                            
                        }

                }
                )};    
        });
    }   

});

app.listen(3000, function(){
    console.log('Server Started on port 3000');
});