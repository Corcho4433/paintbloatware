import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { serverPath } from "../utils/servers";
import { useAuthStore } from "../store/useAuthStore";
import { LoginUserRequest, LoginUserResponse, RegisterUserRequest, RegisterUserResponse } from "../types/requests";

const fetchWithRefresh = async (input: RequestInfo | URL, init?: RequestInit) => {
  let res = await fetch(input, init);

  if (res.status === 401) {
    // Try to refresh the tokens
    const refreshRes = await fetch(serverPath + "/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Retry the original request after refreshing
      res = await fetch(input, init);
    } else {
      throw new Error("Session expired, please log in again");
    }
  }

  return res;
};

// Custom hook for user registration
export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (newUser: RegisterUserRequest): Promise<RegisterUserResponse> => {
      const response = await fetch(serverPath + "/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }
      const responseJSON = await response.json();
      return responseJSON;
    },
    onSuccess: (response) => {
      if (response.success) {
        setUser({ id: response.data.id, pfp: response.data.pfp });
        navigate("/");
      }
    },
  });
};

// Custom hook for user login
export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (loginUser: LoginUserRequest): Promise<LoginUserResponse> => {
      const response = await fetch(serverPath + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginUser),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    },
    onSuccess: (response) => {
      console.log("Full response:", response);

      if (!response.success) {
        throw new Error("Login failed");
      }

      // Create user object directly from response
      const user = {
        id: response.data.id,
        pfp: response.data.pfp
      };

      setUser(user);
      navigate("/");
    },
  });
};

export default fetchWithRefresh;