import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
} from "flowbite-react";
import { Link } from "react-router-dom";
import {
  LogInIcon,
  House,
  Bomb,
  PencilIcon
} from "lucide-react";    

const PaintSidebar = () => {
    
    return (
    <Sidebar className="absolute left-0 h-full rounded-2xl">
        <div className="flex justify-center"> <Bomb size={100}></Bomb></div>

        <SidebarItemGroup>

            <SidebarItem>
                <Link to={"/home"} className="flex flex-row">
                <House className="mr-4"></House>
                Home
                </Link>
            </SidebarItem>
            <SidebarItem>
                <Link to={"/fastdraws"} className="flex flex-row">
                <Bomb className="mr-4"></Bomb>
                Fast Draws
                </Link>
            </SidebarItem>
            <SidebarItem>
                <Link to={"/draw"} className="flex flex-row">
                <PencilIcon className="mr-4"></PencilIcon>
                Draw
                </Link>
            </SidebarItem>
            <SidebarItem>
                <Link to={"/login"} className="flex flex-row">
                <LogInIcon className="mr-4"></LogInIcon>
                Register
                </Link>
            </SidebarItem>
            
        </SidebarItemGroup>
      </Sidebar>
    );
}

export default PaintSidebar;