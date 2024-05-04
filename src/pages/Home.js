import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const Home = ({ contract, account }) => {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [posts, setPosts] = useState("");

  const loadPosts = async () => {
      let balance
      
      try {
        balance = await contract.balanceOf(account);
          
    } catch (error) {
        console.log(error)
    }

    setHasProfile(() => balance > 0);

    let results = await contract.getAllPosts();

    let posts = await Promise.all(
      results.map(async (i) => {
        let response = await fetch(`https://ipfs.infura.io/ipfs/${i.hash}`);
        const metadataPost = await response.json();

        const nftId = await contract.profiles(i.author);

        const uri = await contract.tokenURI(nftId);

        response = await fetch(uri);
        const metadataProfile = await response.json();

        const author = {
          address: i.author,
          username: metadataProfile.username,
          avatar: metadataProfile.avatar,
        };

        let post = {
          id: i.id,
          content: metadataPost.post,
          author,
        };

        return post
      })
    );

    setPosts(posts);
    setLoading(false);
  };

  useEffect(() => {
    if (!posts) {
      loadPosts();
    }
  }, []);

  if (loading) return <div className="">Loading</div>;
  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post, key) => {
            return (
                <div key={key}>
                    <div>
                        <img src={post.author.avatar} alt="" />
                        <p>{post.author.username}</p>
                        <p>{post.author.address}</p>
                    </div>
                    <div>
                        {post.content}
                    </div>
                </div>
            )
        })
      ) : (
        <div>
          <p>No Post Available</p>
        </div>
      )}
    </div>
  );
};

export default Home;
