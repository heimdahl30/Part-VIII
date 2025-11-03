const typeDefs = `
type Book {
title: String!
author: Author!
published: Int!
genres: [String!]! 
_id: ID! 
},

type Author {
name: String!
id: ID!
born: Int
bookCount: Int
}

type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

type Mutation {
  addBook(
    title: String!
    author: String!
    published: String!
    genres: [String!]!
  ): Book,
  editAuthor(
    name: String
    setBornTo: String
) : Author,
 createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}

type Subscription {
  bookAdded: Book!
}
`;

export default typeDefs;
