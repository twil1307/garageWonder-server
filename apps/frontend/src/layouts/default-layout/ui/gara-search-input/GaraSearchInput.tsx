import { Input } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export type GaraSearchInputProps = {
    hasFocused?: boolean;
};

function GaraSearchInput({ hasFocused = false }: GaraSearchInputProps) {
    return (
        <Input
            isClearable
            radius="full"
            placeholder="Search..."
            variant={hasFocused ? "bordered" : "flat"}
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
                inputWrapper: "p-0 h-full",
                input: "pl-0",
            }}
        />
    );
}

export default GaraSearchInput;
