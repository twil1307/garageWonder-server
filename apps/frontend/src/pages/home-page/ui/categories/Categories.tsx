import CategoryOption from "../category-option";

import categories from './constant'

function Categories() {
    return (
        <div
            className="flex-grow flex justify-center gap-2"
            role="radiogroup"
        >
            {categories.map(category => (
                <CategoryOption 
                    category={category} 
                    key={category.key} 
                />
            ))}
        </div>
    )
}

export default Categories;