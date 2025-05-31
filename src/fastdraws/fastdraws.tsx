import { Button } from "flowbite-react";
import {
  Laugh,
  Smile,
  Meh,
  Frown,
  Angry,
  MessageCircle,
  Send,
  EllipsisVertical
} from "lucide-react";

const FastDraws = () => {
  return (
    <section className="bg-gray-50 w-full dark:bg-gray-900 min-h-screen flex items-center justify-center px-6 py-8 flex-col space-y-4">
      <div className="flex relative">
      <section className="bg-black w-[400px] h-[400px] rounded-xl relative" > 

      </section>   
      <section className="absolute right-[0px] translate-x-3/2 translate-y-2/4 h-[200px] justify-around flex flex-col bg-gray-800 p-2 rounded-xl"> 
        <Button className="focus:outline-none focus:ring-0 hover:!border-white aspect-square !p-0 h-12"><MessageCircle /></Button>
        <Button className="focus:outline-none focus:ring-0 hover:!border-white aspect-square !p-0 h-12"><Send /></Button>
        <Button className="focus:outline-none focus:ring-0 hover:!border-white aspect-square !p-0 h-12"> <EllipsisVertical /></Button>
      </section>
      </div> 
      
      <div className="flex mt-3 gap-2 bg-gray-700 p-2 rounded-xl">
        <Button className=" focus:outline-none focus:ring-0 hover:!border-green-500" ><Laugh /></Button>
        <Button className="focus:outline-none focus:ring-0 hover:!border-yellow-400"><Smile /></Button>
        <Button className="focus:outline-none focus:ring-0 hover:!border-gray-400"><Meh /></Button>
        <Button className="focus:outline-none focus:ring-0 hover:!border-red-500"><Frown /></Button>
        <Button  className="focus:outline-none focus:ring-0 hover:!border-red-800"><Angry /></Button>
      </div>
    </section>
  );
};

export default FastDraws;
