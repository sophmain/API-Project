import { csrfFetch } from './csrf';
import { useParams } from 'react'

const LOAD_GROUPS = "groups/LOAD_GROUPS"
const LOAD_GROUPDETAILS = "groups/LOAD_GROUPDETAILS"
const CREATE_GROUP = "groups/CREATE_GROUP"


const actionLoad = (groups) => ({
    type: LOAD_GROUPS,
    groups
    })

const actionGroupDetails = (group) => ({
    type: LOAD_GROUPDETAILS,
    group
})

const actionCreate = (newgroup) => ({
    type: CREATE_GROUP,
    newgroup
})

export const thunkGetGroups = () => async (dispatch) => {
    const response = await csrfFetch('/api/groups')
    if (response.ok) {
        const groups = await response.json()
        dispatch(actionLoad(groups))
        return groups
    }
}

export const thunkGetGroupDetails = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${id}`)
    if (response.ok) {
        const group = await response.json()
        console.log('groupdetails group', group)
        dispatch(actionGroupDetails(group))
        return group
    }
}

export const thunkCreateGroup = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })
    if(response.ok) {
        const newGroup = await response.json()
        dispatch(actionCreate(newGroup))
        return newGroup
    }
}

// normalize the store object
const normalize = (arr) => {
    const resObj = {}
    arr.forEach((ele) => {resObj[ele.id] = ele})
    return resObj
}

const initialState = { allGroups: {}}

const groupsReducer = (state = initialState, action) => {
    switch(action.type) {
        case LOAD_GROUPS:
            let newState = {...state}
            newState.allGroups = normalize(action.groups.Groups)
            return newState
        case LOAD_GROUPDETAILS:
            let newState2 = {...state}
            newState2.singleGroup = action.group
            return newState
        case CREATE_GROUP:
            if(!state[action.newgroup.id]){
            let newState3 = {...state, [action.newgroup.id]: action.newgroup}
            return newState3
            }
        default:
            return state
    }
}

export default groupsReducer;
