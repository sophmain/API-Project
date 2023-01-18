import { useSelector, useDispatch } from 'react-redux'
import { thunkGetGroups } from '../../store/groups'
import { NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import './groupsindex.css'

const GroupsIndex = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(thunkGetGroups())
    }, [])


    const groupsObj = useSelector(state => state.groups.allGroups)
    if (!groupsObj) return null;
    const groups = Object.values(groupsObj)

    return (
        <div className='groups-container'>
            <h2 className="groups-header">Groups</h2>
            <h3>Group suggestions for you</h3>
            <div className = 'all-groups'>
                <ul>
                    {groups.map(group => {
                            return (
                            <div className='group-card'>
                                <NavLink to= {`/groups/${group.id}`} key = {group.name} className='group-link'>
                                    <img src={group.previewImage} className= 'card-image'
                                    alt= {"group"}/>
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
