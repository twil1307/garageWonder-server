import { forwardRef } from 'react'
import { Button } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export type SortByButtonProps = React.ComponentProps<typeof Button>

const SortByButton = forwardRef<
    HTMLButtonElement, 
    SortByButtonProps>
(({ children, ...props }, ref) => {

    return (
        <Button
            variant="bordered"
            color="default"
            startContent={<FontAwesomeIcon icon={faFilter} />}
            ref={ref}
            {...props}
        >
            <span>{children}</span>
        </Button>
    )
})

export default SortByButton;