import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom'
import './homepage.css'



function HomePage() {

    const user = useSelector(state => state.session.user)

    if (user) {
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
            <div className="home-container">
                <div className="home-header-flex">
                    <div className="home-headers">
                        <h1 className="home-title">
                            The people platform- Where fake interests become fake friendships
                        </h1>
                        <p className="home-subheader">
                            Whatever your fake interest, from online hiking to making spaghetti, there are maybe two or three fake users who share it on MeetYup. Events are never happening- log in to join the fun!
                        </p>
                    </div>
                    <img className="home-image" src='https://img.freepik.com/free-vector/people-meeting-online-via-video-conference-flat-illustration-cartoon-group-colleagues-virtual-collective-chat-during-lockdown_74855-14136.jpg?w=2000' alt="zoom cartoon" />
                </div>
            </div>
        )
    }


}

export default HomePage;
