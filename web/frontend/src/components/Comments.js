import React from 'react';

function Comments({ comments }) {
  return (
    <div>
      <h3>Comments:</h3>
      {comments.map((comment) => (
        <p key={comment._id}>{comment.user.username}: {comment.text}</p>
      ))}
    </div>
  );
}

export default Comments;
