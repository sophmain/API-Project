import { useModal } from "../../context/Modal"
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { thunkEditGroup } from "../../store/groups"
import './editgroupmodal.css'


const EditGroupModal = () => {
    const types = ['Online', 'In person']

    const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT',
        'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
        'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE',
        'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
        'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
        'WV', 'WI', 'WY']

    const groupToEdit = useSelector(state => state.groups.singleGroup)

    const dispatch = useDispatch()
    const { closeModal } = useModal();
    const history = useHistory();
    const [name, setName] = useState(groupToEdit.name)
    const [about, setAbout] = useState(groupToEdit.about)
    const [type, setType] = useState(groupToEdit.type)
    const [isprivate, setIsPrivate] = useState(groupToEdit.private)
    const [city, setCity] = useState(groupToEdit.city)
    const [state, setState] = useState(groupToEdit.state)
    const [errors, setErrors] = useState([])

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

        return dispatch(thunkEditGroup(payload, groupToEdit.id))
            .then(closeModal)
            .then(history.push(`/groups/${groupToEdit.id}`))
            .catch(
                async (res) => {
                    const data = await res.json();
                    if (data && data.errors) setErrors(data.errors);
                }
            );

    }



    return (
        <div className='new-group-form-holder'>
            <h1>Edit group</h1>
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
                <button type="submit" className="submit-button-group">Submit</button>
                </div>
            </form>
        </div>
    )

}

export default EditGroupModal;
