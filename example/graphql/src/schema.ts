export const GetUsers = `users: [User]`

export const CreateUser = `createUser(name: String!): User`

export const User = `
  type User {
    id: ID!
    name: String!
  }`