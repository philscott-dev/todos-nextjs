import React from 'react'
import styled from '@emotion/styled'
import InfiniteLoader from 'react-window-infinite-loader'
import { FixedSizeList as List } from 'react-window'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import User from './User'

const GUTTER_SIZE = 16

// Query for User List
export const GET_USERS = gql`
  query GetUsers($page: Int, $limit: Int) {
    users(limit: $limit, page: $page) {
      totalCount
      count
      page
      pageCount
      payload {
        isSelected @client
        id
        createdDate
        updatedDate
        name
        photo
      }
    }
  }
`

//  Mutation for Client-Side Mutation
const SET_SELECTED_USER = gql`
  mutation SetSelectedUser($name: String!) {
    setSelectedUser(name: $name) @client
  }
`

const UserList = (props: any) => {
  const [setSelectedUser] = useMutation(SET_SELECTED_USER)
  const { loading, data, fetchMore } = useQuery(GET_USERS, {
    variables: { limit: 10 },
  })

  const handleSetActiveUser = (name: string) => {
    setSelectedUser({
      variables: { name },
      refetchQueries: [
        {
          query: GET_USERS,
        },
      ],
    }).then(() => {
      props.onSelectUser(name)
    })
  }

  const handleFetchMore = (startIndex: number, stopIndex: number) => {
    console.log(startIndex, stopIndex)
    if (loading) return new Promise((resolve) => resolve())
    return fetchMore({
      variables: { limit: 10 },
      updateQuery: (prev, { fetchMoreResult }) => {
        //keep the prev results since we're using window-infinite-loader
        return [...prev, fetchMoreResult]
      },
    })
  }

  //Todo: Really fix this
  const isItemLoaded = (index: number): boolean => {
    if (typeof index) {
      return true
    }
    return true
  }

  if (!data || loading) return <p>Loading...</p>

  return (
    <Container>
      <Title>Users</Title>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={data.users.payload.length}
        loadMoreItems={handleFetchMore}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            className="List"
            itemCount={data.users.payload.length}
            itemSize={72 + GUTTER_SIZE}
            onItemsRendered={onItemsRendered}
            height={150}
            width={'100%'}
          >
            {({ index, style }) => {
              const user = data.users.payload[index]
              return (
                <User
                  style={{
                    ...style,
                    paddingTop: GUTTER_SIZE,
                    paddingBottom: GUTTER_SIZE,
                    height: parseInt(String(style.height)) - GUTTER_SIZE,
                  }}
                  name={user.name}
                  isSelected={user.isSelected || false}
                  onClick={() => handleSetActiveUser(user.name)}
                />
              )
            }}
          </List>
        )}
      </InfiniteLoader>
    </Container>
  )
}

const Title = styled.h1`
  font-family: 'Poppins Light';
  font-weight: 300;
  font-size: 36px;
  height: 36px;
  margin: 0 0 24px 0;
  color: #fcfcfc;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

// const PlaceholderText = styled.p`
//   font-family: 'Poppins Light';
//   color: rgba(252, 252, 252, 0.5);
// `

export default UserList
