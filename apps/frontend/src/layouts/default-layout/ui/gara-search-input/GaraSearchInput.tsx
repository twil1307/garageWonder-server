import { Input } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

export type GaraSearchInputProps = {
    hasFocused?: boolean;
};

function GaraSearchInput({ hasFocused = false }: GaraSearchInputProps) {
    return (
        <Input
            radius="full"
            placeholder="Search..."
            variant="bordered"
            isClearable
            startContent={
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    size="1x"
                    color={hasFocused ? "#000" : "#818181"}
                    className="px-4 "
                />
            }
            className="w-full h-11"
            classNames={{
                inputWrapper: clsx(
                    "p-0 h-full",
                    hasFocused && "border-default-foreground",
                ),
                input: "pl-0",
            }}
        />
    );
}

export default GaraSearchInput;
