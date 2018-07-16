import React, { Fragment } from "react";
import { gql } from "apollo-boost";
import { graphql } from "react-apollo";
import {
  Repositories,
  RepositoriesPlaceholder,
  LoadMoreButton
} from "gh-components";

const GET_REPOSITORIES = gql`
  query($after: String) {
    search(
      type: REPOSITORY
      query: "language:Javascript"
      first: 10
      after: $after
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        ... on Repository {
          id
          nameWithOwner
          url
          descriptionHTML
        }
      }
    }
  }
`;

class RepositoriesWrapper extends React.Component {
  render() {
    if (this.props.error) {
      return (
        <div style={{ padding: 20 }}>
          <p>Failed to load repositories</p>
          <a href="/">Refresh Page</a>
        </div>
      );
    }
    if (this.props.loading && !this.props.repositories) {
      return <RepositoriesPlaceholder />;
    }
    if (this.props.loading) {
      return (
        <Fragment>
          <Repositories repositories={this.props.repositories} />
          <RepositoriesPlaceholder />
          <LoadMoreButton loadMore={this.props.loadMore} />
        </Fragment>
      );
    }
    return (
      <Fragment>
        <Repositories repositories={this.props.repositories} />
        <LoadMoreButton loadMore={this.props.loadMore} />
      </Fragment>
    );
  }
}

export default graphql(GET_REPOSITORIES, {
  props: ({ data: { error, loading, search, fetchMore } }) => {
    return {
      repositories: search ? search.nodes : null,
      loading,
      error,
      loadMore: () =>
        fetchMore({
          variables: { after: search.pageInfo.endCursor },
          updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
            const previousSearch = previousResult.search || {};
            const currentSearch = fetchMoreResult.search || {};
            const previousNodes = previousSearch.nodes || [];
            const currentNodes = currentSearch.nodes || [];
            return {
              ...previousResult,
              search: {
                ...previousSearch,
                nodes: [...previousNodes, ...currentNodes],
                pageInfo: currentSearch.pageInfo
              }
            };
          }
        })
    };
  },
  options: {
    notifyOnNetworkStatusChange: true
  }
})(RepositoriesWrapper);