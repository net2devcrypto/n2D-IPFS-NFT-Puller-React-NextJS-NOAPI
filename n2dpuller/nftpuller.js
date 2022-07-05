import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import React from "react";
import axios from 'axios';
import NFTCollection from './NFTCollection.json';
import { Card, Container, Text, Grid, Button, Image } from '@nextui-org/react';
import { nftContract, key, displayAmount, mainnet } from './settings';


export default function NftPuller() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    generateNft();
    }, [setNfts])
    
    async function refreshPage() {
        window.location.reload();
    }
    async function generateNft() {
      const provider = new ethers.providers.JsonRpcProvider(mainnet)
      const wallet = new ethers.Wallet(key, provider);
      const contract = new ethers.Contract(nftContract, NFTCollection, wallet);
      const itemArray = [];
      contract.totalSupply().then(result => {
        let totalSup = parseInt(result, 16)
  
        /*
        Replace "displayAmount" with "totalSup"
        below if you want to display all NFTs 
        in the collection BUT BE CAREFUL, it will render
        every nft image and possibly freeze your server/browser!!
        */
        for (let i = 0; i < displayAmount; i++) {


          var token = i + 1                         
          const owner = contract.ownerOf(token)
          const rawUri = contract.tokenURI(token)
          const Uri = Promise.resolve(rawUri)
          const getUri = Uri.then(value => {
            let str = value
            let cleanUri = str.replace('ipfs://', 'https://ipfs.io/ipfs/')
            let metadata = axios.get(cleanUri).catch(function (error) {
              console.log(error.toJSON());
            });
            return metadata;
          })
          getUri.then(value => {
            let rawImg = value.data.image
            var name = value.data.name
            var desc = value.data.description
            let image = rawImg.replace('ipfs://', 'https://ipfs.io/ipfs/')
            Promise.resolve(owner).then(value => {
              let ownerW = value;
              let meta = {
                name: name,
                img: image,
                tokenId: token,
                wallet: ownerW,
                desc,
              }
              console.log(meta)
              itemArray.push(meta)
            })
          })
        }
      })
      await new Promise(r => setTimeout(r, 5000));
      setNfts(itemArray)
      setLoadingState('loaded');
    }

if (loadingState === 'loaded' && !nfts.length)

    return (
      <div >
        {
        nfts.map((nft, i) => {
          <div>
          <Card.Image src={nft.img} key={i}/>
        <h2>No Collections Retrieved</h2>
        </div>
})}
      </div>
    )
    return (
      <Container md>
        <Text h1 css={{marginLeft:'$10'}} size={'40px'}>NFT Collection</Text>
        <Button css={{marginLeft: '$10'}} onPress={refreshPage}>Refresh NFTs</Button>
      <Grid.Container gap={3}>
        {nfts.map((nft, i) => {
            return (
              <Grid >
                <a>
                  <Card isHoverable key={i} css={{ mw: "270px", marginRight: '$1', boxShadow:'0px 2px 12px #000000' }} variant="bordered">
                    <Card.Image src={nft.img} />
                    <Card.Body md css={{background:"$gradient"}}>
                    <Text css={{color:'$white'}} h2>{nft.name}</Text>
                    <Text h3 css={{color:'$white'}}>NFT ID: {nft.tokenId}</Text>
                    <Text css={{color:'$white'}}>{nft.desc}</Text>
                    </Card.Body>
                  </Card>
                </a>
              </Grid>
            )
          })}
      </Grid.Container>
    </Container>
    )
}
