import React, { useState } from 'react'
import Router from 'next/router'
import cookie from 'cookie'
import { useMutation, useApolloClient } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { UserList } from '../components/Users'
import { Instructions } from '../components/Instructions'
import { IFormData } from '../components/FormElements/Form'
import {
  Form,
  Input,
  SubmitButton,
  StyledInput,
} from '../components/FormElements'

// Mutation for Login or Create
const LOGIN_OR_CREATE = gql`
  mutation LoginOrCreate($name: String!, $password: String!, $photo: String) {
    loginOrCreate(name: $name, password: $password, photo: $photo) {
      expiresIn
      token
    }
  }
`

// React Component
const Index = () => {
  const client = useApolloClient()
  const [loginOrCreate] = useMutation(LOGIN_OR_CREATE)
  const [username, setUsername] = useState('')

  const handleLogin = async (variables: IFormData[]) => {
    try {
      const res = await loginOrCreate({
        variables: { ...variables, name: username },
      })
      const { token, expiresIn } = res.data.loginOrCreate
      document.cookie = await cookie.serialize('authorization', token, {
        maxAge: expiresIn,
        path: '/',
      })
      client.cache.reset().then(() => Router.replace('/todos/list'))
    } catch (err) {
      console.log(err)
    }
  }

  const handleUsernameUpdate = (name: string) => {
    setUsername(name)
  }

  return (
    <>
      <div className="row">
        <div className="col-sm-2">
          <Instructions />
        </div>
        <div className="col-sm-1" />
        <div className="col-sm-3">
          <UserList onSelectUser={handleUsernameUpdate} />
        </div>
        <div className="col-sm-3">
          <Form title={'Login'} onSubmit={handleLogin}>
            <StyledInput
              type="text"
              name="name"
              placeholder="Name"
              value={username}
              onChange={(e) => handleUsernameUpdate(e.target.value)}
            />
            <Input name="password" placeholder={'Password'} type="password" />
            <SubmitButton text={'Login'} />
          </Form>
        </div>
        <div className="col-xl-3" />
      </div>
    </>
  )
}

export default Index
