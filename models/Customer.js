var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
	customerName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: false
	},
	items: [{ type: Schema.Types.ObjectId, ref: "Product" }]
},
{
	collection: "Customer"
});

var Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;