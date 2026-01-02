import React, { useEffect, useState, useCallback } from "react"; 
import axios from "axios";
import EditPostModal from "./EditPostModal";
import CommentForm from "./CommentForm";

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
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return response.data;
    } catch (err) {
      console.error("Failed to fetch comments", err);
      return [];
    }
  };
  
  const fetchPosts = async () => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/posts/", {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return response.data;
    } catch (err) {
        setError("Failed to fetch posts");
        console.error(err);
        return [];
    }
  };


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [postsData, commentsData] = await Promise.all([
        fetchPosts(),
        fetchComments(), 
      ]);

      setPosts(postsData);
      setComments(commentsData);
    } catch (err) {
      setError("Failed to load content.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);


  useEffect(() => {
    fetchData();
  }, [refreshKey, fetchData]);


  const handleLikeToggle = async (postId, isCurrentlyLiked) => {
    if (!token || !currentUser) {
        alert("A kedveléshez be kell jelentkezned!");
        return;
    }
    
    try {
        if (isCurrentlyLiked) {
            // UNLIKE (Kedvelés visszavonása)
            // Lekérjük a Like ID-t a bejelentkezett felhasználó és poszt alapján
            const likeResponse = await axios.get(`http://127.0.0.1:8000/api/likes/?post=${postId}&user=${currentUser.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const likeId = likeResponse.data[0]?.id; 

            if (likeId) {
                await axios.delete(`http://127.0.0.1:8000/api/likes/${likeId}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                 console.warn("Unlike failed: Like ID not found, refreshing data.");
                 
            }
        } else {
            // LIKE (Kedvelés)
            await axios.post('http://127.0.0.1:8000/api/likes/', { post: postId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        
        fetchData(); // Frissítés, hogy a gomb státusza és a szám azonnal frissüljön
        
    } catch (err) {
        console.error("Like/Unlike hiba:", err.response?.data || err);
        alert(`Hiba: ${err.response?.data?.detail || err.response?.data?.non_field_errors || "A művelet sikertelen."}`);
    }
  };


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
  
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("Biztosan törlöd ezt a hozzászólást?")) return;
    
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
          
          const isPostOwner = currentUser && post.user && post.user.id === currentUser.id;

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


              <div className="flex items-center justify-between mt-4 border-t pt-4">
                  
                  <div className="flex items-center space-x-4">
                      {/* LIKE GOMB */}
                      {token && currentUser ? (
                          <button
                              onClick={() => handleLikeToggle(post.id, post.is_liked)}
                              className={`flex items-center space-x-2 px-3 py-1 rounded transition text-sm 
                                          ${post.is_liked ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >
                              <span className="text-base">👍</span>
                              <span>{post.is_liked ? 'Liked' : 'Like'}</span>
                          </button>
                      ) : (
                          <span className="text-gray-500 text-sm">Jelentkezz be a kedveléshez</span>
                      )}
                      
                      {/* LIKE SZÁM */}
                      <span className="text-gray-600 text-sm font-medium">
                          {post.likes_count} {post.likes_count === 1 ? 'Like(s)' : 'Like(s)'}
                      </span>
                  </div>

                  {/* ADMIN JOGOSULTSÁG GOMBOK */}
                  {currentUser && (currentUser.is_admin || isPostOwner) && (
                      <div className="space-x-2">
                          <button
                              onClick={() => handleDelete(post.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                              Delete
                          </button>
                          <button
                              onClick={() => setEditingPost(post)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                              Edit
                          </button>
                      </div>
                  )}
              </div>


              {/* ... (Komment szekció gomb) */}
              <button
                onClick={() => toggleComments(post.id)}
                className="mt-4 w-full text-left font-medium text-blue-600 hover:text-blue-800 py-2 border-t border-b flex justify-between items-center"
              >
                <span>Comments ({postComments.length})</span>
                <span className={`transform transition-transform duration-300 ${isCommentsOpen ? 'rotate-90' : 'rotate-0'}`}>
                  {'>'}
                </span>
              </button>

              {/* Komment szekció tartalom */}
              {isCommentsOpen && (
                <div className="mt-4">
                  
                  <div className="space-y-3">
                    {postComments.length === 0 ? (
                      <p className="text-sm text-gray-500">Még nincsenek hozzászólások.</p>
                    ) : (
                      postComments.map(comment => {
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
                                    
                                    {canDeleteComment && (
                                        <button
                                            onClick={() => handleCommentDelete(comment.id)}
                                            className="text-xs text-red-500 hover:text-red-700 ml-4"
                                        >
                                            Delete
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