import { useModal } from "../../context/Modal"
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { thunkEditEvent } from "../../store/events"



const EditEventModal = () => {
    const types = ['Online', 'In person']

    const eventToEdit = useSelector(state => state.events.singleEvent)

    const dispatch = useDispatch()
    const { closeModal } = useModal();
    const history = useHistory();

    //function to format date to put into datetime-local form type
    function datetimeLocal(datetime) {
        const dt = new Date(datetime);
        dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
        return dt.toISOString().slice(0, 16);
    }

    const [venueId, setVenueId] = useState(eventToEdit.venueId)
    const [name, setName] = useState(eventToEdit.name)
    const [type, setType] = useState(eventToEdit.type)
    const [capacity, setCapacity] = useState(eventToEdit.capacity)
    const [price, setPrice] = useState(eventToEdit.price)
    const [description, setDescription] = useState(eventToEdit.description)
    const [startDate, setStartDate] = useState(datetimeLocal(eventToEdit.startDate))
    const [endDate, setEndDate] = useState(datetimeLocal(eventToEdit.endDate))
    const [errors, setErrors] = useState([])
    const [createdEvent, setCreatedEvent] = useState()
    const newStartDate = startDate.replace("T", ' ').concat(':00')
    const newEndDate = endDate.replace("T", ' ').concat(':00')

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        const payload = {
            venueId,
            name,
            type,
            capacity,
            price,
            description,
            startDate: new Date(newStartDate),
            endDate: new Date(newEndDate)
        }

        return dispatch(thunkEditEvent(payload, eventToEdit.id))
            .then(closeModal)
            .then(history.push(`/events/${eventToEdit.id}`))
            .catch(
                async (res) => {
                    const data = await res.json();
                    if (data && data.errors) setErrors(data.errors);
                }
            );

    }
    return (
        <div className='new-event-form-holder'>
            <form className="create-event-form" onSubmit={handleSubmit}>
                <h1>Edit event</h1>
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

export default EditEventModal;
