import { useSelector, useDispatch } from 'react-redux'
import { actionLoad, thunkGetGroups } from '../../store/groups'
import { NavLink } from 'react-router-dom'
import { useEffect } from 'react'

const GroupsIndex = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(thunkGetGroups())
    }, [dispatch])

    const groupsObj = useSelector(state => state.groups.allGroups)
    const groups = Object.values(groupsObj)


    if (!groups) return null;

    return (
        <div>
            <ul>
                {groups.map(group => {
                        return (
                        <div className='group-card'>
                            <NavLink to= {`/groups/${group.id}`} key = {group.id}>
                            <img src={group.previewImage} className= 'card-image' />
                            {group.name}
                        </NavLink>
                        </div>

                        )
                    })
                }
            </ul>
        </div>
    )
}

export default GroupsIndex;
