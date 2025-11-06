import { useMutation } from "@tanstack/react-query";
import { serverPath } from "../utils/servers";
import { useAuthStore } from "../store/useAuthStore";
import { LoginUserRequest, LoginUserResponse, RegisterUserRequest, RegisterUserResponse } from "../types/requests";
import { fetchAuthMe } from "./user";
import {  useNavigate } from "react-router-dom";

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
      
      // If still 401 after refresh, don't retry again to avoid infinite loop
      if (res.status === 401) {
        // Clear auth state and redirect to login
        useAuthStore.getState().logout();
        window.location.href = "/login"
        throw new Error("Session expired, please log in again");
      }
    } else {
      useAuthStore.getState().logout();
      window.location.href = "/login"
      throw new Error("Session expired, please log in again");
    }
  }

  return res;
};

// Custom hook for user registration
export const useRegisterMutation = () => {
  const navigate = useNavigate()
  
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
        const errorData = await response.json();
        // Lanza el error con el mensaje del servidor
        throw new Error(errorData.error.message || errorData.error.code || "Registration failed");
      }
      
      const responseJSON = await response.json();
      return responseJSON;
    },
    onSuccess: async (response) => {
      if (response.success) {
        await fetchAuthMe();
        navigate("/");
      }
    },
  });
};

// Custom hook for user login
export const useLoginMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (loginUser: LoginUserRequest): Promise<LoginUserResponse> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginUser),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        // Lanza el error con el mensaje del servidor
        console.log("Error data from server:", errorData);
        throw new Error(errorData.error.message || errorData.error.code || "Login failed");
      }
      return response.json();
    },
    onSuccess: async (response) => {
      await fetchAuthMe();
      if (!response.success) {
        throw new Error("Login failed");
      }
      navigate("/");
    },
  });
};

export default fetchWithRefresh;