import { serverPath } from "../utils/servers";


export async function fetchTrends() {
  return await fetch(`${serverPath}/api/trending/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
}


export async function fetchAllTags() {
    const response = await fetch(`${serverPath}/api/trends/`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
    credentials: "include",
    });

    return response.json().then(data => data.tags);
}