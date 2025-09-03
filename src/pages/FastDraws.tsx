import {
  Button,
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
} from "lucide-react";
import { serverPath } from "../utils/servers";
import { PostPage, PostResponse } from "../types/requests";
import { useEffect, useState } from "react";
import { DrawImage } from "../components/drawimage";
import { useAuthStore } from "../store/useAuthStore";
import PaintSidebar from "../components/paintsidebar";
import { usePosts } from "../hooks/posts";

const FastDraws = () => {
  const { posts, loading, error } = usePosts();
  console.log("Posts loaded:", posts);
  console.log("Loading state:", loading);
  console.log("Error state:", error);

  //const user = useAuthStore((state) => state);
  /*   const handleLogout = () => {
      useAuthStore.logout();
    }; */
  let photoIcon =
    "opacity-50 ease-in-out group-focus:opacity-100 group-hover:scale-116  group-focus:scale-116 group-hover:opacity-100 transition-all duration-600";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <div className="flex">
      <PaintSidebar />

      <section className="flex-1 ml-0 min-h-screen w-full h-full bg-gray-300 dark:bg-gray-900  flex items-center justify-center px-6 flex-col space-y-4">

        <div className="flex relative">
          <section className="bg-gradient-to-br from-gray-900 to-black w-[512px] h-[512px] rounded-xl flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-all duration-300">
            {!loading ? (
              !error ? (
                // <DrawImage image_json={posts?.posts[0].image_json ?? []} />
                <img
                  src={posts?.posts[1].url_bucket}
                  alt="Post Image"
                  width={512}
                  height={512}
                  style={{
                    imageRendering: 'pixelated',
                    width: '512px',
                    height: '512px',
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 via-red-700 to-black text-white font-bold rounded-xl">
                  Error loading posts
                </div>
              )

            ) : <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}

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
    </div>
  );
};

export default FastDraws;
