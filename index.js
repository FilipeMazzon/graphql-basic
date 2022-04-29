const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');

const DbCollectionEnum = {
	products: 'products',
	orders: 'orders',
	categories: 'categories'
}

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
  type Mutation {
	  createCategory(name: String!): Category,
	  createProduct(name: String!, categories: [ID!], price: Float!): Product,
	  createOrder(products: [ID!]): Order,
	}
`);

const calculateIndex = (index) => {
	return (parseInt(index, 10) + 1).toString();
}

const getId = (collection) => {
	const lastElement = db[collection][db[collection].length - 1];
	return lastElement ? calculateIndex(lastElement.id) : '1'
}

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
		return aggregateProduct(productFound);
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

const validateIfExists = (collection, listIds = []) => {
	const notFound = listIds.some((
		id
	) =>
		!db[collection].find((element => element.id === id)));
	if (notFound) {
		throw new Error(`Your try to add a ${collection} which not exists.`)
	}
}

const createCategory = ({name}) => {
	const id = getId(DbCollectionEnum.categories);
	const category = {
		id,
		name
	};
	db.categories.push(category);
	return category;
}

const createProduct = ({name, categories, price}) => {
	const id = getId(DbCollectionEnum.products);
	validateIfExists(DbCollectionEnum.categories, categories);
	const product = {
		id,
		name: name,
		categories: categories,
		price: price
	}
	db.products.push(product);
	return aggregateProduct(product);
}

const createOrder = (order) => {
	const id = getId(DbCollectionEnum.orders);
	validateIfExists(DbCollectionEnum.products, order.products);
	const newOrder = {
		id,
		products: order.products
	}
	db.orders.push(newOrder)
	return aggregateOrder(newOrder);
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
	},
	createCategory,
	createProduct,
	createOrder
};

const app = express();
app.use('/graphql', graphqlHTTP({
	schema,
	rootValue: root,
	graphiql: true
}));

app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql')
