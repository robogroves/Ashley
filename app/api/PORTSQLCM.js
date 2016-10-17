
var sql = require('mssql');
import * as PORTACTION from "../actions/PORTActionConst.js"
import * as PORTSTATE from "../actions/PORTState.js"
import * as PORTCHK from "../actions/PORTChkConst.js"
import * as CONNECT from "./PORTSQLConst.js"
import * as MISC from "./Misc.js"

var prod=false;

var portQuery1Done=false;
var portQuery1Cnt=0;
var portQuery2Done=false;
var portQuery2Cnt=0;
var portQueriesFailed=false;
/*var portQuery3Done=false;
var portQuery3Cnt=0;
*/
var portQueriesFailed=false;

export async function portCribQueries(disp){
  var dispatch=disp;
  var cnt=0;
  portQueriesInit();
  portQuery1(dispatch);
  portQuery2(dispatch);
/*  portQuery3(dispatch);
  portQuery3(dispatch);
*/
  while(!arePortQueriesDone() && !portQueriesFailed){
    if(++cnt>15){
      dispatch({ type:PORTACTION.SET_REASON, reason:`portCribQueries(disp) Cannot Connection` });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
      break;
    }else{
      await MISC.sleep(2000);
    }
  }

  if(arePortQueriesDone()){
    console.log(`portCribQueries() Sucess`)
  }

}

export function portQueriesInit(){
  portQuery1Done=false;
  portQuery1Cnt=0;
  portQuery2Done=false;
  portQuery2Cnt=0;
  portQueriesFailed=false;

/*  portQuery3Done=false;
  portQuery3Cnt=0;
*/  portQueriesFailed=false;
}

export function arePortQueriesDone(){
  if(
    (true==portQuery1Done) &&
    (true==portQuery2Done) 
//    (true==portQuery3Done)
    )
  {
    return true;
  } else{
    return false;
  }
}

export function didPortQueriesFail(){
  if(true == portQueriesFailed) 
  {
    return true;
  } else{
    return false;
  }
}


function portQuery1(disp){
  var dispatch=disp;
  console.log(`portQuery1(disp) top=>${portQuery1Cnt}`);

  var cribConnection = new sql.Connection(CONNECT.cribDefTO, function(err) {
    // ... error checks
    if(null==err){
      console.log(`portQuery1(disp) Connection Sucess`);
      // Query

      var request = new sql.Request(cribConnection); // or: var request = connection1.request();
      request.query(
      `
        select UDF_POCATEGORY,RTrim(UDF_POCATEGORYDescription) descr from UDT_POCATEGORY
      `, function(err, recordset) {
          if(null==err){
            // ... error checks
            console.log(`portQuery1(disp) Query Sucess`);
            console.dir(recordset);
            portQuery1Done=true;
            console.log("portQuery1(disp) done");
            var allCats=[];
            var catRecs=[];
            var cribRsLog;
            recordset.forEach(function(pocat,i,arr){
              console.log(pocat.descr);
              if(arr.length===i+1){
                cribRsLog+=`UDF_POCATEGORY# ${pocat.UDF_POCATEGORY}, descr: ${pocat.descr}`;
              }else{
                cribRsLog+=`UDF_POCATEGORY# ${pocat.UDF_POCATEGORY}, descr: ${pocat.descr}\n`;
              }
              allCats.push(pocat.descr);
              catRecs.push({UDF_POCATEGORY:pocat.UDF_POCATEGORY, descr:pocat.descr});
            });
            dispatch({ type:PORTACTION.SET_PO_CATEGORIES, catTypes:allCats });
            dispatch({ type:PORTACTION.SET_PO_CAT_RECORDS, catRecs:catRecs });


/*              dispatch({ type:PORTACTION.SET_PRIMED, primed:true });
              if(updateState){
                dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.PRIMED });
              }
*/
          }else{
            if(++portQuery1Cnt<3) {
              console.log(`portQuery1.query:  ${err.message}` );
              console.log(`portQuery1Cnt = ${portQuery1Cnt}`);
            }else{
              dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
              dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
              portQueriesFailed=true;
            }
          }
        }
      );
    }else{
      if(++portQuery1Cnt<3) {
        console.log(`portQuery1.Connection:  ${err.message}` );
        console.log(`portQuery1Cnt = ${portQuery1Cnt}`);
      }else{
        dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
        dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
        portQueriesFailed=true;
      }
    }
  });
  
  cribConnection.on('error', function(err) {
    if(++portQuery1Cnt<3) {
      console.log(`portQuery1.on('error', function(err):  ${err.message}` );
      console.log(`portQuery1Cnt = ${portQuery1Cnt}`);
    }else{
      dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
      portQueriesFailed=true;
    }
  });
}

