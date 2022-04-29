import {DbCollectionEnum} from "../../../infraestructure/dbCollection.enum";
import CategoryRepository from "../category.repository";

export const createCategory = ({name}) => {
	const id = getId(DbCollectionEnum.categories);
	const category = {
		id,
		name
	};
	CategoryRepository.addCategory(category);
	return category;
}
