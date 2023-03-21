import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';


function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();

    const openMenu = () => {
        if (showMenu) return;
        setShowMenu(true);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
            if (!ulRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', closeMenu);

        return () => document.removeEventListener("click", closeMenu);
    }, [showMenu]);

    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
    };

    const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

    const userLetter = user.firstName.slice(0,1)

    return (
        <>
                <button className="user-button" onClick={openMenu}>

                        <div className="user-circle">{userLetter} </div>
                        <i className="fa-solid fa-angle-down"></i>

                    {/* <i className="fas fa-user-circle" /> */}
                </button>
                <ul className={ulClassName} ref={ulRef}>
                    <li>{user.username}</li>
                    <li className="dropdown-element">{user.firstName} {user.lastName}</li>
                    <li className="dropdown-element">{user.email}</li>
                    <li className="dropdown-element  dropdown-line">
                        <button className="logout-button" onClick={logout}>Log out</button>
                    </li>
                </ul>
        </>
    );
}

export default ProfileButton;
