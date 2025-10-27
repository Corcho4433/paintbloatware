
import { Button } from "flowbite-react";
import { Laugh, Angry } from "lucide-react";
import { useRatings } from "../hooks/ratings";
import { useAuthStore } from "../store/useAuthStore";

interface LikeButtonsProps {
  postId: string;
  ratingValue: number;
  onReactionClick: (value: 1 | -1) => void;
  isAnimating: boolean;
  photoIcon: string;
}

export const LikeButtons = ({ 
  postId, 
  ratingValue, 
  onReactionClick, 
  isAnimating,
  photoIcon 
}: LikeButtonsProps) => {
  // Exit early if no postId - render disabled buttons
  if (!postId || useAuthStore.getState().user == null) {
    return (
      <div className="flex w-[30%] gap-2 p-2 rounded-xl justify-center mx-auto">
        <Button 
          disabled
          className="border-gray-500 group animate-pulse !bg-black !border-2 opacity-50"
        >
          <Laugh className={photoIcon } />
        </Button>
        <Button 
          disabled
          className="border-gray-500 group animate-pulse !bg-black !border-2 opacity-50"
        >
          <Angry className={photoIcon} />
        </Button>
      </div>
    );
  }

  // Safe to call hook now since we have a valid postId
  const { liked, disliked, toggleLike, toggleDislike } = useRatings(postId, ratingValue);

  const handleLike = () => {
    if (!isAnimating) {
      toggleLike();
      onReactionClick(1);
    }
  };

  const handleDislike = () => {
    if (!isAnimating) {
      toggleDislike();
      onReactionClick(-1);
    }
  };

  return (
    <div className="flex w-[30%]  gap-2 bg-gray-700 p-2 rounded-xl justify-center mx-auto">
      <Button 
        onClick={handleLike}
        className={`border-gray-500 group cursor-pointer !bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-green-500 ${
          liked ? 'border-green-500' : ''
        } hocus:!border-green-500`}
      >
        <Laugh className={`${photoIcon} group-hocus:text-green-400 group-focus:text-green-400`} />
      </Button>

      <Button 
        onClick={handleDislike}
        className={`border-gray-500 group cursor-pointer !bg-black !border-2 focus:outline-none focus:ring-0 focus:!border-red-800 hocus:!border-red-800 ${
          disliked ? 'border-red-800' : ''
        }`}
      >
        <Angry className={`${photoIcon} group-hocus:text-red-500 group-focus:text-red-500`} />
      </Button>
    </div>
  );
};