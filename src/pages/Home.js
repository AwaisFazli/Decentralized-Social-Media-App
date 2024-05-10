import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Card, ListGroup } from 'react-bootstrap'
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { REACT_APP_PINATA_API_Secret, REACT_APP_PINATA_API_Key } from "../config"
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const Home = ({ contract, account }) => {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [posts, setPosts] = useState("")
  const [post, setPost] = useState('')

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
        let response = await fetch(`https://gateway.pinata.cloud/ipfs/${i.hash}`);
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

  const uploadPost = async () => {
    if (!posts) return;
  
    let hash;
  
    // Upload post to IPFS
    try {
      // Prepare JSON data
      const jsonData = JSON.stringify({ post });
  
      // Upload JSON data to Pinata
      const pinataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        jsonData,
        {
          maxContentLength: "Infinity",
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: REACT_APP_PINATA_API_Key,
            pinata_secret_api_key: REACT_APP_PINATA_API_Secret,
          },
        }
      );
  
      setLoading(true);
      hash = pinataResponse.data.IpfsHash;
    } catch (error) {
      window.alert("IPFS image upload error: ", error);
      return;
    }
  
    try {
      // Upload post to blockchain
      await (await contract.uploadPost(hash)).wait();
      loadPosts();
    } catch (error) {
      console.log("Blockchain upload error: ", error);
    }
  };
  

  useEffect(() => {
    if (!post) {
      loadPosts();
    }
  }, []);

  if (loading) return <div className="">Loading</div>;
  return (
    <div>
    {hasProfile ?
                (<div className="row">
                    <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                        <div className="content mx-auto">
                            <Row className="g-4">
                                <Form.Control onChange={(e) => setPost(e.target.value)} size="lg" required as="textarea" />
                                <div className="d-grid px-0">
                                    <Button onClick={uploadPost} variant="primary" size="lg">
                                        Post!
                                    </Button>
                                </div>
                            </Row>
                        </div>
                    </main>
                </div>)
                :
                (<div className="text-center">
                    <main style={{ padding: "1rem 0" }}>
                        <h2>Must own an NFT to post</h2>
                    </main>
                </div>)
            }
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
