import React from "react";
import "../styles/CollapseBox.css";

class CollapseBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.toggleBox = this.toggleBox.bind(this);
  }

  toggleBox() {
    this.setState(function (prevState) {
      return { open: !prevState.open };
    });
  }

  render() {
    return (
      <div className="collapse-box">
        <button className="collapse-toggle-btn" onClick={this.toggleBox}>
          <span className={"collapse-arrow" + (this.state.open ? " open" : "")}></span>
          {this.props.title}
        </button>
        <div
          className="collapse-content"
          style={{ display: this.state.open ? "block" : "none" }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

export { CollapseBox }; 