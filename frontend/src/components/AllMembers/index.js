import { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { thunkLoadMembers } from '../../store/members';

const AllMembers = () => {
    const { groupId } = useParams()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(thunkLoadMembers(+groupId))
    }, [dispatch, groupId])

    const members = useSelector(state => state.members.groupMembers)
    if (!members) return null
    const membersArr = Object.values(members)
    console.log('members arr', membersArr)

    return (
        <div>
            {membersArr.map((member)=> {
                return (
                    member.firstName
                )
            })}
        </div>
    )
}
export default AllMembers
