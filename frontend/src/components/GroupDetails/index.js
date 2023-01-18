import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { thunkDeleteGroup, thunkGetGroupDetails } from '../../store/groups';



const GroupDetails = () => {
    const { groupId } = useParams()
    const dispatch = useDispatch()
    const history = useHistory()
    const [errors, setErrors] = useState([])



    useEffect(() => {
        dispatch(thunkGetGroupDetails(+groupId))
    }, [dispatch, groupId])

    const deleteGroup = (e) => {
        e.preventDefault()
        dispatch(thunkDeleteGroup(+groupId))

            .catch(
                async (res) => {
                    const data = await res.json();
                    if (data && data.errors) setErrors(data.errors);
                }
            )
            .then(history.push(`/groups`))

    }
    const user = useSelector(state => state.session.user)

    const group = useSelector(state => state.groups.singleGroup)

    if (!group) return null;

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
        <div className='group-details'>
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
            <ul>
                {errors.map((error, idx) => <li key={idx}>{error}</li>)}
            </ul>
            {deleteButton}
        </div>
    )
}


export default GroupDetails
