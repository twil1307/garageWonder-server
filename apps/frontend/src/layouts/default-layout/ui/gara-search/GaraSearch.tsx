import { useState } from "react";
import { createPortal } from "react-dom";

import { Overlay } from "@/core/ui";
import GaraSearchInput from "../gara-search-input";

function GaraSearch() {
    const [hasFocused, setFocused] = useState<boolean>(false);

    const onFocused = () => {
        setFocused(true);
    };

    const onBlurred = () => {
        setFocused(false);
    };

    return (
        <div
            tabIndex={-1}
            className="w-1/2 relative"
            onFocus={onFocused}
            onBlur={onBlurred}
        >
            <GaraSearchInput hasFocused={hasFocused} />
            { hasFocused && 
                createPortal(<Overlay />, document.getElementById("home")!)}
            {
                hasFocused && (
                    <div className="z-10 absolute inset-x-4 min-h-28 bg-white">

                    </div>
                )
            }
        </div>
    );
}

export default GaraSearch;
