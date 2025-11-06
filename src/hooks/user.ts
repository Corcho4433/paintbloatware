import { serverPath } from "../utils/servers";
import { useState, useEffect, useCallback } from "react";
import fetchWithRefresh from "./authorization";
import { type UserInfo, type UserResponse } from "../types/requests";
import { useAuthStore } from "../store/useAuthStore";
// Define the type for user response




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

export const useUserInfo = (userId?: string) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetchWithRefresh(`${serverPath}/api/users/info/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setUser(data.user || data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, fetchUser };
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


interface AuthMeResponse {
  data:{id: string;
  pfp?: string;
  admin?: boolean;
  nitro?: boolean;}
}

export const fetchAuthMe = async (): Promise<boolean> => {
  try {
    const response = await fetchWithRefresh(`${serverPath}/api/auth/me`, {
      credentials: 'include',
    });


    const result: AuthMeResponse = await response.json();
    // Actualizar el store
    const data = result.data;
    useAuthStore.getState().setUser({
      id: data.id,
      pfp: data.pfp,
      admin: data.admin,
      nitro: data.nitro,
    });
    console.log(useAuthStore.getState().user)

    return true;
  } catch (error) {
    console.error('Failed to fetch auth me:', error);
    useAuthStore.getState().setUser(null as any);
    return false;
  }
};