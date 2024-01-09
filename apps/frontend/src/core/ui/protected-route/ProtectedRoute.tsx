import { ComponentProps } from "react";
import { Route, useNavigate } from "react-router-dom";

export type ProtectedRoute = ComponentProps<typeof Route> & {
    requiredLogin?: boolean,
    hasRoles: string[]
}

function ProtectedRoute({ requiredLogin, hasRoles, ...props }: ProtectedRoute) {
    const navigate = useNavigate();

    if (requiredLogin) {
        // TODO: NEED TO IMPLEMENT
    }

    return <Route {...props}/>
}

export default ProtectedRoute