import {
  Button,
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
} from "flowbite-react";
import { Link } from "react-router-dom";
import {
  Laugh,
  Smile,
  Meh,
  Frown,
  Angry,
  MessageCircle,
  Send,
  EllipsisVertical,
  LogInIcon,
  House,
  Bomb,
} from "lucide-react";
import { serverPath } from "../utils/servers";
import { PostPage, PostResponse } from "../types/requests";
import { useEffect, useState } from "react";
import { DrawImage } from "../components/drawimage";

const FastDraws = () => {
  const [posts, setPosts] = useState<PostPage | null>(null);
  const [post, setCurrentPost] = useState<PostResponse | null>(null);
  let photoIcon =
    "opacity-50 ease-in-out group-focus:opacity-100 group-hover:scale-116  group-focus:scale-116 group-hover:opacity-100 transition-all duration-600";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const postMutation = async (): Promise<PostPage> => {
    try {
      const response = await fetch(serverPath + "/api/posts");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const pages: PostPage = data as PostPage;
      return pages;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  };

  useEffect(() => {
    postMutation()
      .then((data) => {
        setPosts(data);
        setCurrentPost(data.posts[0]);
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  return (
    <section className=" w-full h-full bg-gray-300 dark:bg-gray-900 min-h-screen flex items-center justify-center px-6 py-8 flex-col space-y-4">
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
            <Link to={"/login"} className="flex flex-row">
              <LogInIcon className="mr-4"></LogInIcon>
              Login
            </Link>
          </SidebarItem>
        </SidebarItemGroup>
      </Sidebar>
      <div className="flex relative">
        <section className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
          {post && post.image_json && (
            <DrawImage image_json={post.image_json} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </section>
        <section className="absolute right-[0px] translate-x-3/2 translate-y-2/4 h-[200px] justify-around flex flex-col bg-gray-800 p-2 rounded-xl">
          <Button className="group focus:outline-none focus:ring-0 !bg-white  dark:!bg-black !border-2 focus:!border-white hover:!border-white  aspect-square !p-0 h-12">
            <MessageCircle
              color={isDark ? "white" : "black"}
              className={photoIcon}
            />
          </Button>
          <Button className="group focus:outline-none !bg-white  dark:!bg-black !border-2 focus:ring-0 focus:!border-white hover:!border-white aspect-square !p-0 h-12">
            <Send color={isDark ? "white" : "black"} className={photoIcon} />
          </Button>
          <Button className="group focus:outline-none !bg-white  dark:!bg-black !border-2 focus:ring-0 focus:!border-white hover:!border-white aspect-square !p-0 h-12">
            {" "}
            <EllipsisVertical
              color={isDark ? "white" : "black"}
              className={photoIcon}
            />
          </Button>
        </section>
      </div>

      <div className="flex mt-3 gap-2 bg-gray-700 p-2 rounded-xl">
        <Button className="group !bg-white  dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-green-500 hover:!border-green-500">
          <Laugh color={isDark ? "white" : "black"} className={photoIcon} />
        </Button>
        <Button className="group !bg-white dark:!bg-black  !border-2 focus:outline-none focus:ring-0 focus:!border-yellow-400 hover:!border-yellow-400">
          <Smile color={isDark ? "white" : "black"} className={photoIcon} />
        </Button>
        <Button className="group !bg-white  dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-gray-400 hover:!border-gray-400">
          <Meh color={isDark ? "white" : "black"} className={photoIcon} />
        </Button>
        <Button className="group !bg-white  dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-red-500 hover:!border-red-500">
          <Frown color={isDark ? "white" : "black"} className={photoIcon} />
        </Button>
        <Button className="group !bg-white  dark:!bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-red-800 hover:!border-red-800">
          <Angry color={isDark ? "white" : "black"} className={photoIcon} />
        </Button>
      </div>
    </section>
  );
};

export default FastDraws;
