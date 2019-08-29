import React from 'react'
import styled from '@emotion/styled'
import InfiniteLoader from 'react-window-infinite-loader'
import { FixedSizeList as List } from 'react-window'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
// import { IUser } from '../../models/user.model'
import User from './User'

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

// interface IClientUser extends IUser {
//   isSelected: boolean
// }

const UserList = (props: any) => {
  const { loading, data, fetchMore } = useQuery(GET_USERS, {
    variables: { limit: 10 },
  })
  const [setSelectedUser] = useMutation(SET_SELECTED_USER)

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

  const isItemLoaded = (index: number): boolean => {
    console.log(index)
    return true
  }

  if (loading) return <p>Loading...</p>

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
            height={150}
            itemCount={data.users.payload.length}
            itemSize={72}
            onItemsRendered={onItemsRendered}
            width={300}
          >
            {({ index, style }) => {
              const user = data.users.payload[index]
              return (
                <User
                  style={style}
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

// <Scrollable>
//       { data.users.payload.length
//         ? data.users.payload.map((user: IClientUser) => (
//           <User
//             key={user.id}
//             name={user.name}
//             photo={user.photo}
//             isSelected={user.isSelected || false}
//             onClick={()=> handleSetActiveUser(user.name)}
//           />))
//         : <PlaceholderText>
//             No users yet. Make an account!
//           </PlaceholderText>
//       }
//     </Scrollable>

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

// const Scrollable = styled.div`
//   display: flex;
//   flex-direction: column;
//   overflow-y: auto;
//   max-height: 700px;
//   min-height: 700px;
// `

// const PlaceholderText = styled.p`
//   font-family: 'Poppins Light';
//   color: rgba(252, 252, 252, 0.5);
// `

export default UserList
