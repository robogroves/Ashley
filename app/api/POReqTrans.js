
var sql = require('mssql');
const {dialog} = require('electron').remote;
import * as PORTACTION from "../actions/PORTActionConst.js"
import * as PORTSTATE from "../actions/PORTState.js"
import * as PORTCHK from "../actions/PORTChkConst.js"

var m2m = {
  user: 'sa',
  password: 'buschecnc1',
//  server: '192.168.1.113', // You can use 'localhost\\instance' to connect to named instance
  server: '10.1.2.19',//   server: 'busche-sql-1', // You can use 'localhost\\instance' to connect to named instance
  database: 'm2mdata01',
  port: 1433,
//    debug: true,
  options: {
      encrypt: false // Use this if you're on Windows Azure
     // ,instanceName: 'SQLEXPRESS'
  },
  requestTimeout: 60000

}

var m2mCheck = {
  user: 'sa',
  password: 'buschecnc1',
//  server: '192.168.1.113', // You can use 'localhost\\instance' to connect to named instance
  server: '10.1.2.19',//   server: 'busche-sql-1', // You can use 'localhost\\instance' to connect to named instance
  database: 'm2mdata01',
  port: 1433,
//    debug: true,
  options: {
      encrypt: false // Use this if you're on Windows Azure
     // ,instanceName: 'SQLEXPRESS'
  }
}

var crib = {
 user: 'sa',
  password: 'buschecnc1',
//  server: '192.168.1.113', // You can use 'localhost\\instance' to connect to named instance
  server: '10.1.2.17',//   server: 'busche-sql-1', // You can use 'localhost\\instance' to connect to named instance
  options: {
    database: 'Cribmaster',
    port: 1433 // Use this if you're on Windows Azure
     // ,instanceName: 'SQLEXPRESS'
  },
  requestTimeout: 60000
}

var cribCheck = {
 user: 'sa',
  password: 'buschecnc1',
//  server: '192.168.1.113', // You can use 'localhost\\instance' to connect to named instance
  server: '10.1.2.17',//   server: 'busche-sql-1', // You can use 'localhost\\instance' to connect to named instance
  options: {
    database: 'Cribmaster',
    port: 1433 // Use this if you're on Windows Azure
     // ,instanceName: 'SQLEXPRESS'
  }
}

/* home
var crib = {
  user: 'sa',
  password: 'buschecnc1',
//  server: '192.168.1.113',
  server: '10.1.2.17', //   server: 'busche-sql', // You can use 'localhost\\instance' to connect to named instance
  database: 'cribmaster',
  port: 1433,
  //    debug: true,

  requestTimeout: 60000,
  options: {
      encrypt: false // Use this if you're on Windows Azure
      //,instanceName: 'SQLEXPRESS'
  }

}
*/
var prod=false;
var errors=false;

function dbgPrime(){
  console.log('start of CribMaster dbgPrime');
  sql.connect(crib).then(function() {
    console.log('dbgPrime CribMaster connected.');
  }).catch(function(err) {
    console.log(`Connection CribMaster dbgPrime err:  ${err.message}` );
  });
/*
  console.log('start of Made2Manage dbgPrime');
  sql.connect(m2m).then(function() {
    console.log('dbgPrime m2m connected.');
  }).catch(function(err) {
    console.log(`Connection m2m dbgPrime err:  ${err.message}` );
  });

*/}


export function primeDB(disp){
  var dispatch=disp;
  dbgPrime();
  primeCribDB(dispatch);
}

