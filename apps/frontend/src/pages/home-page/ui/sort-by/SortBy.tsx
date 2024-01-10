import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import sortByOptions from "./constant";
import SortByButton from "./SortByButton";

function SortBy() {

    return (
        <Dropdown classNames={{
            base: "left-7"
        }}>
            <DropdownTrigger>
                <SortByButton />  
            </DropdownTrigger>
            <DropdownMenu>
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