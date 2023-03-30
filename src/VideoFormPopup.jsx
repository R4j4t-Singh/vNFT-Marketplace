import React, { useState } from "react";
import './App.css'

function VideoFormPopup({ show, handleClose, handleFileChange, handleUpload }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const videoDetails = {
      title,
      description,
      tags: tags.split(","),
      category: category.split(","),
    };
    handleUpload(videoDetails);
    handleClose();
  };

  return (
    <>
      {show && (
        <div className="form-popup">
          <form className="form-container" onSubmit={handleFormSubmit}>
            <h2>Video Details</h2>
            <label htmlFor="title"><b>Title</b></label>
            <input
              type="text"
              placeholder="Enter video title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="description"><b>Description</b></label>
            <textarea
              placeholder="Enter video description"
              name="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label htmlFor="tags"><b>Tags</b></label>
            <input
              type="text"
              placeholder="Enter video tags separated by comma"
              name="tags"
              required
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <label htmlFor="category"><b>Category</b></label>
            <input
              type="text"
              placeholder="Enter category of video"
              name="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            
            <input 
              type="file" 
              name="videoFile"
              onChange={handleFileChange}
            />
            <button type="submit" className="">
              Submit
            </button>
            <button className=" cancel" onClick={handleClose}>
              Close
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default VideoFormPopup;
