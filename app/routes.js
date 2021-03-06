import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import POReqTrans from './containers/POReqTrans';
import GenReceivers from './containers/GR/GenReceivers';
import Reports from './containers/Rpt/Reports';


export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="/POReqTrans" component={POReqTrans} />
    <Route path="/GenReceivers" component={GenReceivers} />
    <Route path="/Reports" component={Reports} />
  </Route>
);
