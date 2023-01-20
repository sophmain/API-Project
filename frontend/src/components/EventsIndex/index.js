import { useSelector, useDispatch } from 'react-redux'
import { thunkGetEvents } from '../../store/events'
import { NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import './eventsindex.css'


const EventsIndex = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(thunkGetEvents())
    }, [])


    const eventsObj = useSelector((state) => state.events.allEvents)

    if (!eventsObj) return null;

    const events = Object.values(eventsObj)


    return (
        <div className='container'>
            <div className='events-groups-headers'>
                <h2 className="events-header">
                    <NavLink to={`/events`} className="events-title-link">
                        Events
                    </NavLink>
                </h2>
                <h2 className="groups-header-event-page">
                    <NavLink to={`/groups`} className="groups-title-event-page">
                        Groups
                    </NavLink>
                </h2>
            </div>
            <h3 className="events-subtitle">Event suggestions for you</h3>
            <div className='all-events'>
                <ul>
                    {events.map(event => {
                        return (
                            <div className='event-card'>
                                <NavLink to={`/events/${event.id}`} key={event.id} className='event-link'>
                                    <img src={event.previewImage} className='card-image'
                                        alt={"event"} />
                                    <div className="group-text-items">
                                        <h3 className="event-time">
                                            {event.startDate.replace("Z", ' ').replace("T", ' ').slice(0, 16)} CST
                                        </h3>
                                        <h4 className="event-title">
                                            {event.name}
                                        </h4>
                                        {event.Group &&
                                            (
                                                <>
                                                    <h4 className="event-group-name">
                                                        {event.Group.name} - {event.Group.city}, {event.Group.state}
                                                    </h4>

                                                </>
                                            )
                                        }
                                        <h4 className="attending-num">
                                            {event.numAttending} attendees - {event.type}
                                        </h4>
                                    </div>
                                </NavLink>
                            </div>

                        )
                    })
                    }
                </ul>
            </div>
        </div>
    )
}

export default EventsIndex;
