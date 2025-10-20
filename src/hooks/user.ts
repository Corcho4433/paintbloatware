import { serverPath } from "../utils/servers";
import { useState, useEffect } from "react";
import fetchWithRefresh from "./authorization";
import { useNavigate } from "react-router-dom";

// Define the type for user response
type UserResponse = {
  id?: string;
  name: string;
  urlPfp?: string; // Add this to match backend response
  description?: string;
  // Add more fields as they become available from the server
};

type UserInfo = {
  id: string;
  email: string;
  name: string;
  description: string;
  urlPfp: string;
  oauth: boolean;
}

// Profile update types
export type ProfileUpdateData = {
  id: string;
  name: string;
  email: string;
  description: string;
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

export const useUserInfo = (userId: string | undefined) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchWithRefresh(`${serverPath}/api/users/info/${userId}`, {
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

// API function to update profile information (name, email, bio)
export const updateProfileInfo = async (profileData: ProfileUpdateData): Promise<UserInfo> => {
  const response = await fetchWithRefresh(`${serverPath}/api/users/info/${profileData.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    throw new Error('Failed to update profile information');
  }

  const data = await response.json();
  return data.user || data;
};


export const deleteProfile = async (userId: string): Promise<boolean> => {
  const response = await fetchWithRefresh(`${serverPath}/api/users/delete/${userId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  

  if (!response.ok) {
    throw new Error('Failed to delete profile');
  }

  return true;
};

// API function to upload profile image file
export const uploadProfileImageFile = async (file: File): Promise<any> => {
  const formData = new FormData();
  // The field name should match what your multer uploadSingle expects: "pfp"
  formData.append('pfp', file);

  const response = await fetchWithRefresh(`${serverPath}/api/pfp`, {
    method: 'PUT',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload profile image');
  }

  const data = await response.json();
  // Your backend returns { message: "Foto de perfil actualizada exitosamente", pfp: updatedPfp }
  return data.pfp || data;
};

export const LogoutUser = async (): Promise<boolean> => {
  const response = await fetchWithRefresh(`${serverPath}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to logout');
  }

  return true;
};