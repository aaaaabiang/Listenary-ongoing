import React from "react";
import "../styles/CollapseBox.css";

// [fix] 定义 props 和 state 的类型
type Props = {
  title: string;          // 标题文字
  children?: React.ReactNode; // 折叠内容
};

type State = {
  open: boolean;          // 是否展开
};

class CollapseBox extends React.Component<Props, State> { // 泛型参数
  constructor(props: Props) { // 给 constructor 指定 props 类型
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