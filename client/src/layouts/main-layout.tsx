import { Outlet } from "react-router-dom";
import SideBar from "../components/ui/sidebar";

const MainLayout = () => {
  return (
    <main>
      <SideBar />
      <Outlet />
    </main>
  );
};

export default MainLayout;
