import { faArrowDownWideShort, faArrowUpWideShort } from "@fortawesome/free-solid-svg-icons";

const sortByOptions = [
    {
        key: "latest",
        title: "Latest",
        icon: faArrowUpWideShort
    },
    {
        key: "oldest",
        title: "Oldest",
        icon: faArrowDownWideShort
    },
    {
        key: "desc",
        title: "Price Desc",
        icon: faArrowUpWideShort
    },
    {
        key: "asc",
        title: "Price Asc",
        icon: faArrowDownWideShort
    },
]

export default sortByOptions