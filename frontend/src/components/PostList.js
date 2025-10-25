import React, { useEffect, useState } from "react";
import axios from "axios";

function PostList({ token, refreshKey }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/posts/", {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshKey]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) return <p className="text-center mt-4">Loading posts...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      {posts.length === 0 ? (
        <p className="text-center text-gray-600">No posts available</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-[1.01]"
          >
            <h2 className="text-xl font-bold text-gray-800">{post.title}</h2>
            <p className="mt-2 text-gray-700">{post.content}</p>
            <div className="mt-4 text-sm text-gray-500">
              <span>Author: {post.user?.username || "Anonymous"}</span>
              <span className="ml-4">
                Created at: {new Date(post.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PostList;
