import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useModal } from "../../context/Modal";
import { thunkCreateEvent } from '../../store/events';
import './createeventmodal.css'


const CreateEventModal = () => {
    const types = ['Online', 'In Person']

    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const history = useHistory();
    const [venueId, setVenueId] = useState('')
    const [name, setName] = useState('')
    const [type, setType] = useState(types[0])
    const [capacity, setCapacity] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [errors, setErrors] = useState([])
    const [createdEvent, setCreatedEvent] = useState()

    //    const newStartDate = (startDate.concat('0 +00.00'))
    //    const newEndDate = (endDate.concat('0 +00.00'))

    const newStartDate = startDate.replace("T", ' ').concat(':00')
    const newEndDate = endDate.replace("T", ' ').concat(':00')

    const group = useSelector(state => state.groups.singleGroup)


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        const payload = {
            groupId: group.id,
            venueId,
            name,
            type,
            capacity,
            price,
            description,
            startDate: new Date(newStartDate),
            endDate: new Date(newEndDate)
        }

        // const image = {
        //     url,
        //     preview: true
        // }
        if (!group) return null

        return dispatch(thunkCreateEvent(payload, group.id))
            //wait for event to be returned from dispatch, use useEffect to rerender to be able to grab id from created event
            .then((event) => {
                setCreatedEvent(event)
            })
            .then(closeModal)
            .catch(
                async (res) => {
                    const data = await res.json();
                    if (data && (data.errors)) setErrors(data.errors)
                });

    }

    useEffect(() => {
        if (createdEvent) {
            history.push(`/events/${createdEvent.id}`)
        }
    }, [createdEvent])

    return (
        <div className='new-event-form-holder'>
            <form className="create-event-form" onSubmit={handleSubmit}>
                <h1>Create an event</h1>
                <ul>
                    {errors.map((error, index) => <li key={index}>{error}</li>)}
                </ul>
                <label>
                    <p className="input-label-event">
                        VenueId
                    </p>
                    <input
                        className="input-box-event"
                        id="venueId"
                        type="number"
                        step="1"
                        name="venueId"
                        value={venueId}
                        onChange={(e) => setVenueId(e.target.value)}
                    />
                </label>
                <label>
                    <p className="input-label-event">
                        Name
                    </p>
                    <input
                        className="input-box-event"
                        id="name"
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label>
                    <p className="input-label-event">
                        Type
                    </p>
                    <select
                        className="input-dropdown-event"
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        {types.map(type => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <p className="input-label-event">
                        Capacity
                    </p>
                    <input
                        className="input-box-event"
                        id="capacity"
                        type="number"
                        name="capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                    />
                </label>
                <label>
                    <p className="input-label-event">
                        Price
                    </p>
                    <input
                        className="input-box-event"
                        id="price"
                        type="number"
                        placeholder='00.00'
                        name="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </label>
                <label>
                    <p className="input-label-event">
                        Description
                    </p>
                    <textarea
                        className="input-textarea-event"
                        id="description"
                        type="text"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <label>
                    <p className="input-label-event">
                        Start Date
                    </p>
                    <input
                        className="input-date-event"
                        id="startdate"
                        type="datetime-local"
                        name="startdate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </label>
                <label>
                    <p className="input-label-event">
                        End Date
                    </p>
                    <input
                        className="input-date-event"
                        id="enddate"
                        type="datetime-local"
                        name="enddate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </label>

                <button type="submit" className="submit-button-event">Submit</button>
            </form>
        </div>
    )
}

export default CreateEventModal;
