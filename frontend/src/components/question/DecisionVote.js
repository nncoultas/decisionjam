import React, { Component } from "react";
import axios from "axios";

const ROOT_URL = "http://localhost:8000";

class DecisionVote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      answersArray: [],
      maxVotesPerUser: 1,
      decisionCreatorId: "",
      currentLoggedInUserId: "",
      isCreator: false,
      username: "",
      decisionCode: this.props.decisionCode,
      jwtToken: localStorage.getItem("token")
    };
  }

  componentDidMount() {
    const decisionCode = this.state.decisionCode;
    const headers = {
      "Content-Type": "application/json",
      Authorization: this.state.jwtToken
    };
    axios
      .get(`${ROOT_URL}/api/decision/${decisionCode}`, { headers })
      .then(res => {
        console.log("res", res);
        // console.log("res.data.votesByUser", res.data.votesByUser);
        if (res.data.decisionCreatorId === res.data.currentLoggedInUserId) {
          this.setState({ isCreator: true });
        }
        this.setState({
          decision: res.data.decisionText,
          answersArray: res.data.answers,
          maxVotesPerUser: res.data.maxVotesPerUser,
          votesByUser: res.data.votesByUser,
          username: res.data.username
        });
      })

      .catch(error => {
        this.setState({ error: error.response.data.error });
      });
  }

  handleAnswerInput = e => {
    e.preventDefault();
    this.setState({ newAnswer: e.target.value });
  };

  handleUpvote(answerId, e) {
    this.handleVote("YES", answerId);
  }

  handleDownvote(answerId, e) {
    this.handleVote("NO", answerId);
  }

  handleVote(upOrDown, answerId) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: this.state.jwtToken
    };
    axios
      .put(
        `${ROOT_URL}/api/decision/answer/${answerId}/vote?vote=${upOrDown}`,
        "",
        { headers }
      )
      .then(res => {
        // console.log("res", res);
        this.setState({
          ...this.state,
          answersArray: res.data.answers,
          votesByUser: res.data.votesByUser
        });
      })
      .catch(error => console.log("error", error.response));
  }

  areVotesDisabled() {
    return this.state.votesByUser >= this.state.maxVotesPerUser;
  }

  sendMaxVotes(newValue) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: this.state.jwtToken
    };
    // console.log(newValue);
    axios
      .put(
        `${ROOT_URL}/api/decision/${
          this.state.decisionCode
        }/maxVotesPerUser?newValue=${newValue}`,
        {},
        { headers }
      )
      .then(res => {
        // console.log("res", res);
        this.setState({});
      })
      .catch(error => console.log("error", error.response));
  }

  onMaxVotesClickDown = () => {
    // const decisionCode = this.state.decisionCode;
    if (this.state.maxVotesPerUser <= 0) {
      return;
    }
    this.setState({ maxVotesPerUser: this.state.maxVotesPerUser - 1 });
    this.sendMaxVotes(this.state.maxVotesPerUser - 1);
  };

  onMaxVotesClickUp = () => {
    // const decisionCode = this.state.decisionCode;
    this.setState({ maxVotesPerUser: this.state.maxVotesPerUser + 1 });
    this.sendMaxVotes(this.state.maxVotesPerUser + 1);
  };

  render() {
    //console.log("this.props", this.props);
    // console.log("this.state", this.state);
    const answersArray = this.state.answersArray.length;
    // console.log("this.state.votesByUser", this.state.votesByUser);
    // console.log("this.state.maxVotesPerUser", this.state.maxVotesPerUser);

    // console.log(this.state.answersArray);

    let allFilteredUsernames = [];
    for (let i = 0; i < this.state.answersArray.length; i++) {
      let filteredUsernames = this.state.answersArray[i].upVotes.filter(
        username => username === this.state.username
      );
      console.log("filteredUsernames.length", filteredUsernames.length);
      allFilteredUsernames.push(filteredUsernames.length);
    }
    console.log("allFilteredUsernames", allFilteredUsernames);

    return (
      <div className="post-container">
        <div className="maxvotes-container">
          <div className="maxVotes">
            <div>Max votes per person</div>
            {this.state.isCreator ? (
              <button onClick={this.onMaxVotesClickDown}>-</button>
            ) : (
              ""
            )}

            <div>{this.state.maxVotesPerUser}</div>
            {this.state.isCreator ? (
              <button onClick={this.onMaxVotesClickUp}>+</button>
            ) : (
              ""
            )}
          </div>
          <div>Total Votes</div>
          <div>
            Your Votes{this.state.votesByUser}/{this.state.maxVotesPerUser}
          </div>
        </div>
        <div className="answers-container">
          {answersArray === 0 ? (
            <div className="no-answer">There are no answers yet. </div>
          ) : (
            <div>
              {this.state.answersArray.map((answer, i) => (
                <div className="answer-container" key={answer._id}>
                  <div className="answer-text">{answer.answerText}</div>
                  <button
                    onClick={this.handleDownvote.bind(this, answer._id)}
                    disabled={this.areVotesDisabled() ? "disabled" : false}
                  >
                    -
                  </button>
                  <div>{allFilteredUsernames[i]}</div>
                  <button
                    onClick={this.handleUpvote.bind(this, answer._id)}
                    disabled={this.areVotesDisabled() ? "disabled" : false}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default DecisionVote;
