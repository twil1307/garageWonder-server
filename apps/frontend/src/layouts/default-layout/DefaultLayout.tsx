import { Outlet } from "react-router-dom";

import { BrandLogo, Header } from "@/core/ui";
import { BecomeGaraOwnerLink, UserProfileMenu, GaraSearch } from "./ui";

const DefaultLayout = () => {
    return (
        <div data-testid={DefaultLayout.name}>
            <Header
                leftContent={<BrandLogo />}
                middleContent={<GaraSearch />}
                rightContent={
                    <>
                        <BecomeGaraOwnerLink />
                        <UserProfileMenu />
                    </>
                }
            />
            <Outlet />
        </div>
    );
};

export default DefaultLayout;
