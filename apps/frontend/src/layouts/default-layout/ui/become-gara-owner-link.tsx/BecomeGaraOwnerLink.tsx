import { Link } from "@nextui-org/react";

function BecomeGaraOwnerLink() {
    return (
        <Link href="/gara-registration" color="foreground" underline="hover">
            <p className="font-medium">Become Garage Owner</p>
        </Link>
    );
}

export default BecomeGaraOwnerLink;
