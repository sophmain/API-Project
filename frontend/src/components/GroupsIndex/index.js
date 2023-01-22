import { useSelector, useDispatch } from 'react-redux'
import { thunkGetGroups } from '../../store/groups'
import { NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import OpenModalButton from '../OpenModalButton'
import CreateGroupModal from '../CreateGroupModal'
import './groupsindex.css'

const GroupsIndex = ({ isLoaded }) => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(thunkGetGroups())
    }, [])

    const user = useSelector(state => state.session)

    const groupsObj = useSelector(state => state.groups.allGroups)
    if (!groupsObj) return null;
    const groups = Object.values(groupsObj)



    return (
        <div className='container'>
            <div className="events-groups-top-bar">

                <div className="events-groups-top-container">


                    <div className='events-groups-headers'>
                        <h2 className="events-header-group-page">
                            <NavLink to={`/events`} className="events-title-group-page">
                                Events
                            </NavLink>
                        </h2>
                        <h2 className="groups-header">
                            <NavLink to={`/groups`} className="groups-title-link">
                                Groups
                            </NavLink>
                        </h2>
                    </div>
                    <h3 className="suggestions-title">Group suggestions for you</h3>
                    {isLoaded && user.user != null && (
                        <div className="create-group-modal">
                            <OpenModalButton
                                buttonText="Create a group"
                                modalComponent={<CreateGroupModal />}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className='all-groups'>
                <ul>
                    {groups.map(group => {
                        return (
                            <div className='group-card'>
                                <NavLink to={`/groups/${group.id}`} key={group.name} className='group-link'>
                                    <div className="image-container">
                                        <img src={group.previewImage} className='card-image'
                                            alt={"group"} />
                                    </div>
                                    <div className="group-text-items">
                                        <h4 className="group-title">
                                            {group.name}
                                        </h4>
                                        <h5 className="group-location">
                                            {group.city}, {group.state}
                                        </h5>
                                        <p className="group-about">
                                            {group.about}
                                        </p>
                                        <h6 className="group-members">
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
