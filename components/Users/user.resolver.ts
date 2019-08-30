import { gql, InMemoryCache } from 'apollo-boost'
import { IUser } from '../../models/user.model'

const GET_SELECTED_USER = gql`
  query GetSelectedUser {
    selectedUser @client
  }
`

const updateUserFragment = (
  cache: InMemoryCache,
  id: string,
  isSelected: boolean,
) => {
  cache.writeFragment({
    id: `User:${id}`,
    fragment: gql`
      fragment user on User {
        isSelected
      }
    `,
    data: {
      __typename: 'User',
      isSelected,
    },
  })
}

interface ActiveUserResults {
  selectedUser: string
}

const userResolver = {
  Mutation: {
    setSelectedUser: (
      _: any,
      { user }: { user: IUser },
      { cache }: { cache: InMemoryCache },
    ) => {
      const selectedUser = cache.readQuery<ActiveUserResults>({
        query: GET_SELECTED_USER,
      })!.selectedUser

      updateUserFragment(cache, selectedUser, false)
      updateUserFragment(cache, user.id, true)

      cache.writeData({ data: { selectedUser: user.id } })
      return null
    },
  },
  User: {
    isSelected: (
      user: IUser,
      _variables: any,
      { cache }: { cache: InMemoryCache },
    ) => {
      const selectedUser = cache.readQuery<ActiveUserResults>({
        query: GET_SELECTED_USER,
      })!.selectedUser
      return selectedUser === user.id
    },
  },
}

export default userResolver
