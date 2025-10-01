

export async function fetchTrends() {
  return await fetch("localhost:3000/api/trending/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
}

export async function fetchTrendingPostsForTag(tag: string) {
    return [];
}

export async function fetchAllTags() {
    const response = await fetch("http://localhost:3000/api/tags/", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
    credentials: "include",
    });

    return response.json().then(data => data.tags);
}