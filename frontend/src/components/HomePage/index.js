import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom'
import './homepage.css'



function HomePage() {

const user = useSelector(state => state.session.user)

if (user){
    return (
        <div className="container">
            <h1 className="welcome-message">Welcome, {user.firstName} 👋</h1>
                <NavLink to={`/groups`} className="groups-nav">
                    <h2 className="groups-nav-text">
                        Find a group to join
                    </h2>
                </NavLink>
        </div>
    )
} else {
    return (
        <div>No user signed in</div>
    )
}


}

export default HomePage;
