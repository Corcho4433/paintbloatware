import { serverPath } from "../utils/servers";
import { useState, useEffect } from "react";

// Define the type for user response
type UserResponse = {
  name: string;
  userPfp?: string;
  description?: string;
  // Add more fields as they become available from the server
};

export const useUser = (userId: string) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${serverPath}/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

  const data = await response.json();
  // Support both { user: {...} } and flat user object
  setUser(data.user || data);
  console.log(data.user || data);
  setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  return { user, loading, error };
};