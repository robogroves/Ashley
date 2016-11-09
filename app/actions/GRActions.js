import * as GRACTION from "./GRConst.js"
import { push } from 'react-router-redux';
import * as GRAPI from '../api/GR/GenReceivers';
import * as MISC from "../api/Misc.js"
//Supervisor-PLT-7

export function cancelApp() {
 return (dispatch,getState) => {
      dispatch({ type:GRACTION.INIT });
      dispatch(push('/'));
  };
}

export function init() {
  return {
    type: GRACTION.INIT
  };
}

export function prime() {
 return (dispatch,getState) => {
    var disp = dispatch;
    var getSt = getState;
    GRAPI.prime(disp,getSt);
  }
}

export function setCurrentReceiver(currentReceiver) {
  return {
    type: GRACTION.SET_CURRENT_RECEIVER,
    currentReceiver: currentReceiver
  };
}

export function setGoButton(goButton) {
  return {
    type: GRACTION.SET_GO_BUTTON,
    goButton: goButton
  };
}

export function setLogId(logId) {
  return {
    type: GRACTION.SET_LOGID,
    logId: logId
  };
}

export function setRCMast(rcmast) {
  return {
    type: GRACTION.SET_RCMAST,
    rcmast:rcmast
  };
}


export function setReceiverCount(receiverCount) {
  return {
    type: GRACTION.SET_RECEIVER_COUNT,
    receiverCount: receiverCount
  };
}

export function setShipVia(shipVia) {
  return {
    type: GRACTION.SET_SHIP_VIA,
    shipVia: shipVia
  };
}

export function setState(state) {
  return {
    type: GRACTION.SET_STATE,
    state: state
  };
}

export function setStatus(status) {
  return {
    type: GRACTION.SET_STATUS,
    status: status
  };
}

export function start(prime) {
 return (dispatch,getState) => {
    var disp = dispatch;
    var getSt = getState;
    GRAPI.start(disp,getSt,prime);
  };
}

export function updateRCMastFPackList(identity_column,newfPacklist) {
  var rcmast=getState().GenReceivers.rcmast;
  if ('development'==process.env.NODE_ENV) {
    console.log(`rcmast=>${rcmast}`);
  }
  var newRCMast=[];
  rcmast.every(function(oldRCMast,i,arr){

    if(oldRCMast.identity_column==identity_column){
      if ('development'==process.env.NODE_ENV) {
        console.log(oldRCMast.identity_column + "==" + identity_column);
      }
      oldRCMast.fpacklist=newfPacklist;
    }else{
      if ('development'==process.env.NODE_ENV) {
        console.log(oldRCMast.identity_column + "==" + identity_column);
      }
    }
    newRCMast.push(oldRCMast);

  });

  return {
    type: GRACTION.UPDATE_RCMAST,
    rcmast:newRCMast
  };
}

export function updateRCMastFFrtCarr(identity_column,ffrtcarr) {
  return {
    type: GRACTION.UPDATE_RCMAST_FFRTCARR,
    identity_column:identity_column,
    ffrtcarr,ffrtcarr
  };
}


