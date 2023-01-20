import { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { thunkDeleteGroup, thunkGetGroupDetails } from '../../store/groups';
import CreateEventModal from '../CreateEventModal';
import OpenModalButton from "../../components/OpenModalButton";
import EditGroupModal from '../EditGroupModal';
import './groupdetails.css'


const GroupDetails = ({ isLoaded }) => {
    const { groupId } = useParams()
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        dispatch(thunkGetGroupDetails(+groupId))
    }, [dispatch, groupId])

    const deleteGroup = (e) => {
        e.preventDefault()
        dispatch(thunkDeleteGroup(+groupId))
            .then(history.push(`/groups`))

    }
    const user = useSelector(state => state.session.user)
    const group = useSelector(state => state.groups.singleGroup)

    //prevents loading a blank page on submit(newstate has to be updated on rerender with this info)
    if (!group) return null;
    if (!group.Organizer) return null;
    if (!group.GroupImages.length) return null;

    //GroupImages is an array- this takes first image from that array
    const groupImg = group.GroupImages[0].url

    //only show delete button if the user is authorized (owner) to delete that group
    let deleteButton;
    if (group.organizerId == user.id) {
        deleteButton = (
            <div >
                <button onClick={deleteGroup} className='delete-button'>
                    Delete Group</button>
            </div>
        );
    } else {
        deleteButton = null
    };


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
                        <i class="fa-solid fa-user-group"></i>  {group.numMembers} members
                    </h3>
                    <h3 className="header-subs">
                        <i class="fa-solid fa-user"></i>  Organized by {group.Organizer.firstName} {group.Organizer.lastName}
                    </h3>

                </div>
            </div>
            <div className="background-color">
                <div className="bottom-description">
                    <div className="left-bottom-description">
                        <div className='group-description'>
                            <h2>What we're about</h2>
                            <p className="group-about"> {group.about} </p>
                        </div>
                        {/* <div className='upcoming-events'>
                            <h2>Upcoming events</h2>
                            <button>
                                <NavLink to={`/group/${groupId}/events`}
                                See all
                            </button>
                        </div> */}
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
                        <i class="fa-solid fa-user"></i> {group.Organizer.firstName}
                    </div>

                </div>
            </div>


        </div>
    )
}


export default GroupDetails
