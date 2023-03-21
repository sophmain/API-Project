import { csrfFetch } from './csrf';

const LOAD_GROUPS = "groups/LOAD_GROUPS"
const LOAD_GROUPDETAILS = "groups/LOAD_GROUPDETAILS"
const CREATE_GROUP = "groups/CREATE_GROUP"
const DELETE_GROUP = "groups/DELETE_GROUP"
const EDIT_GROUP = "groups/EDIT_GROUP"



const actionLoad = (groups) => ({
    type: LOAD_GROUPS,
    groups
    })

const actionGroupDetails = (group) => ({
    type: LOAD_GROUPDETAILS,
    group
})

const actionCreate = (newgroup, newImage) => ({
    type: CREATE_GROUP,
    newgroup,
    newImage
})

const actionDelete = (id) => ({
    type: DELETE_GROUP,
    id
})

const actionEdit = (group) => ({
    type: EDIT_GROUP,
    group
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
        dispatch(actionGroupDetails(group))
        return group
    }
}

export const thunkCreateGroup = (payload, image) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })
    if(response.ok) {
        const newGroup = await response.json()
        const newImage = await csrfFetch(`/api/groups/${newGroup.id}/images`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(image)
        })
        if (newImage.ok){
            const imageRes = await newImage.json()
            dispatch(actionCreate(newGroup, imageRes))
        }
        return newGroup
    }
}

export const thunkDeleteGroup = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${id}`, {
        method: "DELETE"
    })
    if (response.ok) {
        const deleteMessage = await response.json()
        dispatch(actionDelete(id))
        return deleteMessage
    }
}

export const thunkEditGroup = (group, id) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${id}`, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(group)
    })
    if (response.ok) {
        const editedGroup = await response.json()
        dispatch(actionEdit(editedGroup))
    }
}

// normalize the store object for arr
const normalize = (arr) => {
    const resObj = {}
    arr.forEach((ele) => {resObj[ele.id] = ele})
    return resObj
}

const initialState = {}

const groupsReducer = (state = initialState, action) => {
    let newState;
    switch(action.type) {
        case LOAD_GROUPS:
            newState = {...state}
            newState.allGroups = normalize(action.groups.Groups)
            return newState
        case LOAD_GROUPDETAILS:
            newState = {...state}
            newState.singleGroup = action.group
            return newState
        case CREATE_GROUP:
            newState = {...state}
            newState.allGroups = {...newState.allGroups, [action.newgroup.id]: action.newgroup}
            newState.singleGroup = {...newState.singleGroup, ...action.newgroup, GroupImages: [action.newImage] }
            return newState
        case DELETE_GROUP:
            newState = {...state}
            delete newState.allGroups[action.id]
            newState.allGroups = {...newState.allGroups}
            return newState
        case EDIT_GROUP:
            newState = {...state}
            newState.allGroups = {...newState.allGroups, [action.group.id]: action.group}
            newState.singleGroup = {...newState.singleGroup, ...action.group}
            return newState
        default:
            return state
    }
}

export default groupsReducer;
