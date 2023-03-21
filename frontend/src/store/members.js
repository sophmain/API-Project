import { csrfFetch } from './csrf';

const LOAD_MEMBERS = "members/LOAD_MEMBERS"
const POST_MEMBERSHIP = "members/POST_MEMBERSHIP"
const DELETE_MEMBERSHIP = "members/DELETE_MEMBERSHIP"

const actionLoad = (members) => ({
    type: LOAD_MEMBERS,
    members
})

const actionRequestMembership = (member) => ({
    type: POST_MEMBERSHIP,
    member
})

const actionDeleteMembership = (memberId) => ({
    type: DELETE_MEMBERSHIP,
    memberId
})

export const thunkLoadMembers = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/members`)
    if (response.ok) {
        const members = await response.json()
        dispatch(actionLoad(members))
        return members
    }
}

export const thunkPostMembership = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${payload.groupId}/membership`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    if (response.ok){
        const memberReq = await response.json()
        dispatch(actionRequestMembership(memberReq))
        return memberReq
    }
}

export const thunkRemoveMembership = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${payload.groupId}/membership`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        const deleteMessage = await response.json()
        dispatch(actionDeleteMembership(payload.userId))
        return deleteMessage
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
            newState = {...state}
            newState.groupMembers = normalize(action.members.Members)
            return newState
        case POST_MEMBERSHIP:
            console.log('post action', action.member)
            newState = {...state}
            newState.groupMembers = { ...newState.groupMembers, [action.member.memberId]: action.member}
            return newState
        case DELETE_MEMBERSHIP:
            console.log('delete action', action.memberId)
            newState = {...state}
            delete newState.groupMembers[action.memberId]
            newState.groupMembers = { ...newState.groupMembers }
            return newState
        default:
            return state
    }
}

export default membersReducer;
