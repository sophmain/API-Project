import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { thunkCreateGroup } from '../../store/groups';
import { useModal } from "../../context/Modal";

const CreateGroupForm = () => {
    const types = ['Online', 'In person']

    const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT',
        'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
        'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE',
        'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
        'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
        'WV', 'WI', 'WY']

    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const history = useHistory();
    const [name, setName] = useState('')
    const [about, setAbout] = useState('')
    const [type, setType] = useState(types[0])
    const [isprivate, setIsPrivate] = useState(true)
    const [city, setCity] = useState('')
    const [state, setState] = useState(states[0])
    const [url, setUrl] = useState("")
    const [errors, setErrors] = useState([])
    const [createdGroup, setCreatedGroup] = useState()


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        const payload = {
            name,
            about,
            type,
            private: isprivate,
            city,
            state,
        }

        const image = {
            url,
            preview: true
        }

        return dispatch(thunkCreateGroup(payload, image))
            //wait for group to be returned from dispatch, use useEffect to rerender to be able to grab id from created group
            .then((group) => {
                setCreatedGroup(group)
            })
            .then(closeModal)
            .catch(
                async (res) => {
                    const data = await res.json();
                    if (data && data.errors) setErrors(data.errors);
                });

    }
    useEffect(() => {
        if (createdGroup) {
            history.push(`/groups/${createdGroup.id}`)
        }
    }, [createdGroup])

    return (
        <div className='new-group-form-holder'>
            <h1>Create a group</h1>
            <form className="create-group-form" onSubmit={handleSubmit}>
                <ul>
                    {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                </ul>
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
                    About:
                    <textarea
                        id="about"
                        type="text"
                        placeholder='Please write at least 50 characters'
                        name="about"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
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
                    Make my group private:
                    <input
                        id="checkbox"
                        type="checkbox"
                        name="isprivate"
                        checked={isprivate}
                        value={isprivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                </label>
                <label>
                    City:
                    <input
                        id="city"
                        type="text"
                        name="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </label>
                <label>
                    State:
                    <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                    >
                        {states.map(state => (
                            <option
                                key={state}
                                value={state}
                            >
                                {state}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Add image:
                    <input
                        id="url"
                        placeholder="image URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    >

                    </input>
                </label>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default CreateGroupForm;
