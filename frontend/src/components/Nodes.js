import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import 'bulma'


const Nodes = () => {

  const [mainNode, setMainNode] = useState({

    id: '62108'

  })


  const [secondaryNodes, setSecondaryNodes] = useState([])

  const [topTracks, setTopTracks] = useState([])

  const [thirdNode, setThirdNode] = useState([])


  const handleClick = useCallback((e) => {


    setMainNode({ ...mainNode, artist: e.target.getAttribute('id') })

    e.preventDefault()

    const target = e.target.getAttribute('id')

    axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${target}/related`)


      .then(res => {
        const newSimilar = res.data.data.slice(1, 5)
        setSecondaryNodes(newSimilar)
        axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${target}/top`)

          .then(res => {
            const newtracks = res.data.data.slice(0, 3)
            setTopTracks(newtracks)

          })
          .catch(err => console.log(err))
      })
  }, [])


  useEffect(() => {

    axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${mainNode.id}/related`)

      .then(res => {
        const test = res.data.data.slice(0, 4)
        setSecondaryNodes(test)
        axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${mainNode.id}/top`)

          .then(res => {
            const tracks = res.data.data.slice(0, 3)
            setTopTracks(tracks)

          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))

  }, [])


  { console.log(topTracks) }


  return <div>
    <div className="columns">
      <div className="column">
        <div>{mainNode.artist}</div>
      </div>

      <div className="column">
        <div>
          {secondaryNodes.map((artist, i) => {
            return <div key={i} id={artist.id} onClick={handleClick}> {artist.name}</div>

          })}
        </div>

        <div>
          {secondaryNodes.map((artist, i) => {
            return <img key={i} src={artist.picture}/>

          })}
        </div>

        <div className="column">
          <div>
            {topTracks.map((track, i) => {
              return <div key={i}> {track.title}</div>

            })}
          </div>
        </div>
      </div>

    </div>
  </div>

}

export default Nodes