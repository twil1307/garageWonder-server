import { useMemo, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Selection } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import sortByOptions from "./constant";
import SortByButton from "../sort-by-button";

import clsx from "clsx";
import { useSearchParams } from "react-router-dom";

export type Key = string | number

function SortBy() {
    const [filterSearchParams, setFilterSearchParams] = useSearchParams();
    const selectedSortByOptionSet = useMemo(() => new Set<string>([filterSearchParams.get("sortBy") || ""]), [filterSearchParams])
    const [isSortByMenuOpen, setSortByMenuOpen] = useState<boolean>(false);

    const onSortBySelectionChange = (key: Selection) => {
        if (typeof key !== "string") {
            const selectedKey = Array.from(key)[0] as string
            
            setFilterSearchParams(prev => {
                if (selectedKey === undefined) {
                    prev.delete("sortBy")
                } else {
                    prev.set("sortBy", selectedKey)
                }

                return prev;
            })
        } 
    }

    const selectedSortByOption = useMemo(() => {
        const selectedKey = filterSearchParams.get("sortBy")

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
            disableAnimation   
        >
            <DropdownTrigger>
                <SortByButton className={clsx("border capitalize", isSortByMenuOpen && "border-black")}>
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
                    <DropdownItem 
                        key={key} 
                        startContent={<FontAwesomeIcon icon={icon} />} 
                        classNames={{ title: "capitalize" }}
                    >
                        {title}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}

export default SortBy;