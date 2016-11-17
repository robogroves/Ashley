
var sql = require('mssql');
import * as GRACTION from "../../actions/GRConst.js"
import * as GRSTATE from "../../actions/GRState.js"
import * as CONNECT from "../SQLConst.js"
import * as MISC from "../Misc.js"


var sql1Done=false;
var sql1Cnt=0;
var sql1Failed=false;
var contGR=false;
const ATTEMPTS=1;



export async function sql1(disp,getSt){
//  var that = this;
  var dispatch = disp;
  var getState = getSt;
  var state = getState(); 
  if ('development'==process.env.NODE_ENV) {
    console.log(`SQLSetRCMast=> top`);
  }


  var cnt=0;
  init();
  execSQL1(dispatch,getState);

  while(!isDone() && !didFail()){
    if(++cnt>15){
      dispatch({ type:GRACTION.SET_REASON, reason:`SetSQLRCMast.sql1() Timed Out or Failed.` });
      dispatch({ type:GRACTION.SET_STATE, state:GRSTATE.FAILURE });
      break;
    }else{
      await MISC.sleep(2000);
    }
  }

  if(isDone()){
    if ('development'==process.env.NODE_ENV) {
      console.log(`SQLSetRCMast.sql1(): Completed`)
    }

  }else{
    if ('development'==process.env.NODE_ENV) {
      console.log(`SQLSetRCMast.sql1(): Did NOT Complete`)
    }
  }

  if(didFail()){
    if ('development'==process.env.NODE_ENV) {
      console.log(`SQLSetRCMast.sql1(): Failed`)
    }

  }else{
    if ('development'==process.env.NODE_ENV) {
      console.log(`SQLSetRCMast.sql1(): Suceeded`)
    }
  }

}

function init(){
  sql1Done=false;
  sql1Cnt=0;
  sql1Failed=false;
  contGR=false;
}

export function isDone(){
  if(
    (true==sql1Done)
    )
  {
    return true;
  } else{
    return false;
  }
}

export function didFail(){
  if(
    (true==sql1Failed)
    )
  {
    return true;
  } else{
    return false;
  }
}
export function continueGR(){
  if(true==contGR)
  {
    return true;
  } else{
    return false;
  }
}



function execSQL1(disp,getSt){
  var dispatch = disp;
  var getState=getSt;
  if ('development'==process.env.NODE_ENV) {
    console.log(`SQLSetRCMast.execSQL1() top=>${sql1Cnt}`);
  }


  var connection = new sql.Connection(CONNECT.cribDefTO, function(err) {
    // ... error checks
    if(null==err){
      if ('development'==process.env.NODE_ENV) {
        console.log(`SQLSetRCMast.execSQL1() Connection Sucess`);
      }

      let sproc;

      if (MISC.PROD===true) {
        sproc = `bpGRGenReceivers`;
      }else{
        // Don't want to use bpGRGenRCMastDev for testing
        sproc = `bpGRGenReceivers`;
      }

      let currentReceiver = getState().GenReceivers.currentReceiver;

      var request = new sql.Request(connection); 
      request.input('currentReceiver', sql.Int,currentReceiver);
      request.execute(sproc, function(err, recordsets, returnValue, affected) {
        // ... error checks
        if(null==err){
          if ('development'==process.env.NODE_ENV) {
            console.log(`SQLSetRCMast.execSQL1() Sucess`);
/*            console.log(recordsets.length); // count of recordsets returned by the procedure
            console.log(recordsets[0].length); // count of rows contained in first recordset
            console.log(returnValue); // procedure return value
            console.log(recordsets.returnValue); // same as previous line
            console.log(affected); // number of rows affected by the statemens
            console.log(recordsets.rowsAffected); // same as previous line
            console.log(request.parameters.postart.value); // output value
            console.log(request.parameters.poend.value); // output value
*/          }
          dispatch({ type:GRACTION.SET_RCMAST,rcmast:recordsets[0]});
          dispatch({ type:GRACTION.SET_RCITEM,rcitem:recordsets[1]});
          sql1Done=true;
          contGR=true;
        }else {
          if(++sql1Cnt<ATTEMPTS) {
            if ('development'==process.env.NODE_ENV) {
              console.log(`SQLSetRCMast.execSQL1().query:  ${err.message}` );
              console.log(`sql1Cnt = ${sql1Cnt}`);
            }
          }else{
            if ('development'==process.env.NODE_ENV) {
              console.log(`SQLSetRCMast.execSQL1() err:  ${err.message}` );
            }
            dispatch({ type:GRACTION.SET_REASON, reason:err.message });
            dispatch({ type:GRACTION.SET_STATE, state:GRSTATE.FAILURE });
            sql1Failed=true;
          }
        }
      });
    }else{
      if(++sql1Cnt<ATTEMPTS) {
        if ('development'==process.env.NODE_ENV) {
          console.log(`SQLSetRCMast.Connection: ${err.message}` );
          console.log(`sql1Cnt = ${sql1Cnt}`);
        }
      }else{
        if ('development'==process.env.NODE_ENV) {
          console.log(`SQLSetRCMast.Connection: ${err.message}` );
        }
        dispatch({ type:GRACTION.SET_REASON, reason:err.message });
        dispatch({ type:GRACTION.SET_STATE, state:GRSTATE.FAILURE });
        sql1Failed=true;
      }
    }
  });
  
  connection.on('error', function(err) {
    if(++sql1Cnt<ATTEMPTS) {
      if ('development'==process.env.NODE_ENV) {
        console.log(`SQLSetRCMast.connection.on(error): ${err.message}` );
        console.log(`sql1Cnt = ${sql1Cnt}`);
      }

    }else{
      if ('development'==process.env.NODE_ENV) {
        console.log(`SQLSetRCMast.connection.on(error): ${err.message}` );
      }
      dispatch({ type:GRACTION.SET_REASON, reason:err.message });
      dispatch({ type:GRACTION.SET_STATE, state:GRSTATE.FAILURE });
      sql1Failed=true;
    }
  });
}

