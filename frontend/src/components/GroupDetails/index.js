import { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { thunkDeleteGroup, thunkGetGroupDetails } from '../../store/groups';
import CreateEventModal from '../CreateEventModal';
import OpenModalButton from "../../components/OpenModalButton";
import EditGroupModal from '../EditGroupModal';


const GroupDetails = () => {
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
            <div className='delete-button'>

            <button onClick={deleteGroup}>
                Delete this group</button>
            </div>
        );
    } else {
        deleteButton = null
    };


    return (
        <div className='group-details-page'>
            <div className = 'group-image'>
                <img src={groupImg} alt="group"></img>
            </div>
            <div className='header'>
                <h1>{group.name}</h1>
                <h3>{group.city}, {group.state}</h3>
                <h3>{group.numMembers} members</h3>
                <h3>Organized by {group.Organizer.firstName} {group.Organizer.lastName}</h3>
            </div>
            <div className='group-description'>
                <h2>What we're about</h2>
                <p> {group.about} </p>
            </div>
            <div className='upcoming-events'>
                <h2>Upcoming events</h2>
                <button>See all</button>
            </div>
            {deleteButton}
        </div>
    )
}


export default GroupDetails