function portQuery2(disp){
  var dispatch=disp;
  console.log(`portQuery2(disp) top=>${portQuery2Cnt}`);

  var cribConnection = new sql.Connection(CONNECT.cribDefTO, function(err) {
    // ... error checks
    if(null==err){
      console.log(`portQuery2(disp) Connection Sucess`);
      // Query

      var request = new sql.Request(cribConnection); // or: var request = connection1.request();
      request.query(`
        select VendorNumber,
        rtrim(VendorName)  +
        case 
          when PurchaseCity is null then 'unknown' 
          else ' - ' + rtrim(PurchaseCity)
        end + ' - ' + 
        rtrim(VendorNumber) 
        as Description
        from vendor 
        where VendorName is not NULL
        order by VendorName
        `,
        function(err, recordset) {
          if(null==err){
            // ... error checks
            console.log(`portQuery2(disp) Query Sucess`);
            console.dir(recordset);
            portQuery2Done=true;
            var vendorSelect=[];
            recordset.forEach(function(vendor,i,arr){
              vendorSelect.push(vendor.Description);
            });
            dispatch({ type:PORTACTION.SET_VENDORS, vendors:recordset });
            dispatch({ type:PORTACTION.SET_VENDOR_SELECT, vendorSelect:vendorSelect });
          }else{
            if(++portQuery2Cnt<3) {
              console.log(`portQuery2.query:  ${err.message}` );
              console.log(`portQuery2Cnt = ${portQuery2Cnt}`);
            }else{
              dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
              dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
              portQueriesFailed=true;
            }
          }
        }
      );
    }else{
      if(++portQuery2Cnt<3) {
        console.log(`portQuery2.Connection:  ${err.message}` );
        console.log(`portQuery2Cnt = ${portQuery2Cnt}`);
      }else{
        dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
        dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
        portQueriesFailed=true;
      }
    }
  });
  
  cribConnection.on('error', function(err) {
    if(++portQuery2Cnt<3) {
      console.log(`portQuery2.on('error', function(err):  ${err.message}` );
      console.log(`portQuery2Cnt = ${portQuery2Cnt}`);
    }else{
      dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
      portQueriesFailed=true;
    }
  });
}


/*function portQuery3(disp){
  var dispatch=disp;
  console.log(`portQuery3(disp) top=>${portQuery3Cnt}`);

  var cribConnection = new sql.Connection(CONNECT.cribDefTO, function(err) {
    // ... error checks
    if(null==err){
      console.log(`portQuery3(disp) Connection Sucess`);
      // Query

      var request = new sql.Request(cribConnection); // or: var request = connection1.request();
      request.query(`
        select 
        rtrim(VendorName)  +
        case 
          when PurchaseCity is null then 'unknown' 
          else ' - ' + rtrim(PurchaseCity)
        end + ' - ' + 
        rtrim(VendorNumber) 
        as Description
        from vendor 
        where VendorName is not NULL
        order by VendorName
        `,
        function(err, recordset) {
          if(null==err){
            // ... error checks
            console.log(`portQuery3(disp) Query Sucess`);
            console.dir(recordset);
            portQuery3Done=true;
            if(recordset.length!==0){
              console.log("VendorSelect retrieved.");
              var vendorSelect=[];
              recordset.forEach(function(vendor,i,arr){
                vendorSelect.push(vendor.Description);
              });
              dispatch({ type:PORTACTION.SET_VENDOR_SELECT, vendorSelect:vendorSelect });
            }
          }else{
            if(++portQuery3Cnt<3) {
              console.log(`portQuery3.query:  ${err.message}` );
              console.log(`portQuery3Cnt = ${portQuery3Cnt}`);
            }else{
              dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
              dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
              portQueriesFailed=true;
            }
          }
        }
      );
    }else{
      if(++portQuery3Cnt<3) {
        console.log(`portQuery3.Connection:  ${err.message}` );
        console.log(`portQuery3Cnt = ${portQuery3Cnt}`);
      }else{
        dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
        dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
        portQueriesFailed=true;
      }
    }
  });
  
  cribConnection.on('error', function(err) {
    if(++portQuery3Cnt<3) {
      console.log(`portQuery3.on('error', function(err):  ${err.message}` );
      console.log(`portQuery3Cnt = ${portQuery3Cnt}`);
    }else{
      dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
      portQueriesFailed=true;
    }
  });
}


*/