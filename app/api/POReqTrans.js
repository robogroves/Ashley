
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
var m2mPrimed=false;
var cribPrimed=false;
var allPrimed=false;
var primeFailed=false;
var m2mConnectCnt=0;
var cribConnectCnt=0;
var primeFailed=false;


export async function primeDB(disp,stateUpdate){
  var dispatch=disp;
  var updateState=stateUpdate;
  var cnt=0;
  console.log(`primeDB top`);
  initPrime();
  cribConnect(dispatch,updateState);
  cribConnect(dispatch,updateState);
  cribConnect(dispatch,updateState);
  cribConnect(dispatch,updateState);
  m2mConnect(dispatch,updateState);
  m2mConnect(dispatch,updateState);
  m2mConnect(dispatch,updateState);
  m2mConnect(dispatch,updateState);

  while(!isPrimed() && !primeFailed){
    if(++cnt>15){
      dispatch({ type:PORTACTION.SET_REASON, reason:`primeDB(disp) Cannot Connection` });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
      break;
    }else{
      await sleep(2000);
    }
  }

}

function initPrime(){
  m2mPrimed=false;
  cribPrimed=false;
  allPrimed=false;
  primeFailed=false;
  cribConnectCnt=0;
  m2mConnectCnt=0;
}

function isPrimed(){
  if((true==m2mPrimed)&(true==cribPrimed)){
    return true;
  } else{
    return false;
  }
}

function cribConnect(disp,updateState){
  var dispatch=disp;
  console.log(`cribConnectCnt = ${cribConnectCnt}`);

  var cribConnection = new sql.Connection(cribCheck, function(err) {
    // ... error checks
    if(null==err){
      console.dir(cribConnection);
      // Query

      var request = new sql.Request(cribConnection); // or: var request = connection1.request();
      request.query(
      `
        select * from po where ponumber = 25619
      `, function(err, recordset) {
          if(null==err){
            // ... error checks
            console.log(`crib query`);
            console.dir(recordset);
            cribPrimed=true;
            if(m2mPrimed && !allPrimed){
              allPrimed=true;
              dispatch({ type:PORTACTION.SET_PRIMED, primed:true });
              if(updateState){
                dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.PRIMED });
              }
            }
          }else{
            if(++cribConnectCnt<3) {
              console.log(`cribConnect.query:  ${err.message}` );
              console.log(`cribConnectCnt = ${cribConnectCnt}`);
            }else{
              dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
              dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
              primeFailed=true;
            }
          }
        }
      );
    }else{
      if(++cribConnectCnt<3) {
        console.log(`cribConnect.Connection:  ${err.message}` );
        console.log(`cribConnectCnt = ${cribConnectCnt}`);
      }else{
        dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
        dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
        primeFailed=true;
      }
    }
  });
  
  cribConnection.on('error', function(err) {
    if(++cribConnectCnt<3) {
      console.log(`cribConnect.on('error', function(err):  ${err.message}` );
      console.log(`cribConnectCnt = ${cribConnectCnt}`);
    }else{
      dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
      primeFailed=true;
    }
  });
}

function m2mConnect(disp,updateState){
  var dispatch=disp;
  console.log(`m2mConnectCnt = ${m2mConnectCnt}`);

  var m2mConnection = new sql.Connection(m2mCheck, function(err) {
    // ... error checks
    if(null==err){
      console.dir(m2mConnection);
      var request = new sql.Request(m2mConnection); 
      request.query(
        `
          select fvendno, fcompany
          FROM apvend 
          where fvendno = '002946'
        `,function(err, recordset) {
            // ... error checks
            if(null==err){
              console.log(`m2mConnect: query success`);
              console.dir(recordset);
              m2mPrimed=true;
              if(cribPrimed && !allPrimed){
                allPrimed=true;
                dispatch({ type:PORTACTION.SET_PRIMED, primed:true });
                if(updateState){
                  dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.PRIMED });
                }
              }
            }else{
              if(++m2mConnectCnt<3) {
                console.log(`m2mConnect.query:  ${err.message}` );
                console.log(`m2mConnectCnt = ${m2mConnectCnt}`);
              }else{
                dispatch({ type:PORTACTION.SET_REASON, state:err.message });
                dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
                primeFailed=true;
              }
            }
          }
      );
    }else{
      if(++m2mConnectCnt<3) {
        console.log(`m2mConnect.Connection:  ${err.message}` );
        console.log(`m2mConnectCnt = ${m2mConnectCnt}`);
      }else{
        dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
        dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
        primeFailed=true;
      }

    }
  });
  
  m2mConnection.on('error', function(err) {
    if(++m2mConnectCnt<3) {
      console.log(`m2mConnect.on('error', function(err):  ${err.message}` );
      console.log(`m2mConnectCnt = ${m2mConnectCnt}`);
    }else{
      dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
      primeFailed=true;
    }
  });
}

