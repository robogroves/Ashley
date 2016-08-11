import React from 'react';
import Select from 'react-select';
import fetch from 'isomorphic-fetch';
import POUpdateAPI from '../api/POUpdate';


const POCategories = React.createClass({

	displayName: 'POCategories',
	propTypes: {
		label: React.PropTypes.string,
	},

	getInitialState () {
		return {
			multi: false
		};
	},
	onChange (value) {
		this.props.rowData.UDF_POCATEGORY = value.UDF_POCATEGORY;
		this.setState({
			value: value,
		});
	},
	switchToMulti () {
		this.setState({
			multi: true,
			value: [this.state.value],
		});
	},
	switchToSingle () {
		this.setState({
			multi: false,
			value: this.state.value ? this.state.value[0] : null
		});
	},
	getUsers (input,callBack) {
      var that = this;
	  POUpdateAPI.getPOCategories.call(that,callBack);
	},
	gotoUser (value, event) {
		window.open(value.html_url);
	},
	/*
	render () {
		return (
			<div className="section">
				<h3 className="section-heading">{this.props.label}</h3>
				<Select.Async multi={this.state.multi} value={this.state.value} onChange={this.onChange} onValueClick={this.gotoUser} valueKey="UDF_POCATEGORY" labelKey="descr" loadOptions={this.getUsers} minimumInput={1} backspaceRemoves={false} />
			</div>
		);
	}


	*/
	render () {
		return (
			<div className="section">
				<h3 className="section-heading">{this.props.label}</h3>

<Select.Async
	asyncOptions={getOptions}
    name="form-field-name"
/>
			</div>
		);
	}
});

module.exports = POCategories;