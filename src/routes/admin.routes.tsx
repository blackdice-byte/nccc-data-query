import Contracts from "@/views/app/contracts";

export const adminRoutes = [
  {
    index: true,
    element: <Contracts />,
  },
  {
    path: "contracts",
    element: <Contracts />,
  },
];
