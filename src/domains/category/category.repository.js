class Category {
	elements = []

	getCategories() {
		return this.elements;
	}
	addCategory(category) {
		return this.elements.push(category);
	}
}

export default new Category();
