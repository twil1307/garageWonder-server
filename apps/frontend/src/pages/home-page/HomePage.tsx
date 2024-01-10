import { faFilter, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@nextui-org/react";

const HomePage = () => {
    return (
        <div id="home" className="px-10">
            <div className="TopBar flex my-8">
                <div className="basis-1/12">
                    <Button
                        variant="bordered"
                        color="default"
                        className="border-black border"
                    >
                        <FontAwesomeIcon icon={faFilter} />
                        <p>Sort By</p>
                    </Button>
                </div>
                <div className="flex-grow flex justify-center">
                    <Button color="primary" radius="full">
                        Category 1
                    </Button>
                    <Button variant="light" radius="full">
                        Category 2
                    </Button>
                    <Button variant="light" radius="full">
                        Category 3
                    </Button>
                    <Button variant="light" radius="full">
                        Category 4
                    </Button>
                    <Button variant="light" radius="full">
                        Category 5
                    </Button>
                </div>
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