function primeCribDB(disp){
  var dispatch=disp;
  console.log('start of CribMaster primeDB');
  sql.connect(cribCheck).then(function() {
    console.log('CribMaster Connection primed');
    dispatch({ type:PORTACTION.SET_PRIMED, state:true });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.PRIMED });
//    primeM2mDB(dispatch);
  }).catch(function(err) {
    console.log(`Connection CribMaster Prime err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

export function primeM2mDB(disp){
  var dispatch=disp;
  console.log('start of M2m primeDB');
  sql.connect(m2mCheck).then(function() {
    console.log('M2m Connection primed');
    dispatch({ type:PORTACTION.SET_PRIMED, state:true });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.PRIMED });
  }).catch(function(err) {
    console.log(`M2m Connection Prime err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
/*  var cribConnection = new sql.Connection(crib,function(err){
    // error checks
    console.log('Connection created');
  });
  cribConnection.on('error', function(err) {
    console.log(`Connection1 err:  ${err}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
*/}



export function updateCheck1(dispatch,poNumber,item,poCategory) {
//  var that = this;
  var disp = dispatch;
  var cribConnection = new sql.Connection(crib,function(err){
    // error checks
    updChk1(disp,cribConnection,poNumber,item,poCategory);
  });
  cribConnection.on('error', function(err) {
    console.log(`Connection1 err:  ${err}` );
    // ... error handler
  });
} // poUpdate

function  updChk1(disp,cribConnection,poNumber,item,poCategory) {
//    var that = this;
    var dispatch = disp;
    let qryCrib;
    if (prod===true) {
      qryCrib = `
        update PODETAIL
        set UDF_POCATEGORY = ${poCategory}
        where 
        PONumber = ${poNumber} and Item = ${item}
      `;
    }else{
      qryCrib = `
        update btPODETAIL
        set UDF_POCATEGORY = ${poCategory}
        where 
        PONumber = ${poNumber} and Item = ${item}
      `;
    }

    let cribReq = new sql.Request(cribConnection);

    cribReq.query(qryCrib, function(err,cribRs) {
      // error checks
      console.dir(err);
      console.dir(cribRs);
      POReqTrans(dispatch);
    });
  }



export default function POReqTrans(disp) {
//  var that = this;
  var dispatch = disp;

  dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.STARTED });

  var connect=sql.connect(crib).then(function() {
    getPOCategories(dispatch);
  }).catch(function(err) {
    console.log(`POReqTran Connect err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });

} // poUpdate

function getPOCategories(disp) {
  var dispatch=disp;
  let qryCrib = `
    select UDF_POCATEGORY,RTrim(UDF_POCATEGORYDescription) descr from UDT_POCATEGORY
  `;

  // PO Categories query
  new sql.Request()
  .query(qryCrib).then(function(recordset) {
    if(recordset.length!==0){
      console.log("PO category retrieved.");
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
      poCatChk(dispatch);
    }
  }).catch(function(err) {
    console.log(`POReqTran PO Category query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}


/********************CHECK IF ALL PO CATEGORIES HAVE BEEN SELECTED FOR EACH PO ITEM & THE RECORDS ARE NOT LOCKED****************/

function  poCatChk(disp) {
  var dispatch=disp;
  let qryChk1;
  if (prod===true) {
    qryChk1 = `
      SELECT ROW_NUMBER() OVER(ORDER BY PONumber, Item) id,PONumber,RTrim(Item) Item,RTrim(ItemDescription) ItemDescription,RTrim(UDF_POCATEGORY) UDF_POCATEGORY
      FROM PODETAIL
      WHERE PONUMBER in
      (
        SELECT ponumber FROM [PO]  WHERE [PO].POSTATUSNO = 3 and [PO].SITEID <> '90'
      )
      and UDF_POCATEGORY is null
    `;
  }else{
    qryChk1 = `
      SELECT ROW_NUMBER() OVER(ORDER BY PONumber, Item) id,PONumber,RTrim(Item) Item,RTrim(ItemDescription) ItemDescription,RTrim(UDF_POCATEGORY) UDF_POCATEGORY
      FROM btPODETAIL
      WHERE PONUMBER in
      (
        SELECT ponumber FROM [btPO]  WHERE [btPO].POSTATUSNO = 3 and [btPO].SITEID <> '90'
      )
      and UDF_POCATEGORY is null
    `;
  }

  new sql.Request()
  .query(qryChk1).then(function(recordset) {
    if(recordset.length!==0){
      let cribRsErr ="";
      recordset.forEach(function(podetail,i,arr){
        console.log(podetail.Item);
        if(arr.length===i+1){
          cribRsErr+=`PO# ${podetail.PONumber}, Item: ${podetail.Item}`;
        }else{
          cribRsErr+= `PO# ${podetail.PONumber}, Item: ${podetail.Item}\n`;
        }
      });
      console.log("Failed PO category check.");
      dispatch({ type:PORTACTION.SET_NO_CAT_LIST, noCatList:recordset });
      dispatch({ type:PORTACTION.SET_CHECK1, chk1:PORTCHK.FAILURE });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.STEP_10_FAIL });
    }else {
      dispatch({ type:PORTACTION.SET_CHECK1, chk1:PORTCHK.SUCCESS });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.STEP_10_PASS });
      getVendors(dispatch);
    }
  }).catch(function(err) {
    console.log(`POReqTran NO PO category query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

function getVendors(disp) {
  var dispatch=disp;
  let qryCrib = `
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
  `;

  // Vendor query
  new sql.Request()
  .query(qryCrib).then(function(recordset) {
      dispatch({ type:PORTACTION.SET_VENDORS, vendors:recordset });
      getVendorSelect(dispatch);
  }).catch(function(err) {
    console.log(`POReqTran Vendor query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

function getVendorSelect(disp) {
  var dispatch=disp;
  let qryCrib = `
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
  `;

  // Vendor query
  new sql.Request()
  .query(qryCrib).then(function(recordset) {
    if(recordset.length!==0){
      console.log("VendorSelect retrieved.");
      var vendorSelect=[];
      recordset.forEach(function(vendor,i,arr){
        vendorSelect.push(vendor.Description);
      });
      dispatch({ type:PORTACTION.SET_VENDOR_SELECT, vendorSelect:vendorSelect });
      portCheck2(dispatch);
    }
  }).catch(function(err) {
    console.log(`POReqTran Vendor Select query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

/*******************CHECK IF PO HAS A VALID VENDOR IN CRIBMASTER****************/

function  portCheck2(disp) {
//    var that = this;
  var dispatch = disp;
  let qryChk2;
  if (prod===true) {
    qryChk2 = `
      select ROW_NUMBER() OVER(ORDER BY PONumber) id, po.PONumber, po.Address1
      from
      (
          SELECT PONumber,Vendor,Address1 FROM [PO]  WHERE [PO].POSTATUSNO = 3 and [PO].SITEID <> '90'
      ) po
      left outer join
      vendor
      on po.vendor = Vendor.VendorNumber
      where Vendor.VendorNumber is null
    `;
  }else{
    qryChk2 = `
      select ROW_NUMBER() OVER(ORDER BY PONumber) id,po.PONumber, po.Address1
      from
      (
          SELECT PONumber,Vendor,Address1 FROM [btPO]  WHERE [btPO].POSTATUSNO = 3 and [btPO].SITEID <> '90'
      ) po
      left outer join
      vendor
      on po.vendor = Vendor.VendorNumber
      where Vendor.VendorNumber is null
    `;
  }

  new sql.Request()
  .query(qryChk2).then(function(recordset) {
      console.log("portCheck2 query done");

      // error checks
      if(recordset.length!==0){
        let cribRsErr ="";
        recordset.forEach(function(podetail,i,arr){
          console.log(podetail.Item);
          if(arr.length===i+1){
            cribRsErr+=`PO# ${podetail.PONumber}, Item: ${podetail.Item}`;
          }else{
            cribRsErr+= `PO# ${podetail.PONumber}, Item: ${podetail.Item}\n`;
          }
        });
        console.log("portCheck2 query had records.");
        dispatch({ type:PORTACTION.SET_CHECK2, chk2:PORTCHK.FAILURE });
        dispatch({ type:PORTACTION.SET_GO_BUTTON, goButton:'error' });
        dispatch({ type: PORTACTION.SET_NO_CRIB_VEN, noCribVen:recordset });
        dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.STEP_20_FAIL});
      }else {
        dispatch({ type:PORTACTION.SET_CHECK2, chk2:PORTCHK.SUCCESS});
        dispatch({ type:PORTACTION.SET_GO_BUTTON, goButton:'success' });
        dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.SUCCESS });
      }
  }).catch(function(err) {
    console.log(`POReqTran NO PO category query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, state:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}


//export default POReqTrans;
///export fetchPOCategories;