const validateIfExists = (collection, listIds = []) => {
	const notFound = listIds.some((
		id
	) =>
		!db[collection].find((element => element.id === id)));
	if (notFound) {
		throw new Error(`Your try to add a ${collection} which not exists.`)
	}
}

const getId = (collection) => {
	const lastElement = db[collection][db[collection].length - 1];
	return lastElement ? calculateIndex(lastElement.id) : '1'
}
