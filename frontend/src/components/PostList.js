import React, { useEffect, useState } from "react";
import axios from "axios";
import EditPostModal from "./EditPostModal";

function PostList({ token, refreshKey, onPostDeleted }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null); // új

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

  const handleDelete = async (id) => {
    if (!window.confirm("Biztosan törlöd a posztot?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/posts/${id}/`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });
      setPosts(posts.filter((post) => post.id !== id));
      if (onPostDeleted) onPostDeleted(id);
    } catch (err) {
      console.error(err);
      alert("Hiba a poszt törlése közben");
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
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

            {post.is_admin && (
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => setEditingPost(post)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {editingPost && (
        <EditPostModal
          token={token}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}

export default PostList;
