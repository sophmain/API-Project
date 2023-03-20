import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import GroupsIndex from "./components/GroupsIndex";
import GroupDetails from "./components/GroupDetails";
import HomePage from "./components/HomePage"
import EventsIndex from "./components/EventsIndex";
import EventDetails from "./components/EventDetails"


function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);


  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path={'/'}>
            <HomePage />
          </Route>
          <Route exact path={'/groups'}>
            <GroupsIndex isLoaded={isLoaded} />
          </Route>
          <Route exact path={'/events'}>
            <EventsIndex />
          </Route>
          <Route exact path={'/groups/:groupId'}>
            <GroupDetails isLoaded={isLoaded} />
          </Route>
          <Route exact path={'/events/:eventId'}>
            <EventDetails isLoaded={isLoaded} />
          </Route>
        </Switch>
      )}

    </>
  );
}

export default App;
