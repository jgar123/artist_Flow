import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import 'bulma'
import ReactAudioPlayer from 'react-simple-audio-player'
import chroma from 'chroma-js'
import arrowImage from './images/pngwave (1).png'
import downArrow from './images/toppng.com-white-drop-down-arrow-423x265.png'
import plus from './images/iconfinder_favourite512x512_197598.png'
import Auth from '../lib/authMethods'
import { toast } from 'react-toastify'
import FadeIn from 'react-fade-in'

const Nodes = (props) => {

  const colorScale = chroma
    .scale([
      '#303030',
      '#D3D3D3'
    ])
    .mode('lch')
    .colors(5)

  const [mainNode, setMainNode] = useState({})

  const [secondaryNodes, setSecondaryNodes] = useState([])
  const [topTracks, setTopTracks] = useState([])

  const [thirdNode] = useState({

    array: []

  })

  const addToFavourites = useCallback(() => {
    if (Auth.isAuthorized()) {
      toast(`${mainNode.name} added to favourites!`)
      axios({
        method: 'post',
        url: '/api/artists',
        data: {
          deezerId: mainNode.id,
          name: mainNode.name
        },
        headers: { Authorization: `Bearer ${Auth.getToken()}` }
      })
        .then(res => {
          console.log(res)
        })
        .catch(err => console.log(err))
    } else {
      toast('You need to be logged in to do this')
    }

  }, [{ ...mainNode }])

  { console.log(mainNode.id, mainNode.name) }


  const [thirdNodeData, setThirdNodeData] = useState({})

  const handleClick = useCallback((e) => {

    e.preventDefault()
    const target = e.target.getAttribute('id')
    axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${target}`)
      .then(res => {
        const main = res.data
        setMainNode(main)
        axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${target}/related`)
          .then(res => {
            const newSimilar = res.data.data.slice(1, 5)
            setSecondaryNodes(newSimilar)
            thirdNode.array.push(target)
            axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${target}/top`)
              .then(res => {
                const newtracks = res.data.data.slice(0, 3)
                setTopTracks(newtracks)
                axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${thirdNode.array[thirdNode.array.length - 2]}`)
                  .then(res => {
                    const pastArtist = res.data
                    setThirdNodeData(pastArtist)
                  })
                  .catch(err => console.log(err))
              })
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
      })
  }, [])

  const refreshSuggestions = useCallback(() => {

    axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${mainNode.id}/related`)
      .then(res => {
        console.log(mainNode)
        const suggest = res.data.data.slice(4, 8)
        setSecondaryNodes(suggest)

      })
      .catch(err => console.log(err))
  }, [{ ...secondaryNodes }])

  const refreshSuggestionsUp = useCallback(() => {

    axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${mainNode.id}/related`)
      .then(res => {
        console.log(mainNode)
        const suggest = res.data.data.slice(0, 4)
        setSecondaryNodes(suggest)

      })
      .catch(err => console.log(err))
  }, [{ ...secondaryNodes }])


  useEffect(() => {
    thirdNode.array.push(props.location.artist.deezerId)
    axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${props.location.artist.deezerId}`)
      .then(res => {
        const main = res.data
        setMainNode(main)
        axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${props.location.artist.deezerId}/related`)
          .then(res => {
            const test = res.data.data.slice(0, 4)
            setSecondaryNodes(test)
            axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${props.location.artist.deezerId}/top`)
              .then(res => {
                const tracks = res.data.data.slice(0, 3)
                setTopTracks(tracks)
              })
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  }, [])

  if (topTracks.length === 0) {
    return <div className="loading-container"><div className="lds-ripple fade-in"><div></div><div></div></div></div>
  }

  return <div>

    {console.log(mainNode.id)}
    {console.log(thirdNodeData)}
    {/* {console.log(props.location.artist)} */}
    {/* {console.log(thirdNodeData)} */}

    <div>
      <div className="container-div fade-in">
        <div className="third-node ">
          <div onClick={handleClick} id={thirdNodeData.id}> {thirdNodeData.name}</div>
        </div>
        <img className="arrow-2" src={arrowImage} />
        <div>
          <div className="aflow">artist_Flow</div>
          <div className="main-node main-node-container">
            <div>
              <img className="artist-pic" src={mainNode.picture} />
            </div>
            <div>
              {mainNode.name}
            </div>
            <div className="audio-container">
              {topTracks.map((track, i) => {
                return <div key={i}> <ReactAudioPlayer
                  url={track.preview} colorScale={colorScale}

                /></div>
              })}
            </div>
            <img className="plus-sign" src={plus}
              onClick={addToFavourites}
            />
          </div>
        </div>
        <img className="arrow-1" src={arrowImage} />
        <div >
          <div className="second-node-container fade-in">
            {secondaryNodes.map((artist, i) => {
              return <FadeIn key={i}> <div key={i} id={artist.id} className="second-node" onClick={handleClick}> {artist.name}</div> </FadeIn>
            })}
            <img className="down-arrow2" src={downArrow} onClick={refreshSuggestionsUp} />
            <img className="down-arrow" src={downArrow} onClick={refreshSuggestions} />
          </div>
        </div>
      </div>
    </div>
  </div>
}

export default Nodes