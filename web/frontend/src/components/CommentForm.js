import { useState } from 'react';

function CommentForm({ photo }) {
  const [text, setText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        console.log("photo id: "+photo._id);
      const res = await fetch(`http://localhost:3001/comments/${photo._id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post: photo._id, text }),
      });

      if (res.ok) {
        // Comment created successfully
        console.log('Comment created!');
        // Reset the form
        setText('');
      } else {
        // Handle error response
        console.error('Error creating comment:', res.statusText);
      }
    } catch (error) {
      // Handle network or other error
      console.error('Error creating comment:', error);
    }
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="post" value={photo._id} />
      <textarea name="text" value={text} onChange={handleTextChange}></textarea>
      <button type="submit">Create Comment</button>
    </form>
  );
}

export default CommentForm;
