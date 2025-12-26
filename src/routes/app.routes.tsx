import Bookmarks from "@/views/app/bookmarks";
import Archive from "@/views/app/archive";
import History from "@/views/app/history";
import Query from "@/views/app/query";
import Search from "@/views/app/search";
import Setting from "@/views/app/settings";
import ContractDetail from "@/views/app/contract-detail";

export const appRoutes = [
  {
    index: true,
    element: <Search />,
  },
  {
    path: "query",
    element: <Query />,
  },
  {
    path: "contracts/:id",
    element: <ContractDetail />,
  },
  {
    path: "history",
    element: <History />,
  },
  {
    path: "archive",
    element: <Archive />,
  },
  {
    path: "bookmarks",
    element: <Bookmarks />,
  },
  {
    path: "settings",
    element: <Setting />,
  },
];
