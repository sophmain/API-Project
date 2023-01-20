import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { thunkCreateGroup } from '../../store/groups';
import { useModal } from "../../context/Modal";
import './creategroupmodal.css'

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
                    {errors.map((error, index) => <li className="errors-text" key={index}>{error}</li>)}
                </ul>
                <div className="create-group-inputs">
                <label>
                    <p className="input-label-group">
                    Name
                        </p>
                    <input
                        className="input-box-group"
                        id="name"
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label>
                <p className="input-label-group">
                    About
                        </p>
                    <textarea
                        className="input-textarea-group"
                        id="about"
                        type="textarea"
                        placeholder='Please write at least 50 characters.'
                        name="about"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                    />
                </label>
                <label>
                <p className="input-label-group">
                    Type
                        </p>
                    <select
                        className="input-dropdown-group"
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
                    <div className="group-checkbox">
                <p className="input-label-group">
                    Make my group private
                        </p>
                    <input
                        className="input-box-group"
                        id="checkbox"
                        type="checkbox"
                        name="isprivate"
                        checked={isprivate}
                        value={isprivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    </div>
                </label>
                <label>
                <p className="input-label-group">
                    City
                        </p>
                    <input
                        className="input-box-group"
                        id="city"
                        type="text"
                        name="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </label>
                <label>
                <p className="input-label-group">
                    State
                        </p>
                    <select
                        className="input-dropdown-group"
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
                <p className="input-label-group">
                    Add image
                        </p>
                    <input
                        className="input-box-group"
                        id="url"
                        placeholder="Image URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    >

                    </input>
                </label>
                <button type="submit" className="submit-button-group">Submit</button>
                </div>
            </form>
        </div>
    )
}

export default CreateGroupForm;
