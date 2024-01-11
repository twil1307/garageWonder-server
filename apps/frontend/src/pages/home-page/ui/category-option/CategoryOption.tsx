import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "react-router-dom";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

import clsx from "clsx";
import { useMemo } from "react";

export type CategoryOptionProps = {
    category: {
        key: string,
        title: string,
        value: string,
        icon: IconProp
    }
}

function CategoryOption({ category }: CategoryOptionProps) {
    const [filterSearchParams, setFilterSearchParams] = useSearchParams();
    const isSelected = useMemo(() => {
        const filteredCategory = filterSearchParams.get("category")

        return filteredCategory === category.value
    }, [filterSearchParams])


    const onCategoryOptionSelect = () => {
        setFilterSearchParams(prev => {
            prev.set("category", category.value)

            return prev;
        })
    }
    
    return (
        <div 
            role="radio" 
            className={clsx(
                "flex flex-col items-center cursor-pointer transition px-2",
                "hover:opacity-70",
                isSelected && "border-b-2 border-black"
            )} 
            onClick={onCategoryOptionSelect}
            aria-label={`${category.value} option`}
        >
            <div>
                <FontAwesomeIcon icon={category.icon} />
            </div>
            <p className="capitalize">{category.title}</p>
        </div>
    )
}

export default CategoryOption;