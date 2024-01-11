import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Selection } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import sortByOptions from "./constant";
import SortByButton from "./SortByButton";
import { useMemo, useState } from "react";
import clsx from "clsx";

export type Key = string | number

function SortBy() {
    const [selectedSortByOptionSet, setSelectedSortByOptionSet] = useState(new Set<Key>([]));
    const [isSortByMenuOpen, setSortByMenuOpen] = useState<boolean>(false)

    const onSortBySelectionChange = (key: Selection) => {
        if (typeof key !== "string") {
            setSelectedSortByOptionSet(key)
        } 
    }

    const selectedSortByOption = useMemo(() => {
        const selectedKey = Array.from(selectedSortByOptionSet)[0]

        if (selectedKey) {
            return sortByOptions.find(({ key }) => key === selectedKey)
        } 
            
        return undefined;
    }, [selectedSortByOptionSet])

    const onSortByMenuOpenChange = (isOpen: boolean) => {
        setSortByMenuOpen(isOpen)
    }

    return (
        <Dropdown 
            classNames={{ base: "left-7"}}
            onOpenChange={onSortByMenuOpenChange}    
        >
            <DropdownTrigger>
                <SortByButton className={clsx("border", isSortByMenuOpen && "border-black")}>
                    {selectedSortByOption ? selectedSortByOption.title : "Sort By" }
                </SortByButton>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Sort By Menu"
                selectionMode="single"
                selectedKeys={selectedSortByOptionSet as Iterable<Key>}
                onSelectionChange={onSortBySelectionChange}
            >
                {sortByOptions.map(({ key, title, icon }) => (
                    <DropdownItem key={key} startContent={<FontAwesomeIcon icon={icon} />}>
                        {title}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}

export default SortBy;