import imageToTextDecoder from 'image-to-text';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './index.css';

const KEY = '6NtMETDTgmia8rWbyzWMJQ';

class Test extends Component {
  constructor(props) {
    super(props);
    imageToTextDecoder.setAuth(KEY);

    this.state = {
      file: null,
      keywords: '',
    };

    this.preventDefault = this.preventDefault.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleImage = this.handleImage.bind(this);
  }

  preventDefault(event) {
    event.preventDefault();
  }

  handleChange(event) {
    this.handleImage(event.target.files[0]);
  }

  handleDrop(event) {
    event.preventDefault();
    this.handleImage(event.dataTransfer.files[0]);
  }

  handleImage(f) {
    const file = {
      name: f.name,
      path: f.path.slice(0, f.path.length - f.name.length),
    };
    const fileURL = URL.createObjectURL(f);

    this.setState({
      file: fileURL,
      keywords: 'Processing Image...',

    });

    imageToTextDecoder.getKeywordsForImage(file)
      .then(keywords => {
        this.setState({ keywords: keywords });
      }, () => {
        this.setState({ keywords: 'Image Not Read!' });
      })
      .catch(() => {
        this.setState({ keywords: 'Image Not Read!' });
      });
  }

  render() {
    return (
      <div>
        <div id='drop' onDragOver={this.preventDefault} onDrop={this.handleDrop}>
          <p>Drop files here!</p>
          <input type='file' onChange={this.handleChange} />
        </div>
        <img src={this.state.file} />

        <center><p>Text: {this.state.keywords}</p></center>


      </div>
    );
  }
}

Test.propTypes = {
  link: PropTypes.string,
};

ReactDOM.render(<Test />, document.querySelector('#app'));
