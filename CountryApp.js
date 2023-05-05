const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const portNumber = 3000;
const axios = require('axios');

app.use(express.static(path.join(__dirname, "templates")));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");



app.use(bodyParser.urlencoded({
    extended: false
}));


process.stdin.setEncoding("utf8");

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

process.stdout.write(`Stop to shutdown the server: `);

process.stdin.on('data', (data) => {
    if (data.toString().trim() === 'stop') {
        console.log('Shutting down the server');
        process.exit(0);
    }
});

//  MongoDB

//database and collection 
//
const databaseAndCollection = {
    db: "CMSC335_FINAL_PROJECT",
    collection: "countryInfo"
};


const {MongoClient,ServerApiVersion} = require('mongodb');

let currCountries = [];

//Clear all entires 
async function main() {
  const uri =  `mongodb+srv://adpp:Vietowers6515@cluster0.5hxwbj3.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  try {
      await client.connect();
      const result = await client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .deleteMany({});

      let count = result.deletedCount;

      

      
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}

main().catch(console.error);
//

app.get("/", (req, res) => {

    res.render("index");
});

app.post("/display", (req, res) => {
    let {countryCode} = req.body;

    //response.data[0]
    // name: common, official
    // currencies: response.data[0].currencies

    //capital: response.data[0].capital[0]
    //population: response.data[0].population
    //continents: response.data[0].continents[0]
    //flag: response.data[0].flags["png"]

    axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`)
        .then(response => {
            

            let commonName = response.data[0].name["common"];
            let offName = response.data[0].name["official"];
            let currencies = JSON.stringify(response.data[0].currencies);
            let capital = response.data[0].capital[0];
            let population = response.data[0].population;
            let continents = response.data[0].continents[0];
            let flag = response.data[0].flags["png"];

            res.render("display", {
                commonName: commonName,
                offName: offName,
                currencies: currencies,
                capital: capital,
                population: population,
                continents: continents,
                flag: flag
            });



            if (!currCountries.includes(commonName)) {

                //Push to databse
                async function main() {
                    const uri = `mongodb+srv://adpp:Vietowers6515@cluster0.5hxwbj3.mongodb.net/?retryWrites=true&w=majority`;

                    const client = new MongoClient(uri, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        serverApi: ServerApiVersion.v1
                    });

                    try {
                        await client.connect();
                        let country = {
                            commonName: commonName,
                            offName: offName,
                            currencies: currencies,
                            capital: capital,
                            population: population,
                            continents: continents,
                            flag: flag
                        };

                        currCountries.push(commonName);
                        

                        await insertStudent(client, databaseAndCollection, country);



                    } catch (e) {
                        console.error(e);
                    } finally {
                        await client.close();
                    }
                }

                async function insertStudent(client, databaseAndCollection, country) {

                    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(country);


                }

                main().catch(console.error);
            }

        })


        .catch(error => {
            console.log(error);
        });

});

app.get("/alreadyPresent", (req, res) => {


  
 

  async function main() {
    const uri = `mongodb+srv://adpp:Vietowers6515@cluster0.5hxwbj3.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
        let filter = {};
        const cursor = client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .find(filter);
        
        const result = await cursor.toArray();

        if(result.length == 0 ) {
          res.render("oops", {count:result.length});
        }
        else {
          
          res.render("alreadPres", {options: currCountries, result: result.length});

        }
        
        

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);


  
})

app.post("/selected", (req, res) => {
  const selectedOption = req.body.option;
  console.log("fksjfgks")
  console.log(selectedOption)

      async function main() {
        const uri = `mongodb+srv://adpp:Vietowers6515@cluster0.5hxwbj3.mongodb.net/?retryWrites=true&w=majority`;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

      
          try {
              await client.connect();
                      
                      
                      await lookUpOneEntry(client, databaseAndCollection, selectedOption);

                     
          } catch (e) {
              console.error(e);
          } finally {
              await client.close();
          }
      }

      async function lookUpOneEntry(client, databaseAndCollection, movieName) {
          let filter = {commonName: movieName};
          const result = await client.db(databaseAndCollection.db)
                              .collection(databaseAndCollection.collection)
                              .findOne(filter);

        if (result) {

          res.render("display", {
            commonName: result.commonName,
            offName: result.offName,
            currencies: result.currencies,
            capital: result.capital,
            population: result.population,
            continents: result.continents,
            flag: result.flag
        });


           
        } else {
            console.log("");
        }
      }



      main().catch(console.error);


})