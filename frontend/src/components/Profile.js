import React, { useState, useEffect } from 'react'
import Collapsible from 'react-collapsible'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ReactAudioPlayer from 'react-audio-player'

import Auth from '../lib/authMethods'
import distance from '../lib/distanceMethod'
import GigModal from '../components/GigModal'

import deleteIcon from './images/deleteIcon.png'

const initialArtists = [{ artists: {} }]
const initialSingleArtist = { id: '', name: '', picture_medium: '' }
const initialSongPreviews = []
const initialGigs = []

const Profile = () => {

  const [artists, setArtists] = useState(initialArtists)
  const [singleArtist, setSingleArtist] = useState(initialSingleArtist)
  const [dbID, setDbID] = useState('')
  const [songPreviews, setSongPreviews] = useState(initialSongPreviews)
  const [gigs, setGigs] = useState(initialGigs)
  const [singleGig, setSingleGig] = useState({})
  const [cities, setCities] = useState([])
  const [userPosition, setUserPosition] = useState({ latitude: '', longitude: '' })
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)

  // GRAB USER'S ARTISTS, LISTENS FOR CHANGES IN SINGLE ARTIST IN ORDER TO RENDER THE ARTIST LIST AGAIN
  useEffect(() => {
    axios.get('/api/profile', {
      headers: { Authorization: `Bearer ${Auth.getToken()}` }
    })
      .then(resp => {
        setArtists(resp.data.artists)
      })
  }, [singleArtist])

  // CALL DEEZER API FOR ARTIST INFO
  function getDeezerArtist(name) {
    axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/search/artist/?q=${name}&index=0&limit=1`)
      .then(resp => {
        setSingleArtist(resp.data.data[0])
        const artistId = resp.data.data[0].id
        axios.get(`https://cors-anywhere.herokuapp.com/api.deezer.com/artist/${artistId}/top`)
          .then(resp => {
            setSongPreviews(resp.data.data)
          })
      })
  }

  // CALL SKIDDLE API FOR GIG INFO
  function getSkiddleGigs(name) {
    axios.get(`https://cors-anywhere.herokuapp.com/www.skiddle.com/api/v1/artists/?api_key=${process.env.API_KEY}&name=${name}`)
      .then(resp => {
        const skiddleId = resp.data.results[0].id
        axios.get(`https://cors-anywhere.herokuapp.com/www.skiddle.com/api/v1/events/search/?api_key=${process.env.API_KEY}&a=${skiddleId}&country=GB`)
          .then(resp => {
            const data = resp.data.results
            const test = resp.data.results.map((gig) => {
              return gig.venue.town
            })

            const cities = test.filter((a, b) => test.indexOf(a) === b)
            const newData = []

            for (let i = 0; i < cities.length; i++) {
              newData.push({ [cities[i]]: [] })
              for (let j = 0; j < data.length; j++) {
                if (cities[i] === data[j].venue.town) {
                  newData[i][cities[i]].push(data[j])
                }
              }
            }
            setCities(cities)
            setGigs(newData)
          })
      })
  }

  // HANDLE CLICK FOR INDIVIDUAL ARTIST INFO, ALSO APPEND OUR OWN DATABASE ID IN ORDER TO DELETE THAT SPECIFIC ARTIST
  function handleClick(e) {
    const artist = e.target.title
    getDeezerArtist(artist)
    setCities([])
    setGigs([])
    getSkiddleGigs(artist)
    setDbID(e.target.id)
  }

  // DELETE SINGLE ARTIST FUNCTION
  function  deleteArtist() {
    toast(`${singleArtist.name} has been removed`)
    axios.delete(`/api/artists/${dbID}`, {
      headers: { Authorization: `Bearer ${Auth.getToken()}` }
    })
    // Set all populated fields to empty 
      .then(resp => {
        setSingleArtist(initialSingleArtist)
        setGigs(initialGigs)
        setSongPreviews(initialSongPreviews)
      })
  }

  // GIG MODAL
  function toggleModal() {
    setModal(!modal)
  }

  function handleGigClick(gig) {
    setSingleGig(gig)
    toggleModal()
  }

  // ACCESS USER LOCATION
  function getLocation() {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(setPosition)
    } else {
      console.log('geolocation not supported')
    }
  }

  function setPosition(position) {
    setUserPosition({ latitude: position.coords.latitude, longitude: position.coords.longitude })
    setLoading(false)
  }

  // WOULD LIKE TO HAVE IT SO ON PAGE LOAD, THE FIRST ARTIST'S INFO IS DISPLAYED
  
  return <section className="section" id="profile">
    <div className="container">
      <div className="columns">
        {/* THE USER'S ARTISTS COLUMN */}
        <div className="column" id="artists">
          <div className="title has-text-centered has-text-white">Artists</div>
          {artists.map((artist, i) => {
            return <div key={i} 
              title={artist.name} 
              onClick={handleClick} 
              className="artist" 
              id={artist.id}
            >{artist.name}</div>
          })}
        </div>
        {/* SINGLE ARTIST COLUMN */}
        <div className="column" id="singleArtist">
          <div id="head">
            <p className="title">Selected Artist</p>
            {singleArtist.id ? <figure className="image is-24x24">
              <img src={deleteIcon} id="delete-button" onClick={deleteArtist}/>
            </figure> : null}
          </div>
          
          {!singleArtist.id ? <p className="noArtistText is-7">No artist selected...</p> : null}

          {/* SINGLE ARTIST INFORMATION WITH SONG PREVIEW */}
          <div className="subtitle has-text-centered">{singleArtist.name}</div>
          <figure className="image is-128x128" id="image-wrapper">
            <img src={singleArtist.picture_medium} alt="" />
          </figure>

          {songPreviews.length === 0 ? null : <p className="subtitle" id="topTrack">Top tracks</p>}

          <div id="tracks-div">
            {songPreviews.slice(0,3).map((song, i) => {
              return <div key={i}>
                <p>{song.title}</p>
                <ReactAudioPlayer 
                  src={song.preview} 
                  controls
                />
              </div>
            })}
          </div>

        </div>
        {/* GIG COLUMN */}
        <div className="column" id="gigs">
          <p className="title has-text-centered has-text-white">Gigs</p>
          <div className={!loading ? 'button is-small' : 'button is-small is-loading'} onClick={getLocation}>How far away?</div>
          {gigs.length === 0 ? <p className="subtitle has-text-white">No gigs to show...</p> : null}
          {gigs.map((city, i) => {
            // MAPS OUT THE LOCATION FOLLOWED BY EACH GIG ASSOCIATED WITH THAT LOCATION
            return <Collapsible key={i} trigger={city[cities[i]][0].venue.town}>
              {city[cities[i]].map((gig, j) => {
                return <div key={j}>
                  <p onClick={() => handleGigClick(gig)} className="has-text-white">
                    {gig.venue.name} - 
                    {moment(gig.date).format('MMM Do YYYY')} 
                    {userPosition.latitude ? 
                      ` - ${distance(userPosition.latitude, userPosition.longitude, gig.venue.latitude, gig.venue.longitude)} miles` 
                      : 
                      null
                    }
                  </p>
                </div>
              })}
            </Collapsible>
          })}
        </div>
      </div>
    </div>

    {modal ? <GigModal
      setModal={setModal}
      gig={singleGig}
      toggleModal={toggleModal} /> : null}
  </section>
}

export default Profile