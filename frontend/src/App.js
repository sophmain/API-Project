import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import GroupsIndex from "./components/GroupsIndex";
import GroupDetails from "./components/GroupDetails";
import CreateGroupModal from "./components/CreateGroupModal"
import OpenModalButton from "./components/OpenModalButton";
import HomePage from "./components/HomePage"
import EditGroupModal from "./components/EditGroupModal";
import EventsIndex from "./components/EventsIndex";
import EventDetails from "./components/EventDetails"
import CreateEventModal from "./components/CreateEventModal"


function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  // only render edit/create modals if user is owner of group
  const user = useSelector(state => state.session.user)
  const group = useSelector(state => state.groups.singleGroup)
  let editModalButton;
  if (group && user && group.organizerId == user.id) {
    editModalButton = [
      <>
        <GroupDetails />
        <OpenModalButton
          buttonText="Edit group"
          modalComponent={<EditGroupModal />}
        />
        <OpenModalButton
          buttonText="Create event"
          modalComponent={<CreateEventModal />}
        />
      </>
    ]
  } else {
    editModalButton = [
      <GroupDetails />
    ]
  }

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path={'/'}>
            <HomePage />
          </Route>
          <Route exact path={'/groups'}>
            <GroupsIndex />
            <OpenModalButton
              buttonText="Create a group"
              modalComponent={<CreateGroupModal />}
            />
          </Route>
          <Route exact path={'/events'}>
            <EventsIndex />
          </Route>
          <Route exact path={'/groups/:groupId'}>
            {editModalButton}
          </Route>
          <Route exact path={'/events/:eventId'}>
            <EventDetails />
          </Route>
        </Switch>
      )}

    </>
  );
}

export default App;