export function updateCheck1(disp,poNumber,item,poCategory) {
//  var that = this;
  var dispatch = disp;

  var connect=sql.connect(crib).then(function() {
    updChk1(dispatch,poNumber,item,poCategory);
  }).catch(function(err) {
    console.log(`updateCheck1 Connect err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
} // updateCheck1

function  updChk1(disp,poNumber,item,poCategory) {
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

 // update PO Category query
  new sql.Request()
  .query(qryCrib).then(function(recordset) {
      // error checks
      console.dir(recordset);
      POReqTrans(dispatch);
  }).catch(function(err) {
    console.log(`POReqTran update PO Category query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });

}

export function updateCheck2(disp,poNumber,vendorNumber) {
//  var that = this;
  var dispatch = disp;

  var connect=sql.connect(crib).then(function() {
    updateChk2(dispatch,poNumber,vendorNumber);
  }).catch(function(err) {
    console.log(`POReqTran updateCheck2 Connect err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });

} // updateCheck2

function  updateChk2(disp,poNumber,vendorNumber) {
//    var that = this;
  var dispatch = disp;
  // update PO Vendor query
  new sql.Request()
  .input('poNumber', sql.Int, poNumber)
  .input('vendor', sql.VarChar(12), vendorNumber)
  .execute('bpDevPOVendorUpdate').then(function(recordsets) {
      console.dir(recordsets);
      POReqTrans(dispatch);
  }).catch(function(err) {
    console.log(`POReqTran update PO vendor query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });

}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*async function demo() {
  console.log('Taking a break...');
  await sleep(2000);
  console.log('Two second later');
}
*/
export default async function POReqTrans(disp) {
//  var that = this;
  var dispatch = disp;
  var cnt=0;
  initPrime();
  primeDB(dispatch,false);

  while(!isPrimed() && !primeFailed){
    if(++cnt>15){
      break;
    }else{
      await sleep(2000);
    }
  }

  if(!isPrimed()){
    // Exit if Not Primed
    return;
  }


  dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.STARTED });

  var cribConnect=sql.connect(crib).then(function() {
    getPOCategories(dispatch,cribConnect);

  }).catch(function(err) {
    console.log(`cribConnect err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });



/*  var cribConnect=sql.connect(crib).then(function() {
    getPOCategories(dispatch);

  }).catch(function(err) {
    console.log(`POReqTran Connect err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
*/

} // poUpdate




function getPOCategories(disp,cribConnection) {
  var dispatch=disp;
  var cribConnect=cribConnection;
  let qryCrib = `
    select UDF_POCATEGORY,RTrim(UDF_POCATEGORYDescription) descr from UDT_POCATEGORY
  `;

  // PO Categories query
  console.log(`getPOCategories()`);
  console.dir(cribConnect);
  new sql.Request(cribConnect)
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
      poCatChk(dispatch,cribConnect);
    }

  }).catch(function(err) {
    console.log(`POReqTran PO Category query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}


/********************CHECK IF ALL PO CATEGORIES HAVE BEEN SELECTED FOR EACH PO ITEM & THE RECORDS ARE NOT LOCKED****************/

function  poCatChk(disp,cribConnection) {
  var cribConnect=cribConnection;
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

  new sql.Request(cribConnect)
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
      getVendors(dispatch,cribConnect);
    }
  }).catch(function(err) {
    console.log(`POReqTran NO PO category query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

function getVendors(disp,cribConnection) {
  var dispatch=disp;
  var cribConnect=cribConnection;
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
  new sql.Request(cribConnect)
  .query(qryCrib).then(function(recordset) {
      dispatch({ type:PORTACTION.SET_VENDORS, vendors:recordset });
      getVendorSelect(dispatch,cribConnect);
  }).catch(function(err) {
    console.log(`POReqTran Vendor query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

function getVendorSelect(disp,cribConnection) {
  var dispatch=disp;
  var cribConnect=cribConnection;
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
  new sql.Request(cribConnect)
  .query(qryCrib).then(function(recordset) {
    if(recordset.length!==0){
      console.log("VendorSelect retrieved.");
      var vendorSelect=[];
      recordset.forEach(function(vendor,i,arr){
        vendorSelect.push(vendor.Description);
      });
      dispatch({ type:PORTACTION.SET_VENDOR_SELECT, vendorSelect:vendorSelect });
      portCheck2(dispatch,cribConnect);
    }
  }).catch(function(err) {
    console.log(`POReqTran Vendor Select query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

/*******************CHECK IF PO HAS A VALID VENDOR IN CRIBMASTER****************/

function  portCheck2(disp,cribConnection) {
//    var that = this;
  var dispatch = disp;
  var cribConnect=cribConnection;
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

  new sql.Request(cribConnect)
  .query(qryChk2).then(function(recordset) {
      console.log("portCheck2 query done");
      // error checks
      if(recordset.length!==0){
        console.log("portCheck2 query had records.");
        dispatch({ type:PORTACTION.SET_CHECK2, chk2:PORTCHK.FAILURE });
        dispatch({ type: PORTACTION.SET_NO_CRIB_VEN, noCribVen:recordset });
        dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.STEP_20_FAIL});
      }else {
        dispatch({ type:PORTACTION.SET_CHECK2, chk2:PORTCHK.SUCCESS});
        startCheck3(dispatch);
      }
  }).catch(function(err) {
    console.log(`portCheck2 query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}



function startCheck3(disp) {
//  var that = this;
  var dispatch = disp;
  console.log("startCheck3 top");
  var m2mConnect=sql.connect(m2m).then(function() {
    getM2mVendors(dispatch,m2mConnect);
  }).catch(function(err) {
    console.log(`m2mConnect err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
} 

function getM2mVendors(disp,m2mConnection) {
  var dispatch=disp;
  var m2mConnect=m2mConnection;
  let qryM2m = `
    select av.fvendno, av.fcompany
    from
    (
      SELECT max(fvendno) fvendno, fcompany
      from
      (
        select fvendno, fcompany
        FROM apvend av
        inner join syaddr sa
        on av.fvendno = sa.fcaliaskey
        where fcalias = 'APVEND'
      ) lv1
      group by fcompany
    ) lv2
    inner join
    apvend av
    on lv2.fvendno=av.fvendno
  `;

  console.log("getM2mVendors top");

  // Vendor query
  new sql.Request(m2mConnect)
  .query(qryM2m).then(function(recordset) {
      console.log("getM2mVendors query success");
      dispatch({ type:PORTACTION.SET_M2M_VENDORS, m2mVendors:recordset });
      getM2mVendorSelect(dispatch,m2mConnect);
  }).catch(function(err) {
    console.log(`getM2mVendor query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

function getM2mVendorSelect(disp,m2mConnection){
  var dispatch=disp;
  var m2mConnect=m2mConnection;
  let qryM2m = `
    select 
        rtrim(av.fcompany)  + ' - ' + av.fvendno
        as vendorSelect
    from
    (
      SELECT max(fvendno) fvendno, fcompany
      from
      (
        select fvendno, fcompany
        FROM apvend av
        inner join syaddr sa
        on av.fvendno = sa.fcaliaskey
        where fcalias = 'APVEND'
      ) lv1
      group by fcompany
    ) lv2
    inner join
    apvend av
    on lv2.fvendno=av.fvendno
  `;

  // Vendor query
  new sql.Request(m2mConnect)
  .query(qryM2m).then(function(recordset) {
    if(recordset.length!==0){
      console.log("getM2mVendorSelect query success");
      var m2mVendorSelect=[];
      recordset.forEach(function(vendor,i,arr){
        m2mVendorSelect.push(vendor.vendorSelect);
      });
      dispatch({ type:PORTACTION.SET_M2M_VENDOR_SELECT, m2mVendorSelect:m2mVendorSelect });
      portCheck3(dispatch);
    }
  }).catch(function(err) {
    console.log(`getM2mVendorSelect query err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
}

/*******************CHECK IF PO HAS A VALID VENDOR IN M2M****************/

async function  portCheck3(disp) {
//    var that = this;
  var dispatch = disp;
  var cnt=0;
  initPrime();
  primeDB(dispatch,false);

  while(!isPrimed() && !primeFailed){
    if(++cnt>15){
      break;
    }else{
      await sleep(2000);
    }
  }

  if(!isPrimed()){
    console.log(`cribConnect err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });

    // Exit if Not Primed
    return;
  }

  var cribConnect=sql.connect(crib).then(function() {
    let qryCrib;
    if (prod===true) {
      qryCrib = `
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
      qryCrib = `
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

    new sql.Request(cribConnect)
    .query(qryCrib).then(function(recordset) {
        console.log("portCheck3 query done");
        // error checks
        if(recordset.length!==0){
          console.log("portCheck3 query had records.");
          dispatch({ type:PORTACTION.SET_CHECK3, chk3:PORTCHK.FAILURE });
          dispatch({ type: PORTACTION.SET_NO_M2M_VEN, noM2mVen:recordset });
          dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.STEP_30_FAIL});
        }else {
          dispatch({ type:PORTACTION.SET_CHECK3, chk3:PORTCHK.SUCCESS});
          dispatch({ type:PORTACTION.SET_GO_BUTTON, goButton:'success' });
          dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.SUCCESS });
        }
    }).catch(function(err) {
      console.log(`portCheck3 query err:  ${err.message}` );
      dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
      dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
    });
  }).catch(function(err) {
    console.log(`cribConnect err:  ${err.message}` );
    dispatch({ type:PORTACTION.SET_REASON, reason:err.message });
    dispatch({ type:PORTACTION.SET_STATE, state:PORTSTATE.FAILURE });
  });
} 


//export default POReqTrans;
///export fetchPOCategories;