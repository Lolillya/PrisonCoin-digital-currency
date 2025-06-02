import { createBrowserRouter, Navigate } from "react-router-dom";
import DefaultLayout from "../layouts/default-layout";
import LoginPage from "../pages/login/index";
import MainLayout from "../layouts/main-layout";
import DashboardPage from "../pages/admin/dashboard/index";
import ResgisterPage from "../pages/admin/register/index";
import CheckBalancePage from "../pages/admin/check-balance";
import TransactionPage from "../pages/admin/transaction";

export const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "admin/dashboard",
        children: [
          {
            path: "home/",
            element: <DashboardPage />,
          },
          {
            path: "register/",
            element: <ResgisterPage />,
          },
          {
            path: "check-balance/",
            element: <CheckBalancePage />,
          },
          {
            path: "transactions/",
            element: <TransactionPage />,
          },
        ],
      },
    ],
  },
]);
