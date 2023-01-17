import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { thunkCreateGroup } from '../../store/groups';
import { useModal } from "../../context/Modal";

const CreateGroupForm = () => {
    const types = ['Online', 'In person']

    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const history = useHistory();
    const [name, setName] = useState('')
    const [about, setAbout] = useState('')
    const [type, setType] = useState(types[0])
    const [isprivate, setIsPrivate] = useState(true)
    const [city, setCity] = useState('')
    const [state, setState] = useState('')

    //const updateName = (e) => setName(e.target.value)
    //const updateAbout = (e) => setName(e.target.value)
    //const updateType = (e) => setName(e.target.value)
    const updateIsPrivate = (e) => setName(e.target.value)
    const updateCity = (e) => setName(e.target.value)
    const updateState = (e) => setName(e.target.value)

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name,
            about,
            type,
            isprivate,
            city,
            state
        }

        let createdGroup = await dispatch(thunkCreateGroup(payload))

        if (createdGroup) {
            history.push(`/groups/${createdGroup.id}`)
        }
    }

    return (
        <div className='new-group-form-holder'>
            <form className="create-group-form" onSubmit={handleSubmit}>
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
                    Make my group private:
                    <input
                        id="checkbox"
                        type="checkbox"
                        name="isprivate"
                        checked = {isprivate}
                        value={isprivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
        </div>
    )

}

export default CreateGroupForm;
