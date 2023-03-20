import { csrfFetch } from './csrf';

const LOAD_EVENTS = "events/LOAD_EVENTS"
const LOAD_GROUPEVENTS = "events/LOAD_GROUPEVENTS"
const LOAD_EVENTDETAILS = "events/LOAD_EVENTDETAILS"
const CREATE_EVENT = "events/CREATE_EVENT"
const DELETE_EVENT = "events/DELETE_EVENT"
const EDIT_EVENT = "events/EDIT_EVENT"

const actionLoad = (events) => ({
    type: LOAD_EVENTS,
    events
})

const actionLoadGroupEvents = (events) => ({
    type: LOAD_GROUPEVENTS,
    events
})

const actionEventDetails = (event) => ({
    type: LOAD_EVENTDETAILS,
    event
})

const actionCreateEvent = (newEvent) => ({
    type: CREATE_EVENT,
    newEvent
})

const actionDeleteEvent = (id) => ({
    type: DELETE_EVENT,
    id
})

const actionEditEvent = (event) => ({
        type: EDIT_EVENT,
        event
})

export const thunkGetEvents = () => async (dispatch) => {
    const response = await csrfFetch('/api/events')
    if (response.ok) {
        const events = await response.json()
        dispatch(actionLoad(events))
        return events
    }
}

export const thunkGetGroupEvents = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`)
    if (response.ok) {
        const events = await response.json()
        dispatch(actionLoadGroupEvents(events))
        return events
    }
}

export const thunkGetEventDetails = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${id}`)
    if (response.ok) {
        const event = await response.json()
        dispatch(actionEventDetails(event))
        return event
    }
}

export const thunkCreateEvent = (payload, groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    if (response.ok) {
        const event = await response.json()
        dispatch(actionCreateEvent(event))
        return event
    }
}

export const thunkDeleteEvent = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${id}`, {
        method: "DELETE"
    })
    if (response.ok) {
        const deleteMessage = await response.json()
        dispatch(actionDeleteEvent(id))
        return deleteMessage
    }
}

export const thunkEditEvent = (event, id) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    })
    if (response.ok) {
        const editedEvent = await response.json()
        dispatch(actionEditEvent(editedEvent))
    }
}

// normalize the store object
const normalize = (arr) => {
    const resObj = {}
    arr.forEach((ele) => { resObj[ele.id] = ele })
    return resObj
}

const initialState = {}

const eventsReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case LOAD_EVENTS:
            newState = { ...state }
            newState.allEvents = normalize(action.events.Events)
            return newState
        case LOAD_GROUPEVENTS:
            newState = { ...state }
            newState.groupEvents = normalize(action.events.Events)
            return newState
        case LOAD_EVENTDETAILS:
            newState = { ...state }
            newState.singleEvent = action.event
            return newState
        case CREATE_EVENT:
            newState = { ...state }
            newState.allEvents = { ...newState.allEvents, [action.newEvent.id]: action.newEvent }
            newState.singleEvent = { ...newState.singleEvent, ...action.newEvent }
            return newState
        case DELETE_EVENT:
            newState = { ...state }
            delete newState.allEvents[action.id]
            newState.allEvents = { ...newState.allEvents }
            return newState
        case EDIT_EVENT:
            newState = {...state}
            newState.allEvents = {...newState.allEvents, [action.event.id]: action.event}
            newState.singleEvent = {...newState.singleEvent, ...action.event}
            return newState
        default:
            return state
    }
}

export default eventsReducer;
