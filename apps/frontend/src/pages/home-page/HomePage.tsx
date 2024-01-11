import { faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@nextui-org/react";

import { Categories, SortBy } from "./ui";

const HomePage = () => {
    return (
        <div id="home" className="px-10">
            <div className="TopBar flex my-8 items-center">
                <div className="">
                    <SortBy />
                </div>
                <Categories />
                <div className="basis-1/12 flex justify-end">
                    <Button
                        variant="bordered"
                        color="default"
                        className="border-black border"
                    >
                        <FontAwesomeIcon icon={faSliders} />
                        <p>Filter</p>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
