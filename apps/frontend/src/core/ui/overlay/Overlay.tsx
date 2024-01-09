import { ContainerProps } from "@/core/types"

export type OverlayProps = ContainerProps 

const Overlay = ({ children }: OverlayProps) => {

    return (
        <div className="absolute inset-0 bg-overlay">
            {children}
        </div>
    )
}

export default Overlay




