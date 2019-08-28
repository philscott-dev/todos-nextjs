import React from 'react'
import { render } from '@testing-library/react'
import Todo from '../Todo'
describe('Todo', () => {
  it('works', () => {
    const mock = render(
      <Todo
        id={'1'}
        isComplete={false}
        title={'Title'}
        description={'Description'}
        onClick={() => {}}
        dueDate={new Date().toISOString()}
      />,
    )
    mock.debug()
  })
})
