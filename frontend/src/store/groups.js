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

export const thunkCreateGroup = (group) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups`)
    if(response.ok) {
        const newGroup = await response.json()
        dispatch(actionCreate(group))
        return group
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
    let newState = {...state}
    switch(action.type) {
        case LOAD_GROUPS:
            //let newState = {...state}
            newState.allGroups = normalize(action.groups.Groups)
            return newState
        case LOAD_GROUPDETAILS:
            newState.singleGroup = action.group
            return newState
        case CREATE_GROUP:
            newState.singleGroup = action.newgroup
        default:
            return state
    }
}

export default groupsReducer;
