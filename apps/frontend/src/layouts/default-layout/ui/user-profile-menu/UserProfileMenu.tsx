import { faBars, faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from "@nextui-org/react";
import userProfileMenuSections from "./constant";

function UserProfileMenu() {
    return (
        <Dropdown
            classNames={{
                base: "right-8",
                content: "px-0",
            }}
        >
            <DropdownTrigger>
                <Button
                    radius="full"
                    variant="bordered"
                    className="px-1 min-w-0 border"
                >
                    <FontAwesomeIcon icon={faBars} className="px-2" />
                    <FontAwesomeIcon icon={faCircleUser} size="2x" />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="User menu"
                classNames={{
                    base: "px-0 py-2",
                }}
            >
                {userProfileMenuSections.map((section, index) => (
                    <DropdownSection
                        key={index}
                        showDivider={
                            index !== userProfileMenuSections.length - 1
                        }
                    >
                        {section.options.map(({ title, key }) => (
                            <DropdownItem
                                key={key}
                                aria-label={title}
                                classNames={{
                                    base: "rounded-none p-0",
                                    title: "hover:font-semibold py-2 px-4"
                                }}
                            >
                                {title}
                            </DropdownItem>
                        ))}
                    </DropdownSection>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}

export default UserProfileMenu;
