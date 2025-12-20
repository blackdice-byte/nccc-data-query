import Contracts from "@/views/app/contracts";
import Search from "@/views/app/search";
import Setting from "@/views/app/settings";

export const appRoutes = [
  {
    index: true,
    element: <Search />,
  },
  {
    path: "contracts",
    element: <Contracts />,
  },
  {
    path: "settings",
    element: <Setting />,
  },
];
