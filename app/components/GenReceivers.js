import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Link,IndexLink } from 'react-router';
import {LinkContainer} from 'react-router-bootstrap';
import GRButton from '../containers/GRButton';
import GRChecks from '../containers/GRChecks';
import * as GRSTATE from "../actions/GRState.js"
import { Grid, Row, Col, Navbar, Nav, NavItem, NavDropdown, MenuItem, Jumbotron,Button} from 'react-bootstrap';
import {Header as NavbarHeader, Brand as NavbarBrand, Toggle as NavbarToggle, Collapse as NavbarCollapse, Text as NavbarText } from 'react-bootstrap/lib/Navbar'
/*
.jumbotron {
    background-color:black !important; 
}
*/

//var initPORT;

export default class GenReceivers extends Component {

  static propTypes = {
    GenR: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.props.prime(true);
    this.state = {
      loading: false
    };
  }

  render() {

  const jbk ={backgroundColor: 'black' };
  const st1 ={backgroundImage: 'url(intro-bg.jpg)', backgroundSize: 'cover'};

  const toppg ={position: 'fixed',top: 0,left: 0};

  const bnr ={backgroundImage: 'url(banner.jpg)', backgroundSize: 'cover', padding: '0px 10px 0px 20px'};
  const belowbnr ={position: 'absolute',top: 80};
  const chk2 ={backgroundColor: 'black' , color: 'green',border: '1px solid blue',   padding: '5px 13px' };
  const dbg1 ={border: '1px solid blue', padding: '0px' };

  var checks,goButton,navbar,cancelBtn,jumboTronTxt,navbarStatus,navbarEnd;

  if(GRSTATE.NOT_PRIMED==this.props.GenR.state){
    jumboTronTxt=
      <Row >
        <Col xs={1}>&nbsp;</Col>
        <Col >
          <Jumbotron  >
             <h1 style={{textAlign: 'center'}}>Connecting to Databases</h1>
            <p style={{textAlign: 'center'}}><strong>Description:{" "}</strong>Attempting to connect to CribMaster and Made2Manage</p>
            <p style={{textAlign: 'center'}}><strong>Please wait...</strong></p> 
            <br/>
          </Jumbotron>
        </Col>
      </Row>
  } else if(GRSTATE.PRIMED==this.props.GenR.state){
    jumboTronTxt=
      <Row >
        <Col xs={1}>&nbsp;</Col>
        <Col >
          <Jumbotron  >
             <h1 style={{textAlign: 'center'}}>Generate Receivers</h1>
            <p style={{padding: '0px'}}>This App generates M2m receivers from items received into Cribmaster. 
            Once the GO! button is clicked this process will start. </p>
             <br/>
          </Jumbotron>
        </Col>
      </Row>
  } else if(
            (GRSTATE.UPTODATE==this.props.GenR.state)
            ){
    jumboTronTxt=
      <Row >
        <Col xs={1}>&nbsp;</Col>
        <Col >
          <Jumbotron  >
            <h1 style={{textAlign: 'center'}}>UpToDate</h1>
            <p style={{padding: '0px',textAlign:'center'}}>There are currently 'NO' PO Items needing received into Made2Manage.</p>
           
          </Jumbotron>
        </Col>
      </Row>
  }

  if(
      (GRSTATE.PRIMED==this.props.GenR.state) ||
      (GRSTATE.STARTED==this.props.GenR.state) 
    )
  {
    goButton = 
    <div>
      <Row >
        <Col xs={1}>&nbsp;</Col>
      </Row>
      <Row>
        <Col xs={1}>&nbsp;</Col>
      </Row>
      <Row>
        <Col xs={5} >&nbsp;</Col>
        <Col xs={2}><GRButton /></Col>
        <Col xs={5}>&nbsp;</Col>
      </Row>
    </div>
  }

  if(
      (GRSTATE.FAILURE==this.props.GenR.state) 
    )
  {
    cancelBtn = 
    <div>
      <Row>
        <Col xs={1}>&nbsp;</Col>
      </Row>

      <Row>
        <Col xs={5} >&nbsp;</Col>
        <Col xs={2}><Button  onClick={this.props.cancelApp} bsSize="large" bsStyle="warning">Cancel</Button></Col>
        <Col xs={5}>&nbsp;</Col>
      </Row>
    </div>
  }
  if(
      (GRSTATE.PRIMED==this.props.GenR.state) || 
      (GRSTATE.UPTODATE==this.props.GenR.state) ||  
      (GRSTATE.SUCCESS==this.props.GenR.state)   
    )
  {
    navbar =
      <Navbar inverse fixedBottom>
        <NavbarHeader>
          <NavbarBrand >
            <IndexLink to="/" onClick={this.props.cancelApp} >Home
            </IndexLink>
          </NavbarBrand>
          <NavbarToggle />
        </NavbarHeader>
        <NavbarCollapse>
          <Nav>
            <LinkContainer to="/POReqTrans">
              <NavItem eventKey={1}>PO Request Transfer</NavItem>
            </LinkContainer>      
          </Nav>
        </NavbarCollapse>

      </Navbar>;
  }else{
    navbar =
      <Navbar inverse fixedBottom>
        <NavbarCollapse>
          <span className="navbar-center">{this.props.GenR.status}</span>
        </NavbarCollapse>
      </Navbar>;

  }


    return (

      <div  >
        <Grid >
          {jumboTronTxt}
          {goButton}
          {navbar}
        </Grid>
      </div>

    );
  }
}



/*
  if(
      (GRSTATE.STARTED==this.props.GenR.state) 
    )
  {
    checks = 
    <div>
      <Row >
        <Col xs={1}>&nbsp;</Col>
      </Row>
      <Row>
        <Col xs={1}>&nbsp;</Col>
      </Row>

      <Row >
        <Col xs={4}></Col>
        <Col xs={4}><GRChecks /></Col>
        <Col xs={4}></Col>
      </Row>
    </div>;
  } 


*/