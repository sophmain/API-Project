import { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { thunkDeleteEvent, thunkGetEventDetails } from '../../store/events';
import {  thunkGetGroupDetails, thunkGetGroups } from '../../store/groups';



const EventDetails = () => {
    const { eventId } = useParams()
    const dispatch = useDispatch()
    const history = useHistory()
    //const [errors, setErrors] = useState([])

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

    //changing format for date info returned from form to render on the pave nicely
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

    // dispatch(thunkGetGroups())
    //     .then(groups => {
    //         console.log('groups', groups)
    //         let group = groups.Groups.find(group => group.id == event.Group.id)
    //         console.log('found group', group)
    //         return group
    //     })
    // console.log('group', group)

    //only show delete button if the user is authorized (owner) to delete that group
    let deleteButton;
    if (user && group && group.organizerId == user.id) {
        deleteButton = (
            <div className='delete-button-events'>

                <button onClick={deleteEvent}>
                    Delete this event</button>
            </div>
        );
    } else {
        deleteButton = null
    };

    return (
        <div className='event-details-page'>
            <div className="event-header">
                <h1>{event.name}</h1>
            </div>
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
                    <h4>{event.Group.name}</h4>
                    <h5>{availability} group</h5>
                </div>
                <div className="date-time-event">
                    <i className="fa-regular fa-clock"></i>
                    <p className="start-end-times">
                        {newstartDate}
                        to {newendDate}
                    </p>
                    <i className="fa-solid fa-location-dot"></i>
                    <p className="event-location-pin">
                        {event.Venue.address}
                    </p>
                </div>
            </div>
            <div className="bottom-nav-bar">
                {newstartDate}
                {event.name}
                ${event.price}.00

            </div>
            {deleteButton}
        </div>

    )
}
export default EventDetails;
