import { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { thunkDeleteEvent, thunkGetEventDetails } from '../../store/events';
import { thunkGetGroupDetails, thunkGetGroups } from '../../store/groups';
import OpenModalButton from '../OpenModalButton';
import EditEventModal from '../EditEventModal';
import './eventdetails.css'


const EventDetails = ({ isLoaded }) => {
    const { eventId } = useParams()
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        const loadData = async () => {
            const eventObj = await dispatch(thunkGetEventDetails(+eventId))
            dispatch(thunkGetGroupDetails(eventObj.groupId))
        }
        loadData()
    }, [dispatch, eventId])

    const group = useSelector(state => state.groups.singleGroup)
    const user = useSelector(state => state.session.user)
    const event = useSelector(state => state.events.singleEvent)

    if (!event) return null;
    if (!event.Group) return null;
    if (!event.Venue) return null;


    //changing format for date info returned from form to render on the page nicely
    const newstartDate = event.startDate.replace("Z", ' ').replace("T", ' ')
    const newendDate = event.endDate.replace("Z", ' ').replace("T", ' ')

    let availability;
    if (event.Group.private === true) {
        availability = 'Public'
    } else {
        availability = 'Private'
    }
    const deleteEvent = (e) => {
        e.preventDefault()
        dispatch(thunkDeleteEvent(event.id))
            .then(history.push(`/events`))

    }

    //only show delete button if the user is authorized (owner) to delete that group
    let deleteButton;
    if (user && group && group.organizerId == user.id) {
        deleteButton = (
            <div >
                <button onClick={deleteEvent} className='delete-button'>
                    Delete Event</button>
            </div>
        );
    } else {
        deleteButton = null
    };

    return (
        <div className='event-details-page'>
            <div className="event-header">
                <div className="event-header-info">
                    <h1 className="event-header-title">{event.name}</h1>
                    {group && group.Organizer &&
                        (
                            <div className="host-name">
                                Hosted by {group.Organizer.firstName}
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="background-color">
                <div className='event-main-page'>
                    <div className='event-info'>

                        <div className='event-details'>
                            <h2>Details</h2>
                            <p>{event.description}</p>

                        </div>
                        <div className="attendees">
                            <h2>Attendees ({event.numAttending})</h2>
                        </div>
                    </div>
                    <div className="event-sidebar">
                        <div className="group-hosting">

                            {group && group.GroupImages && (
                                <img src={group.GroupImages[0].url} alt="group" className="group-image-icon"></img>
                            )}
                            <div className="image-vs-text">
                                <h4 className="group-name-icon">{event.Group.name}</h4>
                                <h5 className="group-availability-icon">{availability} group</h5>
                            </div>
                        </div>
                        <div className="date-time-event">
                            <div>
                                <p className="start-end-times">
                                    <i className="fa-regular fa-clock"></i>
                                    <div className='event-times'>
                                        <p className='new-date'>
                                            {newstartDate.slice(0, 16)} to
                                        </p>
                                        <p className='new-date'>
                                            {newendDate.slice(0, 16)}
                                        </p>
                                    </div>


                                </p>
                            </div>
                            <div className="event-loc">
                                <i className="fa-solid fa-location-dot"></i>
                                <p className="event-location-pin">
                                    {event.Venue.address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom-nav-bar">
                <div className='left-bottom-bar'>
                    <h3 className='start-date-bottom'>
                        {newstartDate.slice(0, 16)}
                    </h3>
                    <h3 className='event-name-bottom'>
                        {event.name}
                    </h3>
                </div>
                <div className="right-bottom-navbar">
                    <h3 className='event-price-bottom'>
                        ${event.price}.00
                    </h3>
                    {isLoaded && user && group && group.organizerId == user.id && (
                        <OpenModalButton
                            className="event-modal"
                            buttonText="Edit Event"
                            modalComponent={<EditEventModal />}
                        />
                    )}
                    {deleteButton}
                </div>
            </div>
        </div>
    )
}
export default EventDetails;
