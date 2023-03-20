import { csrfFetch } from './csrf';

const LOAD_MEMBERS = "members/LOAD_MEMBERS"

const actionLoad = (members) => ({
    type: LOAD_MEMBERS,
    members
})

export const thunkLoadMembers = (groupId) => async (dispatch) => {
    console.log('group id', groupId)
    const response = await csrfFetch(`/api/groups/${groupId}/members`)
    if (response.ok) {
        const members = await response.json()
        console.log('members in thunk', members)
        dispatch(actionLoad(members))
        return members
    }
}

// normalize the store object for arr
const normalize = (arr) => {
    const resObj = {}
    arr.forEach((ele) => {resObj[ele.id] = ele})
    return resObj
}

const initialState = {}

const membersReducer = (state = initialState, action) => {
    let newState;
    switch(action.type) {
        case LOAD_MEMBERS:
            console.log('load action', action.members)
            newState = {...state}
            newState.groupMembers = normalize(action.members.Members)
            return newState
        default:
            return state
    }
}

export default membersReducer;
