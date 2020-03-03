import React, { useEffect } from 'react'
import moment from 'moment'

const GigModal = ({ toggleModal, gig, setModal }) => {

  useEffect(() => {
    const listener = e => {
      if (e.key === 'Escape') {
        setModal(false)
      }
    }
    window.addEventListener('keydown', listener)
  }, [])

  return <div className="modal is-active">
    <div className="modal-background" onClick={toggleModal}></div>
    <div className="modal-card" id="modal-full">
      <header className="modal-card-head has-text-left has" id="modal-head">
        <p className="modal-card-title has-text-white">{gig.venue.name} - {gig.venue.town} <br />
          <p className="modal-subtitle is-size-6">{moment(gig.date).format('MMMM Do YYYY')}</p>
        </p>
      </header>
      <section className="modal-card-body">
        <p className="subtitle">Description:</p>
        {gig.description ?
          <p>{gig.description}</p> :
          <p>No description available</p>
        }
        <p className="subtitle">Ticket price approx.:</p>
        {gig.entryprice ?
          <p>
            {`£${(gig.entryprice).replace(/[^\d.-]/g, '')}`}</p> : <p>No price information available</p>
        }
        <p className="subtitle">Start time:</p>
        <p>{gig.openingtimes.doorsopen}</p>
        <p className="subtitle">Venue contact information:</p>
        {gig.venue.phone ?
          <p>{gig.venue.phone}</p> :
          <p>No contact information available</p>
        }
      </section>
    </div>
    <button className="modal-close is-large" aria-label="close" onClick={toggleModal}></button>
  </div>

}

export default GigModal