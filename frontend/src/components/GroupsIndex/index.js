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
                {
                    groups.map(group => {
                        return <NavLink to= {`/groups/${group.id}`} key = {group.id}> {group.name} </NavLink>
                    })
                }
            </ul>
        </div>
    )
}

export default GroupsIndex;
