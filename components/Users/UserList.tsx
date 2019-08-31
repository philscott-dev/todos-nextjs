import React from 'react'
import styled from '@emotion/styled'
import InfiniteLoader from 'react-window-infinite-loader'
import User from './User'
import { FixedSizeList as List } from 'react-window'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { IUser } from '../../models/user.model'

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
  mutation SetSelectedUser($user: User!) {
    setSelectedUser(user: $user) @client
  }
`

const UserList = (props: any) => {
  const [setSelectedUser] = useMutation(SET_SELECTED_USER)

  const { loading, data, fetchMore } = useQuery(GET_USERS, {
    variables: { limit: 10, page: 1 },
  })

  const handleSetActiveUser = (user: IUser) => {
    setSelectedUser({
      variables: { user: user },
    }).then(() => {
      props.onSelectUser(user.name)
    })
  }

  const loadMoreItems = (_startIndex: number, _stopIndex: number) => {
    if (loading) return new Promise((resolve) => resolve())
    const prevPage = parseInt(data.users.page, 10)
    return fetchMore({
      variables: { limit: 10, page: prevPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        const users = {
          ...prev.users,
          ...fetchMoreResult.users,
          payload: [...prev.users.payload, ...fetchMoreResult.users.payload],
        }
        return { users }
      },
    })
  }

  //Todo: Really fix this
  const isItemLoaded = (index: number): boolean => {
    return index < data.users.payload.length
  }

  if (!data || loading) return <p>Loading...</p>
  const { payload, totalCount } = data.users

  const itemCount =
    payload.length < totalCount ? payload.length + 1 : payload.length

  return (
    <Container>
      <Title>Users</Title>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            className="List"
            itemCount={itemCount}
            itemSize={72 + GUTTER_SIZE}
            onItemsRendered={onItemsRendered}
            height={750}
            width={'100%'}
          >
            {({ index, style }) => {
              const user = data.users.payload[index]
              return !isItemLoaded(index) ? (
                <p>Loading...</p>
              ) : (
                <User
                  isLoaded={!isItemLoaded(index)}
                  style={{
                    ...style,
                    paddingTop: GUTTER_SIZE,
                    paddingBottom: GUTTER_SIZE,
                    height: parseInt(String(style.height)) - GUTTER_SIZE,
                  }}
                  name={user.name}
                  isSelected={user.isSelected || false}
                  onClick={() => handleSetActiveUser(user)}
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
