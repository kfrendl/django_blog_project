// frontend/src/components/PostList.js

import React, { useEffect, useState, useCallback } from "react"; 
import axios from "axios";
import EditPostModal from "./EditPostModal";
import CommentForm from "./CommentForm";

// Hozzáadva a currentUser a propokhoz
function PostList({ token, refreshKey, onPostDeleted, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  
  const [openComments, setOpenComments] = useState({}); 

  const toggleComments = (postId) => {
    setOpenComments(prev => ({
      ...prev,
      [postId]: !prev[postId], 
    }));
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/comments/", {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });
      return response.data;
    } catch (err) {
      console.error("Failed to fetch comments", err);
      return [];
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [postsResponse, commentsData] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/posts/", {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }),
        fetchComments(), 
      ]);

      setPosts(postsResponse.data);
      setComments(commentsData);
    } catch (err) {
      setError("Failed to fetch posts or comments.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);


  useEffect(() => {
    fetchData();
  }, [refreshKey, fetchData]);


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

  const handleCommentCreated = (newComment) => {
    setComments((prevComments) => [newComment, ...prevComments]);
    setOpenComments(prev => ({ ...prev, [newComment.post]: true })); 
  };
  
  // ÚJ FUNKCIÓ: Komment törlése
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("Biztosan törlöd ezt a hozzászólást?")) return;
    
    // Ellenőrizzük, hogy van-e token, mielőtt küldjük
    if (!token) {
        alert("Nincs jogosultság a törléshez.");
        return;
    }

    try {
        await axios.delete(`http://127.0.0.1:8000/api/comments/${commentId}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setComments(prevComments => 
            prevComments.filter(comment => comment.id !== commentId)
        );
    } catch (err) {
        console.error(err);
        alert("Hiba a hozzászólás törlése közben. Lehetséges, hogy nincs jogosultságod.");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading posts...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      {posts.length === 0 ? (
        <p className="text-center text-gray-600">No posts available</p>
      ) : (
        posts.map((post) => {
          const postComments = comments
            .filter(comment => comment.post === post.id)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            
          const isCommentsOpen = openComments[post.id]; 

          return (
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

              <button
                onClick={() => toggleComments(post.id)}
                className="mt-4 w-full text-left font-medium text-blue-600 hover:text-blue-800 py-2 border-t border-b flex justify-between items-center"
              >
                <span>Hozzászólások ({postComments.length})</span>
                <span className={`transform transition-transform duration-300 ${isCommentsOpen ? 'rotate-90' : 'rotate-0'}`}>
                  {'>'}
                </span>
              </button>

              {isCommentsOpen && (
                <div className="mt-4">
                  
                  <div className="space-y-3">
                    {postComments.length === 0 ? (
                      <p className="text-sm text-gray-500">Még nincsenek hozzászólások.</p>
                    ) : (
                      postComments.map(comment => {
                        // ÚJ FONTOS LOGIKA
                        const isOwner = currentUser && (comment.user?.id === currentUser.id);
                        const isAdmin = currentUser && comment.is_admin;
                        const canDeleteComment = isOwner || isAdmin;
                        
                        return (
                            <div key={comment.id} className="p-3 bg-gray-100 rounded-lg border">
                                <p className="text-gray-700">{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                                    <span>
                                        **{comment.user?.username || "Anonymous"}** – {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                    
                                    {/* Törlés gomb megjelenítése, ha Tulajdonos VAGY Admin */}
                                    {canDeleteComment && (
                                        <button
                                            onClick={() => handleCommentDelete(comment.id)}
                                            className="text-xs text-red-500 hover:text-red-700 ml-4"
                                        >
                                            Törlés
                                        </button>
                                    )}
                                </p>
                            </div>
                        );
                      })
                    )}
                  </div>

                  <CommentForm 
                    token={token} 
                    postId={post.id} 
                    onCommentCreated={handleCommentCreated} 
                  />
                </div>
              )} 
            </div>
          );
        }))}
      
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