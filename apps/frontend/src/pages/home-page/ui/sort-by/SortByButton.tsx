import { forwardRef } from 'react'
import { Button } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export type SortByButtonProps = React.ComponentProps<typeof Button>

const SortByButton = forwardRef<HTMLButtonElement, SortByButtonProps>((props, ref) => {

    return (
        <Button
            variant="bordered"
            color="default"
            className="border-black border"
            startContent={<FontAwesomeIcon icon={faFilter} />}
            ref={ref}
            {...props}
        >
            <span>Sort By</span>
        </Button>
    )
})

export default SortByButton;