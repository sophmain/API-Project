import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import GroupsIndex from "./components/GroupsIndex";
import GroupDetails from "./components/GroupDetails";
import CreateGroupModal from "./components/CreateGroupModal"
import OpenModalButton from "./components/OpenModalButton";


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
          <Route exact path={'/groups'}>
            <GroupsIndex/>
            <OpenModalButton
              buttonText = "Create a group"
              modalComponent={<CreateGroupModal />}
            />
          </Route>
          <Route exact path = {'/groups/:groupId'}>
            <GroupDetails/>
          </Route>
        </Switch>
      )}

    </>
  );
}

export default App;
