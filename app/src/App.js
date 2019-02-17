import React, { Component } from 'react';
import './App.css';
import ReactChartkick, { PieChart } from 'react-chartkick'
import Chart from 'chart.js'
ReactChartkick.addAdapter(Chart)

const  S3 = require('aws-sdk/clients/s3');
const client = new S3({
  region: '<< your region here >>',
  secretAccessKey: '<< your secretaccesskey code here >>',
  accessKeyId: '<< your accesskeyId here',
  sessionToken: '<< your session token code here >>'});

const params = {
	Bucket: '<< bucket name here >>',
	Key: 'API_EN.ATM.CO2E.PC_DS2_en_csv_v2_10474024.csv',
  ExpressionType: 'SQL',
  Expression: 'select p._1, p._57 from s3object p limit 20',

	InputSerialization: {
		CSV: {
			// FileHeaderInfo: 'USE',
			// RecordDelimiter: '\n',
			// FieldDelimiter: ','
		}
	},
	OutputSerialization: {
		CSV: {}
	}
};


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectData: '',
    }
    
  }
  componentDidMount() {

    client.selectObjectContent(params, (err, data) => {
      if (err) {
        console.log(err)
        switch (err.name) {
        }
        return '';
      }
      const events = data.Payload;
      let string = ''
      for (const event of events) {
        if (event.Records) {
          string = event.Records.Payload.toString()
          console.log(string)
        } else if (event.Stats) {
          console.log(`Processed ${event.Stats.Details.BytesProcessed} bytes`);
        } else if (event.End) {
          console.log('SelectObjectContent completed');
        }
      }
      this.setState({selectData: string})
    });
  }

  jsonify(data) {
    let set = data.split('\n')
    const json={}
    for (let i = 5; i < set.length; i++) {
      json[set[i].split(',')[0]] = set[i].split(',')[1]
    }
    return json
  }


  render() {
    const json = this.jsonify(this.state.selectData)
    console.log(json)
    return (
      <div className="App">
        <h2>CO2 emissions 2017</h2>
        <PieChart data={json} />

      </div>
    );
  }
}

export default App;
