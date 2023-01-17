import { csrfFetch } from './csrf';
import { useParams } from 'react'

const LOAD_GROUPS = "groups/LOAD_GROUPS"
const LOAD_GROUPDETAILS = "groups/LOAD_GROUPDETAILS"
const CREATE_GROUP = "groups/CREATE_GROUP"
const DELETE_GROUP = "groups/DELETE_GROUP"


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
            console.log('image', imageRes)
            dispatch(actionCreate(newGroup, imageRes))
        }
        return newGroup, newImage
    }
}

export const thunkDeleteGroup = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${id}`, {
        method: "DELETE",
        headers: {'Content-Type': 'application/json'}
    }
    )
    if (response.ok) {
        const group = await response.json()
        dispatch(actionDelete(group.id))
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
            return newState2
        case CREATE_GROUP:
            if(!state.allGroups[action.newgroup.id]){
                let newState3= {...state}
                newState3.allGroups[action.newgroup.id]= action.newgroup
                newState3.allGroups[action.newgroup.id]['previewImage'] = action.newImage.url
            return newState3
            }
        case DELETE_GROUP:
            let newState4 = {...state}
            delete newState4[action.id]
            return newState4
        default:
            return state
    }
}

export default groupsReducer;
