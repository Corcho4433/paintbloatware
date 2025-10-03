import { serverPath } from "../utils/servers";

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
export default fetchWithRefresh;