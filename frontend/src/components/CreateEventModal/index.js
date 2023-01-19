import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useModal } from "../../context/Modal";
import { thunkCreateEvent } from '../../store/events';


const CreateEventModal = () => {
    const types = ['Online', 'In person']

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

    const newStartDate = startDate.replace("T",' ').concat(':00')
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
            <h1>Create an event</h1>
            <form className="create-event-form" onSubmit={handleSubmit}>
                <ul>
                    {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                </ul>
                <label>
                    venueId:
                    <input
                        id="venueId"
                        type="number"
                        step="1"
                        name="venueId"
                        value={venueId}
                        onChange={(e) => setVenueId(e.target.value)}
                    />
                </label>
                <label>
                    Name:
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label>
                    Type:
                    <select
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
                    Capacity:
                    <input
                        id="capacity"
                        type="number"
                        name="capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                    />
                </label>
                <label>
                    Price:
                    <input
                        id="price"
                        type="number"
                        placeholder='00.00'
                        name="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        id="description"
                        type="text"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <lable>
                    Start Date:
                    <input
                        id="startdate"
                        type="datetime-local"
                        name="startdate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </lable>
                <lable>
                    End Date:
                    <input
                        id="enddate"
                        type="datetime-local"
                        name="enddate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </lable>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default CreateEventModal;
