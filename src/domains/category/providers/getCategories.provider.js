import categoryRepository from "../category.repository";

export const getCategories = () => {
	return categoryRepository.getCategories();
};
