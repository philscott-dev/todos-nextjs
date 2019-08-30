/* eslint-disable import/first */
require('dotenv-extended').load()
import 'reflect-metadata'
import faker from 'faker'
import bcrypt from 'bcryptjs'
import { getRepository } from 'typeorm'
import User from '../models/user.model'
import { createConnection } from 'typeorm'
import typeOrmOptions from '../server/db.config'

const DEFAULT_PASSWORD = 'scott'

async function main() {
  try {
    await createConnection(typeOrmOptions)

    for (let i = 0; i < 100; i++) {
      const userRepo = getRepository(User)
      const user = await userRepo.create()
      user.name = faker.name.firstName()
      user.photo = 'default'
      user.lastLoginDate = new Date()
      user.password = await bcrypt.hash(DEFAULT_PASSWORD, 10)
      await userRepo.save(user)
    }
  } catch (err) {
    console.error(err)
  }
}

main()
