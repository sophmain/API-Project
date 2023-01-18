import { useSelector, useDispatch } from 'react-redux'
import { thunkGetGroups } from '../../store/groups'
import { NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import './groupsindex.css'

const GroupsIndex = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(thunkGetGroups())
    }, [dispatch])

    const groupsObj = useSelector(state => state.groups.allGroups)
    const groups = Object.values(groupsObj)


    if (!groups) return null;

    return (
        <div className='groups-container'>
            <h2>Groups</h2>
            <h3>Group suggestions for you</h3>
            <div className = 'all-groups'>
                <ul>
                    {groups.map(group => {
                            return (
                            <div className='group-card'>
                                <NavLink to= {`/groups/${group.id}`} key = {group.id} className='group-link'>
                                    <img src={group.previewImage} className= 'card-image'
                                    alt= {"added by group organizer"}/>
                                    <div className="group-text-items">
                                        <h4 className = "group-title">
                                            {group.name}
                                        </h4>
                                        <h5 className="group-location">
                                            {group.city}, {group.state}
                                        </h5>
                                        <p className = "group-about">
                                            {group.about}
                                        </p>
                                        <h6>
                                            {group.numMembers} members - {group.type}
                                        </h6>
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

export default GroupsIndex;
