const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');


const db = {
	products: [
		{
			id: '1',
			name: 'mochila',
			price: 100,
			categories: ['2']
		},
		{
			id: '2',
			name: 'tennis',
			price: 200,
			categories: ['1']
		},
	],
	categories: [
		{
			id: '1',
			name: 'calçados'
		},
		{
			id: '2',
			name: 'escolar'
		}
	],
	orders: [
		{
			id: '1',
			products: ['1'],
		},
		{
			id: '2',
			products: ['2']
		},
		{
			id: '3', products: ['1', '2']
		}
	]
}
const schema = buildSchema(`
  type Query {
    hello: String,
    products: [Product],
    categories: [Category],
    orders: [Order]
  }
  type Product {
    id: ID!,
    name: String,
    price: Float,
    categories: [Category]
  }
  type Category {
    id: ID!,
    name: String
  }
  type Order {
    id: ID!,
    products: [Product],
    totalPrice: Float,
  }
`);


const aggregateProduct = (product) => {
	return {
		...product,
		categories: product.categories.map((category) => {
			return db.categories.find(categoryInList => categoryInList.id === category);
		})
	}
}
const handleProduct = (productSearch) => {
	const productFound = db.products.find(product => product.id === productSearch);
	if (productFound.categories?.length) {
		return aggregateProduct(productFound)
	}
	return productFound;
}

const calculateTotalPrice = (products) => {
	return products.reduce((totalPrice, product) => totalPrice + product.price, 0);
}
const aggregateOrder = (order) => {
	const products = order.products.map(handleProduct);
	return {
		...order,
		products,
		totalPrice: calculateTotalPrice(products)
	}
}
const root = {
	hello: () => {
		return 'Hello World!';
	},
	products: () => {
		return db.products.map(aggregateProduct);
	},
	categories: () => {
		return db.categories;
	},
	orders: () => {
		return db.orders.map(aggregateOrder);
	}
};

const app = express();
app.use('/graphql', graphqlHTTP({
	schema,
	rootValue: root,
	graphiql: true
}));

app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql')
