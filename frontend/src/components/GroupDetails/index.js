import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { thunkGetGroupDetails } from '../../store/groups';


const GroupDetails = () => {
    const { groupId } = useParams()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(thunkGetGroupDetails(+groupId))
      }, [dispatch])

      const group = useSelector(state => state.groups.singleGroup)
      if (!group) return null;

      return (
        <div className='group-details'>
            <div className = 'header'>
                <h1>{group.name}</h1>
                <h3>{group.city}, {group.state}</h3>
                <h3>{group.numMembers} members</h3>
                <h3>Organized by {group.Organizer.firstName} {group.Organizer.lastName}</h3>
            </div>
            <div className = 'group-description'>
                <h2>What we're about</h2>
                <p> {group.about} </p>
            </div>
            <div className = 'upcoming-events'>
                <h2>Upcoming events</h2>
                <button>See all</button>
            </div>
        </div>
      )
}

export default GroupDetails
