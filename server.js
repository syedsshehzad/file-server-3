// SERVER.JS
const express = require('express');
const port = process.env.PORT || 3000;
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use( function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

var mongoose = require('mongoose');
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/fileserveDB";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
var db = require("./models");

var path = require("path");
app.use(express.static(path.join(__dirname, 'public')));

// Set Handlebars as the default templating engine.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.get('/', (req, res) => {
	res.sendFile('index.html', err => {if (err) throw err})
});

app.post('/create', (req, res) => {
	console.log("****************************REQ.BODY********************");
	console.log(req.body)
	let items = req.body.items;
	let customer = req.body.email;

	items.forEach(function(item) {
		let product = item.name;

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
	})

});

app.post('/login', (req, res) => {
	const email = req.body.email;
	console.log(req.body);

	db.Customer.find({customerName: email})
		.populate("items")
		.then(function(data) {
			console.log(data)
			if (data.length) {
				res.json(data[0])
			}
			if (!data.length) {
				res.json("No items for " + email)
			}
		})
		.catch(function(err) {
			res.json(err)
		});
});

app.listen(port, () => {console.log('listening on port ' + port )});