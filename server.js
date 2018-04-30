const express = require('express');
const port = 3000;

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mongoose = require('mongoose');
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/fileserveDB";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});
var db = require("./models");


var path = require("path");
app.use(express.static(path.join(__dirname, 'public')));

// Set Handlebars as the default templating engine.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html', err => {if (err) throw err})
});

app.post('/', (req, res) => {
  console.log(req.body);
	let product = req.body.productName;
	let customer = req.body.customerName;

	db.Customer.find({customerName: customer})
		.then(function(cust) {
			console.log("CUST" + cust.length)
			if (cust.length) {
				console.log("CUST" + cust.length)
				console.log(cust)
				db.Product.create({productName: product})
				  .then(function(dbProduct) {
				    return db.Customer.findOneAndUpdate({_id: cust[0]._id}, { $push: { items: dbProduct._id } }, { new: true });
				  })
				  .then(function(dbCustomer) {
				    res.json(dbCustomer);
				  })
				  .catch(function(err) {
				    res.json(err);
				  });
			} else if (!cust.length) {
				db.Customer.create({customerName: customer})
					.then(function(cust) {
						console.log("CUST" + cust)
						db.Product.create({productName: product})
						  .then(function(dbProduct) {
						    return db.Customer.findOneAndUpdate({_id: cust._id}, { $push: { items: dbProduct._id } }, { new: true });
						  })
						  .then(function(dbCustomer) {
						    res.json(dbCustomer);
						  })
						  .catch(function(err) {
						    res.json(err);
						  });
					})
					.catch(function(err) {
						res.json(err);
					});
			}
		})
		.catch(function(err) {
			res.json(err);
		});

});

app.post('/login', (req, res) => {
	// Token is created using Checkout or Elements!
	// Get the payment token ID submitted by the form:
	const email = req.body.email; // Using Express
	console.log(req.body)

	db.Customer.find({customerName: email})
		.populate("items")
		.then(function(data) {
			res.json(data[0])
		})
		.catch(function(err) {
			res.json(err)
		});

  // if (email == "redskins") {
  //   res.sendFile(__dirname + "/public/redskins.jpg")
  // } else if (email == "podo") {
  //   res.sendFile(__dirname + "/public/podo.png")
  // } else if (email == "bear") {
  // 	res.sendFile(__dirname + "/public/BEAR CUB.zip")
  // }

	//res.sendFile(bearRef);
});

app.post('/getfile', (req, res) => {
	console.log(req.body)
	//res.set('Content-Type', 'application/zip')
	res.download(__dirname + '/public/zippedFiles/' + req.body.name + '.zip', 'result.zip')
});

app.listen(port, () => {console.log('listening on port ' + port )});