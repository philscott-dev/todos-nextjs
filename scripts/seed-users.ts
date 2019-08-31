/* eslint-disable import/first */
require('dotenv-extended').load()
import 'reflect-metadata'
import faker from 'faker'
import bcrypt from 'bcryptjs'
import Progress from 'progress'
import { getRepository, createConnection } from 'typeorm'
import typeOrmOptions from '../server/db.config'
import User from '../models/user.model'

const DEFAULT_PASSWORD = 'default'
const USER_COUNT = 100

const bar = new Progress('Creating Users: [:bar] :current/:total', {
  complete: '=',
  incomplete: ' ',
  width: 20,
  total: USER_COUNT,
})

async function main() {
  try {
    await createConnection(typeOrmOptions)

    for (let i = 0; i < USER_COUNT; i++) {
      const userRepo = getRepository(User)
      const user = await userRepo.create()
      user.name = `${faker.name.firstName()}${faker.random.number(100)}`
      user.lastLoginDate = new Date()
      user.password = await bcrypt.hash(DEFAULT_PASSWORD, 10)
      await userRepo.save(user)
      bar.tick()
    }
  } catch (err) {
    console.error(err)
  }
}

main()
