import React, { Component } from "react";

import {
  STATUS,
  Loading,
  Avatar,
  Logo,
  Logotype,
  Container,
  Header
} from "gh-components";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";

import Avatar from "./Avatar";
import Repositories from "./Repositories";

const CLIENT_ID = "3e41f689f18e4604b3a8";
const REDIRECT_URI = "http://localhost:3000/";

const client = new ApolloClient({
  uri: "https://api.github.com/graphql",
  request: operation => {
    const token = localStorage.getItem("github_token");
    if (token) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
    }
  }
});

class App extends Component {
  state = {
    status: STATUS.INITIAL,
    token: null
  };
  componentDidMount() {
    const code =
      window.location.href.match(/?code=(.*)/) &&
      window.location.href.match(/?code=(.*)/)[1];
    console.log(code);
    if (code) {
      this.setState({ status: STATUS.LOADING });
      fetch(`https://gh-clone.herokuapp.com/authenticate/${code}`)
        .then(response => response.json())
        .then(({ token }) => {
          this.setState({
            token,
            status: STATUS.FINISHED_LOADING
          });
        });
    }
  }
  render() {
    return (
      <ApolloProvider client={client}>
        <Container>
          <Header>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Logo />
              <Logotype />
            </div>
            <Avatar
              style={{
                transform: `scale(${
                  this.state.status === STATUS.AUTHENTICATED ? "1" : "0"
                })`
              }}
            />
            <a
              href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user&redirect_uri=${REDIRECT_URI}`}
            >
              Login
            </a>
          </Header>
          <Loading
            status={this.state.status}
            callback={() => {
              if (this.props.status !== STATUS.AUTHENTICATED) {
                this.setState({
                  status: STATUS.AUTHENTICATED
                });
              }
            }}
          />
          {this.state.status === STATUS.AUTHENTICATED && <Repositories />}
        </Container>
      </ApolloProvider>
    );
  }
}

export default App;