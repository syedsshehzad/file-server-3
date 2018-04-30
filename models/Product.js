var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  productName: {
  	type: String,
  	required: true
  }
},
{
	collection: "Product"
});

var Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
