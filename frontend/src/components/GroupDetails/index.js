import { useEffect, useState } from 'react';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { thunkDeleteGroup, thunkGetGroupDetails } from '../../store/groups';
import CreateEventModal from '../CreateEventModal';
import OpenModalButton from "../../components/OpenModalButton";
import EditGroupModal from '../EditGroupModal';
import AllMembers from '../AllMembers';
import { thunkGetGroupEvents } from '../../store/events';
import { thunkLoadMembers, thunkPostMembership, thunkRemoveMembership } from '../../store/members';
import './groupdetails.css'

const GroupDetails = ({ isLoaded }) => {
    const { groupId } = useParams()
    const dispatch = useDispatch()
    const history = useHistory()
    const [showMembers, setShowMembers] = useState(false)
    const [showAbout, setShowAbout] = useState(true)
    const [showEvents, setShowEvents] = useState(false)

    useEffect(() => {
        dispatch(thunkGetGroupDetails(+groupId))
        dispatch(thunkGetGroupEvents(+groupId))
        dispatch(thunkLoadMembers(+groupId))
    }, [dispatch, groupId])

    const deleteGroup = (e) => {
        e.preventDefault()
        dispatch(thunkDeleteGroup(+groupId))
            .then(history.push(`/groups`))

    }
    const user = useSelector(state => state.session.user)
    const group = useSelector(state => state.groups.singleGroup)
    const events = useSelector(state => state.events.groupEvents)
    const members = useSelector(state => state.members.groupMembers)

    if (!members) return null
    const membersArr = Object.values(members)
    const isMember = membersArr.filter((member)=> member.id === user.id || member.memberId === user.id).length > 0

    //prevents loading a blank page on submit(newstate has to be updated on rerender with this info)
    if (!group || !group.Organizer || !group.GroupImages.length) return null;
    if (!events) return null

    //GroupImages is an array- this takes first image from that array
    const groupImg = group.GroupImages[0].url

    //convert events object to an array so can map
    const eventsArr = Object.values(events)

    //only show delete button if the user is authorized (owner) to delete that group
    let deleteButton;
    if (user && group && group.organizerId == user.id) {
        deleteButton = (
            <div >
                <button onClick={deleteGroup} className='delete-button'>
                    Delete Group</button>
            </div>
        );
    } else {
        deleteButton = null
    };
    //functions to show/hide bottom tabs
    // const showGroupMembers = () => {
    //     setShowMembers(true)
    //     setShowAbout(false)
    //     setShowEvents(false)

    // }
    const showGroupAbout = () => {
        setShowAbout(true)
        setShowEvents(false)
    }
    const showGroupEvents = () => {
        setShowAbout(false)
        setShowEvents(true)
    }
    const payload = {
        groupId,
        userId: user.id
    }
    const joinGroup = () => {
        dispatch(thunkPostMembership(payload))
    }

    const removeJoinRequest = () => {
        dispatch(thunkRemoveMembership(payload))
    }

    return (
        <div className='group-details-page'>
            <div className="top-bar">
                <img src={groupImg} className="group-image" alt="group"></img>
                <div className='header'>
                    <h1 className="group-name-title">{group.name}</h1>
                    <h3 className="header-subs">
                        <i className="fa-solid fa-location-dot"></i>  {group.city}, {group.state}
                    </h3>
                    <h3 className="header-subs">
                        <i className="fa-solid fa-user-group"></i>  {group.numMembers} members
                    </h3>
                    <h3 className="header-subs">
                        <i className="fa-solid fa-user"></i>  Organized by {group.Organizer.firstName} {group.Organizer.lastName}
                    </h3>

                </div>
            </div>

            <div className='group-detail-buttons'>
                <button className='group-detail-about' onClick={showGroupAbout}>About</button>
                {/* <button className='group-detail-members' onClick={showGroupMembers}>Members</button> */}
                <button className='group-detail-events' onClick={showGroupEvents}>Events</button>
                {!isMember && (
                    <button className='join-group-button' onClick={joinGroup}>Join this group</button>
                )}
                {isMember && (
                    <button className='remove-join-group-button' onClick={removeJoinRequest}>Pending</button>
                )}

            </div>
            <div className="background-color">
                {/* {showMembers && (
                            <AllMembers />
                        )} */}
                {showEvents && eventsArr.map((event) => {
                    return (
                        <div className='group-event-card' key={event.id}>
                            <NavLink to={`/events/${event.id}`} className='event-link'>
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
                                                    {event.Group.city}, {event.Group.state}
                                                </h4>

                                            </>
                                        )
                                    }
                                    <h4 className="attending-num">
                                        {event.numAttending} attendees
                                    </h4>
                                </div>
                            </NavLink>
                        </div>
                    )
                })

                }
                {showAbout && (
                    <div className="bottom-description">

                        <div className="left-bottom-description">
                            <div className='group-description'>
                                <h2>What we're about</h2>
                                <p className="group-about-detail"> {group.about} </p>
                            </div>
                            <div className="delete-group">
                                {deleteButton}
                            </div>
                        </div>
                        <div className="right-bottom-description">
                            {isLoaded && group && user && group.organizerId == user.id && (
                                <>
                                    <OpenModalButton
                                        buttonText="Edit group"
                                        modalComponent={<EditGroupModal />}
                                    />
                                    <OpenModalButton
                                        buttonText="Create event"
                                        modalComponent={<CreateEventModal />}
                                    />
                                </>
                            )}
                            <h2 className="organizers-bottom-description">
                                Organizer
                            </h2>
                            <i className="fa-solid fa-user"></i> {group.Organizer.firstName}
                            <h2 className="members-bottom-description">
                                Members ({group.numMembers})
                            </h2>
                        </div>
                    </div>
                )}
            </div>


        </div>
    )
}


export default GroupDetails
